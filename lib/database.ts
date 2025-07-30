import Database from "better-sqlite3"
import path from "path"

const dbPath = path.join(process.cwd(), "kanban.db")
const db = new Database(dbPath)

// Enable foreign keys
db.pragma("foreign_keys = ON")

export interface Column {
  id: number
  title: string
  position: number
  color: string
  created_at: string
}

export interface Task {
  id: number
  title: string
  description: string | null
  column_id: number
  position: number
  priority: "low" | "medium" | "high"
  assignee: string | null
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface Agent {
  id: number
  name: string
  email: string
  role: string
  status: string
  current_workload: number
  max_workload: number
  skills: string
  created_at: string
}

export interface Issue {
  id: number
  sharepoint_id: string
  title: string
  description: string | null
  severity: "low" | "medium" | "high"
  category: string | null
  reporter: string | null
  reported_date: string | null
  affected_system: string | null
  reproduction_steps: string | null
  expected_behavior: string | null
  actual_behavior: string | null
  status: string
  selected_for_kanban: boolean
  kanban_task_id: number | null
  created_at: string
  updated_at: string
}

export interface AgentAssignment {
  id: number
  agent_id: number
  task_id: number
  assigned_by: string
  assigned_at: string
  status: string
}

export interface FileDiff {
  id: number
  task_id: number
  file_path: string
  old_content: string | null
  new_content: string | null
  diff_content: string | null
  created_at: string
}

export function getColumns(): Column[] {
  const stmt = db.prepare("SELECT * FROM columns ORDER BY position")
  return stmt.all() as Column[]
}

export function getTasks(): Task[] {
  const stmt = db.prepare("SELECT * FROM tasks ORDER BY column_id, position")
  return stmt.all() as Task[]
}

export function createTask(task: Omit<Task, "id" | "created_at" | "updated_at">) {
  const stmt = db.prepare(`
    INSERT INTO tasks (title, description, column_id, position, priority, assignee, due_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  return stmt.run(
    task.title,
    task.description,
    task.column_id,
    task.position,
    task.priority,
    task.assignee,
    task.due_date,
  )
}

export function updateTask(id: number, updates: Partial<Task>) {
  const fields = Object.keys(updates)
    .filter((key) => key !== "id")
    .map((key) => `${key} = ?`)
    .join(", ")
  const values = Object.values(updates).filter((_, index) => Object.keys(updates)[index] !== "id")

  if (fields) {
    const stmt = db.prepare(`UPDATE tasks SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    return stmt.run(...values, id)
  }
}

export function deleteTask(id: number) {
  const stmt = db.prepare("DELETE FROM tasks WHERE id = ?")
  return stmt.run(id)
}

export function updateTaskPositions(tasks: { id: number; column_id: number; position: number }[]) {
  const stmt = db.prepare("UPDATE tasks SET column_id = ?, position = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")

  const transaction = db.transaction(() => {
    for (const task of tasks) {
      stmt.run(task.column_id, task.position, task.id)
    }
  })

  return transaction()
}

// Agent functions
export function getAgents(): Agent[] {
  const stmt = db.prepare("SELECT * FROM agents ORDER BY name")
  return stmt.all() as Agent[]
}

export function getAvailableAgents(): Agent[] {
  const stmt = db.prepare(
    "SELECT * FROM agents WHERE current_workload < max_workload AND status = 'available' ORDER BY current_workload ASC",
  )
  return stmt.all() as Agent[]
}

// Issue functions
export function getIssues(): Issue[] {
  const stmt = db.prepare("SELECT * FROM issues ORDER BY reported_date DESC")
  return stmt.all() as Issue[]
}

export function updateIssueSelection(id: number, selected: boolean) {
  const stmt = db.prepare("UPDATE issues SET selected_for_kanban = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
  return stmt.run(selected, id)
}

export function createTaskFromIssue(issueId: number, taskData: Omit<Task, "id" | "created_at" | "updated_at">) {
  const taskResult = createTask(taskData)
  const taskId = taskResult.lastInsertRowid as number

  // Link issue to task
  const stmt = db.prepare(
    "UPDATE issues SET kanban_task_id = ?, status = 'in_progress', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
  )
  stmt.run(taskId, issueId)

  return taskId
}

// Assignment functions
export function assignTaskToAgent(taskId: number, agentId: number, assignedBy = "coordinator") {
  const stmt = db.prepare("INSERT INTO agent_assignments (agent_id, task_id, assigned_by) VALUES (?, ?, ?)")
  const result = stmt.run(agentId, taskId, assignedBy)

  // Update agent workload
  const updateStmt = db.prepare("UPDATE agents SET current_workload = current_workload + 1 WHERE id = ?")
  updateStmt.run(agentId)

  return result
}

export function getAgentAssignments(
  agentId?: number,
): (AgentAssignment & { agent_name: string; task_title: string })[] {
  let query = `
    SELECT aa.*, a.name as agent_name, t.title as task_title 
    FROM agent_assignments aa 
    JOIN agents a ON aa.agent_id = a.id 
    JOIN tasks t ON aa.task_id = t.id 
    WHERE aa.status = 'active'
  `

  if (agentId) {
    query += " AND aa.agent_id = ?"
    const stmt = db.prepare(query)
    return stmt.all(agentId) as (AgentAssignment & { agent_name: string; task_title: string })[]
  } else {
    const stmt = db.prepare(query)
    return stmt.all() as (AgentAssignment & { agent_name: string; task_title: string })[]
  }
}

// File diff functions
export function getFileDiffs(taskId: number): FileDiff[] {
  const stmt = db.prepare("SELECT * FROM file_diffs WHERE task_id = ? ORDER BY created_at DESC")
  return stmt.all(taskId) as FileDiff[]
}

export function createFileDiff(diff: Omit<FileDiff, "id" | "created_at">) {
  const stmt = db.prepare(
    "INSERT INTO file_diffs (task_id, file_path, old_content, new_content, diff_content) VALUES (?, ?, ?, ?, ?)",
  )
  return stmt.run(diff.task_id, diff.file_path, diff.old_content, diff.new_content, diff.diff_content)
}

// Auto-assignment logic
export function autoAssignTask(taskId: number): number | null {
  const availableAgents = getAvailableAgents()
  if (availableAgents.length === 0) return null

  // Simple round-robin assignment to agent with lowest workload
  const selectedAgent = availableAgents[0]
  assignTaskToAgent(taskId, selectedAgent.id, "coordinator")

  return selectedAgent.id
}

export default db
