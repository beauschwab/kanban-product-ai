"use server"

import { revalidatePath } from "next/cache"
import { getIssues, createTaskFromIssue, autoAssignTask, getColumns, type Issue } from "@/lib/database"

export async function getIssuesData(): Promise<Issue[]> {
  return getIssues()
}

export async function createTasksFromIssues(issueIds: number[]) {
  const issues = getIssues().filter((issue) => issueIds.includes(issue.id))
  const columns = getColumns()
  const backlogColumn = columns.find((col) => col.title === "Backlog") || columns[0]

  for (const issue of issues) {
    // Create task from issue
    const taskId = createTaskFromIssue(issue.id, {
      title: issue.title,
      description: `${issue.description}\n\n**Original Issue Details:**\n- Severity: ${issue.severity}\n- Category: ${issue.category}\n- Reporter: ${issue.reporter}\n- Affected System: ${issue.affected_system}\n\n**Reproduction Steps:**\n${issue.reproduction_steps}\n\n**Expected Behavior:**\n${issue.expected_behavior}\n\n**Actual Behavior:**\n${issue.actual_behavior}`,
      column_id: backlogColumn.id,
      position: 0,
      priority: issue.severity as "low" | "medium" | "high",
      assignee: null,
      due_date: null,
    })

    // Auto-assign task
    autoAssignTask(taskId)
  }

  revalidatePath("/")
}
