"use server"

import db from "@/lib/database"

export async function getAnalyticsData() {
  // Get basic task statistics
  const taskStats = db
    .prepare(
      `
    SELECT 
      COUNT(*) as total_tasks,
      SUM(CASE WHEN column_id = 4 THEN 1 ELSE 0 END) as completed_tasks,
      SUM(CASE WHEN column_id = 2 THEN 1 ELSE 0 END) as in_progress_tasks,
      SUM(CASE WHEN due_date < date('now') AND column_id != 4 THEN 1 ELSE 0 END) as overdue_tasks
    FROM tasks
  `,
    )
    .get() as any

  // Get average completion time (mock calculation)
  const avgCompletionTime = 2.5

  // Get team velocity (tasks completed per week)
  const teamVelocity = 15

  // Get agent performance
  const agentPerformance = db
    .prepare(
      `
    SELECT 
      a.name,
      COUNT(aa.task_id) as tasks_completed,
      AVG(COALESCE(te.duration_minutes, 0)) / 60.0 as average_time,
      (COUNT(aa.task_id) * 100.0 / NULLIF(a.max_workload, 0)) as efficiency
    FROM agents a
    LEFT JOIN agent_assignments aa ON a.id = aa.agent_id
    LEFT JOIN time_entries te ON aa.task_id = te.task_id
    WHERE a.role != 'coordinator'
    GROUP BY a.id, a.name, a.max_workload
  `,
    )
    .all() as any[]

  // Get tasks by priority
  const tasksByPriority = db
    .prepare(
      `
    SELECT 
      priority,
      COUNT(*) as count
    FROM tasks
    GROUP BY priority
  `,
    )
    .all() as any[]

  const priorityBreakdown = {
    high: tasksByPriority.find((p) => p.priority === "high")?.count || 0,
    medium: tasksByPriority.find((p) => p.priority === "medium")?.count || 0,
    low: tasksByPriority.find((p) => p.priority === "low")?.count || 0,
  }

  // Mock weekly progress data
  const weeklyProgress = [
    { date: "2024-01-08", completed: 8, created: 5 },
    { date: "2024-01-15", completed: 12, created: 8 },
    { date: "2024-01-22", completed: 10, created: 6 },
    { date: "2024-01-29", completed: 15, created: 9 },
  ]

  return {
    totalTasks: taskStats.total_tasks,
    completedTasks: taskStats.completed_tasks,
    inProgressTasks: taskStats.in_progress_tasks,
    overdueTasks: taskStats.overdue_tasks,
    averageCompletionTime: avgCompletionTime,
    teamVelocity: teamVelocity,
    agentPerformance: agentPerformance.map((agent) => ({
      name: agent.name,
      tasksCompleted: agent.tasks_completed || 0,
      averageTime: agent.average_time || 0,
      efficiency: Math.min(agent.efficiency || 0, 100),
    })),
    tasksByPriority: priorityBreakdown,
    weeklyProgress,
  }
}
