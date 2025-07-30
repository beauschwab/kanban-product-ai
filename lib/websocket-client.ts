"use client"

import { useEffect, useState } from "react"

export interface WebSocketMessage {
  type: string
  data?: any
  task_id?: number
  agent_id?: string
}

export interface AgentStatus {
  id: string
  name: string
  specialization: string
  current_tasks: number
  max_tasks: number
  available: boolean
}

export interface TaskAssignmentResult {
  success: boolean
  assigned_agent?: string
  agent_response?: string
  analysis?: {
    complexity: string
    estimated_hours: number
    required_skills: string[]
    recommended_agent: string
  }
  reason?: string
}

export interface AgentUpdate {
  task_id: number
  agent_name: string
  update: string
  timestamp: string
}

export class WebSocketClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private messageHandlers: Map<string, (data: any) => void> = new Map()

  constructor(private url: string) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          console.log("WebSocket connected")
          this.reconnectAttempts = 0
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            const handler = this.messageHandlers.get(message.type)
            if (handler) {
              handler(message.data || message)
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error)
          }
        }

        this.ws.onclose = () => {
          console.log("WebSocket disconnected")
          this.attemptReconnect()
        }

        this.ws.onerror = (error) => {
          console.error("WebSocket error:", error)
          reject(error)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

      setTimeout(() => {
        this.connect().catch((error) => {
          console.error("Reconnection failed:", error)
        })
      }, this.reconnectDelay * this.reconnectAttempts)
    }
  }

  onMessage(type: string, handler: (data: any) => void) {
    this.messageHandlers.set(type, handler)
  }

  sendMessage(message: WebSocketMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.error("WebSocket is not connected")
    }
  }

  assignTask(taskData: {
    task_id: number
    task_title: string
    task_description: string
    priority: string
    category: string
  }) {
    this.sendMessage({
      type: "task_assignment",
      data: taskData,
    })
  }

  requestUpdate(taskId: number, agentId?: string) {
    this.sendMessage({
      type: "request_update",
      task_id: taskId,
      agent_id: agentId,
    })
  }

  ping() {
    this.sendMessage({ type: "ping" })
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

export function useWebSocket(url: string) {
  const [client, setClient] = useState<WebSocketClient | null>(null)
  const [connected, setConnected] = useState(false)
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([])
  const [recentUpdates, setRecentUpdates] = useState<AgentUpdate[]>([])

  useEffect(() => {
    const wsClient = new WebSocketClient(url)

    // Set up message handlers
    wsClient.onMessage("task_assigned", (data: TaskAssignmentResult) => {
      console.log("Task assigned:", data)
      // You can add custom handling here
    })

    wsClient.onMessage("agent_update", (data: AgentUpdate) => {
      console.log("Agent update:", data)
      setRecentUpdates((prev) => [data, ...prev.slice(0, 9)]) // Keep last 10 updates
    })

    wsClient.onMessage("agent_activity", (data: AgentUpdate) => {
      console.log("Agent activity:", data)
      setRecentUpdates((prev) => [data, ...prev.slice(0, 9)])
    })

    wsClient.onMessage("pong", () => {
      console.log("Pong received")
    })

    // Connect
    wsClient
      .connect()
      .then(() => {
        setConnected(true)
        setClient(wsClient)

        // Start ping interval
        const pingInterval = setInterval(() => {
          wsClient.ping()
        }, 30000)

        return () => clearInterval(pingInterval)
      })
      .catch((error) => {
        console.error("Failed to connect to WebSocket:", error)
        setConnected(false)
      })

    return () => {
      wsClient.disconnect()
    }
  }, [url])

  // Fetch agent statuses periodically
  useEffect(() => {
    const fetchAgentStatuses = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/agents/status")
        const data = await response.json()
        setAgentStatuses(data.agents)
      } catch (error) {
        console.error("Error fetching agent statuses:", error)
      }
    }

    fetchAgentStatuses()
    const interval = setInterval(fetchAgentStatuses, 10000) // Every 10 seconds

    return () => clearInterval(interval)
  }, [])

  return {
    client,
    connected,
    agentStatuses,
    recentUpdates,
  }
}
