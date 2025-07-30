"use server"

import {
  getAgents,
  getAgentAssignments,
  getTasks,
  getFileDiffs,
  type Agent,
  type Task,
  type FileDiff,
} from "@/lib/database"

interface AgentProgress {
  agent: Agent
  assignments: Array<{
    id: number
    task_title: string
    task_id: number
    assigned_at: string
    status: string
  }>
  completedTasks: number
  totalTasks: number
}

export async function getAgentProgress(agentId: number): Promise<AgentProgress> {
  const agents = getAgents()
  const agent = agents.find((a) => a.id === agentId)

  if (!agent) {
    throw new Error("Agent not found")
  }

  const assignments = getAgentAssignments(agentId)
  const allTasks = getTasks()

  // Calculate completed tasks (assuming tasks in "Done" column are completed)
  const agentTaskIds = assignments.map((a) => a.task_id)
  const agentTasks = allTasks.filter((task) => agentTaskIds.includes(task.id))
  const completedTasks = agentTasks.filter((task) => {
    // Assuming column_id 4 is "Done" based on our initial data
    return task.column_id === 4
  }).length

  return {
    agent,
    assignments: assignments.map((a) => ({
      id: a.id,
      task_title: a.task_title,
      task_id: a.task_id,
      assigned_at: a.assigned_at,
      status: a.status,
    })),
    completedTasks,
    totalTasks: assignments.length,
  }
}

export async function getTaskDetails(taskId: number): Promise<Task> {
  const tasks = getTasks()
  const task = tasks.find((t) => t.id === taskId)

  if (!task) {
    throw new Error("Task not found")
  }

  return task
}

export async function getTaskFileDiffs(taskId: number): Promise<FileDiff[]> {
  return getFileDiffs(taskId)
}
