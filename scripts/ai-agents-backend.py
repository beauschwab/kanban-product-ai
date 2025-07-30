import asyncio
import json
import sqlite3
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
import websockets
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from pydantic import BaseModel
import uvicorn
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Google AI
genai.configure(api_key=os.getenv("GOOGLE_AI_API_KEY", "your-google-ai-api-key"))

app = FastAPI(title="AI Agents Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
def get_db_connection():
    conn = sqlite3.connect("kanban.db")
    conn.row_factory = sqlite3.Row
    return conn

# Pydantic models
class TaskAssignmentRequest(BaseModel):
    task_id: int
    task_title: str
    task_description: str
    priority: str
    category: str

class AgentResponse(BaseModel):
    agent_id: str
    agent_name: str
    response: str
    confidence: float
    reasoning: str

class TaskAnalysis(BaseModel):
    complexity: str
    estimated_hours: float
    required_skills: List[str]
    recommended_agent: str

# AI Agent Classes
class BaseAIAgent:
    def __init__(self, agent_id: str, name: str, specialization: str, model_name: str = "gemini-pro"):
        self.agent_id = agent_id
        self.name = name
        self.specialization = specialization
        self.model = genai.GenerativeModel(model_name)
        self.current_tasks = []
        self.max_concurrent_tasks = 3
        
    async def analyze_task(self, task: Dict[str, Any]) -> TaskAnalysis:
        """Analyze a task and provide complexity assessment"""
        prompt = f"""
        As an AI agent specialized in {self.specialization}, analyze this task:
        
        Title: {task['title']}
        Description: {task['description']}
        Priority: {task['priority']}
        
        Provide analysis in this format:
        - Complexity: [low/medium/high]
        - Estimated Hours: [number]
        - Required Skills: [comma-separated list]
        - Recommended Agent Type: [frontend/backend/fullstack/devops]
        
        Consider the technical requirements, scope, and potential challenges.
        """
        
        try:
            response = await self.model.generate_content_async(prompt)
            analysis_text = response.text
            
            # Parse the response (simplified parsing)
            lines = analysis_text.strip().split('\n')
            complexity = "medium"
            estimated_hours = 4.0
            required_skills = ["General Development"]
            recommended_agent = "fullstack"
            
            for line in lines:
                if "Complexity:" in line:
                    complexity = line.split(":")[-1].strip().lower()
                elif "Estimated Hours:" in line:
                    try:
                        estimated_hours = float(line.split(":")[-1].strip())
                    except:
                        estimated_hours = 4.0
                elif "Required Skills:" in line:
                    skills_text = line.split(":")[-1].strip()
                    required_skills = [skill.strip() for skill in skills_text.split(',')]
                elif "Recommended Agent Type:" in line:
                    recommended_agent = line.split(":")[-1].strip().lower()
            
            return TaskAnalysis(
                complexity=complexity,
                estimated_hours=estimated_hours,
                required_skills=required_skills,
                recommended_agent=recommended_agent
            )
        except Exception as e:
            logger.error(f"Error analyzing task: {e}")
            return TaskAnalysis(
                complexity="medium",
                estimated_hours=4.0,
                required_skills=["General Development"],
                recommended_agent="fullstack"
            )
    
    async def can_accept_task(self, task: Dict[str, Any]) -> bool:
        """Check if agent can accept a new task"""
        if len(self.current_tasks) >= self.max_concurrent_tasks:
            return False
        
        analysis = await self.analyze_task(task)
        return self.specialization.lower() in analysis.recommended_agent.lower()
    
    async def accept_task(self, task: Dict[str, Any]) -> AgentResponse:
        """Accept and start working on a task"""
        self.current_tasks.append(task['id'])
        
        prompt = f"""
        You are {self.name}, an AI agent specialized in {self.specialization}.
        You have just been assigned this task:
        
        Title: {task['title']}
        Description: {task['description']}
        Priority: {task['priority']}
        
        Provide a brief response acknowledging the task and outlining your initial approach.
        Be professional and specific about your planned steps.
        """
        
        try:
            response = await self.model.generate_content_async(prompt)
            
            return AgentResponse(
                agent_id=self.agent_id,
                agent_name=self.name,
                response=response.text,
                confidence=0.85,
                reasoning=f"Task matches my {self.specialization} specialization"
            )
        except Exception as e:
            logger.error(f"Error accepting task: {e}")
            return AgentResponse(
                agent_id=self.agent_id,
                agent_name=self.name,
                response=f"I'll work on '{task['title']}' using my {self.specialization} expertise.",
                confidence=0.7,
                reasoning="Default response due to API error"
            )
    
    async def provide_update(self, task_id: int) -> str:
        """Provide a progress update on a task"""
        if task_id not in self.current_tasks:
            return "I'm not currently working on this task."
        
        # Get task details from database
        conn = get_db_connection()
        task = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
        conn.close()
        
        if not task:
            return "Task not found."
        
        prompt = f"""
        As {self.name}, provide a realistic progress update for this task:
        
        Title: {task['title']}
        Description: {task['description']}
        
        The task is currently in progress. Provide a brief, realistic update about:
        - Current progress
        - Any challenges encountered
        - Next steps
        - Estimated completion time
        
        Keep it professional and concise.
        """
        
        try:
            response = await self.model.generate_content_async(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Error providing update: {e}")
            return f"Working on {task['title']}. Making steady progress on the {self.specialization} aspects."

class CoordinatorAgent(BaseAIAgent):
    def __init__(self):
        super().__init__("coordinator", "AI Coordinator", "Task Management and Assignment", "gemini-pro")
        self.specialist_agents = {}
    
    def register_agent(self, agent: BaseAIAgent):
        """Register a specialist agent"""
        self.specialist_agents[agent.agent_id] = agent
    
    async def assign_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Intelligently assign a task to the best available agent"""
        
        # Analyze the task first
        analysis = await self.analyze_task(task)
        
        # Find the best agent for this task
        best_agent = None
        best_score = 0
        
        for agent in self.specialist_agents.values():
            if await agent.can_accept_task(task):
                # Calculate compatibility score
                score = 0
                if agent.specialization.lower() in analysis.recommended_agent.lower():
                    score += 50
                
                # Prefer agents with fewer current tasks
                workload_factor = (agent.max_concurrent_tasks - len(agent.current_tasks)) / agent.max_concurrent_tasks
                score += workload_factor * 30
                
                # Add some randomness for variety
                score += 20
                
                if score > best_score:
                    best_score = score
                    best_agent = agent
        
        if best_agent:
            response = await best_agent.accept_task(task)
            
            # Update database
            conn = get_db_connection()
            conn.execute(
                "UPDATE tasks SET assignee = ? WHERE id = ?",
                (best_agent.name, task['id'])
            )
            conn.commit()
            conn.close()
            
            return {
                "success": True,
                "assigned_agent": best_agent.name,
                "agent_response": response.response,
                "analysis": analysis.dict()
            }
        else:
            return {
                "success": False,
                "reason": "No available agents can handle this task",
                "analysis": analysis.dict()
            }

# Initialize AI Agents
coordinator = CoordinatorAgent()

# Specialist Agents
frontend_agent = BaseAIAgent("frontend_specialist", "Sarah AI", "Frontend Development")
backend_agent = BaseAIAgent("backend_specialist", "Mike AI", "Backend Development") 
fullstack_agent = BaseAIAgent("fullstack_specialist", "Alex AI", "Full-Stack Development")
devops_agent = BaseAIAgent("devops_specialist", "Emma AI", "DevOps and Infrastructure")

# Register agents with coordinator
coordinator.register_agent(frontend_agent)
coordinator.register_agent(backend_agent)
coordinator.register_agent(fullstack_agent)
coordinator.register_agent(devops_agent)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"Client connected. Total connections: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"Client disconnected. Total connections: {len(self.active_connections)}")
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)
    
    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                # Remove dead connections
                self.active_connections.remove(connection)

manager = ConnectionManager()

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message["type"] == "task_assignment":
                # Handle task assignment request
                task_data = message["data"]
                result = await coordinator.assign_task(task_data)
                
                response = {
                    "type": "task_assigned",
                    "data": result
                }
                await manager.broadcast(json.dumps(response))
            
            elif message["type"] == "request_update":
                # Handle progress update request
                task_id = message["task_id"]
                agent_id = message.get("agent_id")
                
                if agent_id and agent_id in coordinator.specialist_agents:
                    agent = coordinator.specialist_agents[agent_id]
                    update = await agent.provide_update(task_id)
                    
                    response = {
                        "type": "agent_update",
                        "data": {
                            "task_id": task_id,
                            "agent_name": agent.name,
                            "update": update,
                            "timestamp": datetime.now().isoformat()
                        }
                    }
                    await manager.broadcast(json.dumps(response))
            
            elif message["type"] == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# REST API endpoints
@app.post("/api/assign-task")
async def assign_task_endpoint(request: TaskAssignmentRequest):
    """Assign a task to an AI agent"""
    task_data = {
        "id": request.task_id,
        "title": request.task_title,
        "description": request.task_description,
        "priority": request.priority
    }
    
    result = await coordinator.assign_task(task_data)
    
    # Broadcast the assignment to all connected clients
    await manager.broadcast(json.dumps({
        "type": "task_assigned",
        "data": result
    }))
    
    return result

@app.get("/api/agents/status")
async def get_agents_status():
    """Get status of all AI agents"""
    agents_status = []
    
    for agent in coordinator.specialist_agents.values():
        agents_status.append({
            "id": agent.agent_id,
            "name": agent.name,
            "specialization": agent.specialization,
            "current_tasks": len(agent.current_tasks),
            "max_tasks": agent.max_concurrent_tasks,
            "available": len(agent.current_tasks) < agent.max_concurrent_tasks
        })
    
    return {"agents": agents_status}

@app.post("/api/agents/{agent_id}/update/{task_id}")
async def request_agent_update(agent_id: str, task_id: int):
    """Request a progress update from a specific agent"""
    if agent_id not in coordinator.specialist_agents:
        return {"error": "Agent not found"}
    
    agent = coordinator.specialist_agents[agent_id]
    update = await agent.provide_update(task_id)
    
    response_data = {
        "task_id": task_id,
        "agent_name": agent.name,
        "update": update,
        "timestamp": datetime.now().isoformat()
    }
    
    # Broadcast the update
    await manager.broadcast(json.dumps({
        "type": "agent_update",
        "data": response_data
    }))
    
    return response_data

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "active_connections": len(manager.active_connections),
        "agents_count": len(coordinator.specialist_agents)
    }

# Background task to simulate agent activity
async def simulate_agent_activity():
    """Simulate periodic agent updates and activities"""
    while True:
        await asyncio.sleep(30)  # Every 30 seconds
        
        # Get active tasks
        conn = get_db_connection()
        active_tasks = conn.execute(
            "SELECT * FROM tasks WHERE column_id IN (2, 3) AND assignee IS NOT NULL"
        ).fetchall()
        conn.close()
        
        for task in active_tasks:
            # Find the agent working on this task
            for agent in coordinator.specialist_agents.values():
                if agent.name == task['assignee'] and task['id'] in agent.current_tasks:
                    # Randomly provide updates
                    if len(manager.active_connections) > 0:
                        update = await agent.provide_update(task['id'])
                        
                        response = {
                            "type": "agent_activity",
                            "data": {
                                "task_id": task['id'],
                                "agent_name": agent.name,
                                "activity": update,
                                "timestamp": datetime.now().isoformat()
                            }
                        }
                        await manager.broadcast(json.dumps(response))
                    break

# Start background task
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(simulate_agent_activity())

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
