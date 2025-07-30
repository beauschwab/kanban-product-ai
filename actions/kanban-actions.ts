"use server"

import { revalidatePath } from "next/cache"
import {
  getColumns,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  updateTaskPositions,
  type Task,
} from "@/lib/database"

export async function getKanbanData() {
  const columns = getColumns()
  const tasks = getTasks()

  return {
    columns,
    tasks: tasks.reduce(
      (acc, task) => {
        if (!acc[task.column_id]) {
          acc[task.column_id] = []
        }
        acc[task.column_id].push(task)
        return acc
      },
      {} as Record<number, Task[]>,
    ),
  }
}

export async function createNewTask(formData: FormData) {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const column_id = Number.parseInt(formData.get("column_id") as string)
  const priority = formData.get("priority") as "low" | "medium" | "high"
  const assignee = formData.get("assignee") as string

  // Get the next position for this column
  const tasks = getTasks().filter((task) => task.column_id === column_id)
  const position = tasks.length

  createTask({
    title,
    description: description || null,
    column_id,
    position,
    priority,
    assignee: assignee || null,
    due_date: null,
  })

  revalidatePath("/")
}

export async function updateTaskAction(id: number, updates: Partial<Task>) {
  updateTask(id, updates)
  revalidatePath("/")
}

export async function deleteTaskAction(id: number) {
  deleteTask(id)
  revalidatePath("/")
}

export async function moveTask(taskId: number, newColumnId: number, newPosition: number) {
  // Get all tasks to recalculate positions
  const allTasks = getTasks()
  const taskToMove = allTasks.find((t) => t.id === taskId)

  if (!taskToMove) return

  // Remove task from old position
  const tasksInOldColumn = allTasks
    .filter((t) => t.column_id === taskToMove.column_id && t.id !== taskId)
    .map((t, index) => ({ id: t.id, column_id: t.column_id, position: index }))

  // Add task to new position
  const tasksInNewColumn = allTasks.filter((t) => t.column_id === newColumnId && t.id !== taskId)

  tasksInNewColumn.splice(newPosition, 0, { ...taskToMove, column_id: newColumnId })

  const updatedTasksInNewColumn = tasksInNewColumn.map((t, index) => ({
    id: t.id,
    column_id: newColumnId,
    position: index,
  }))

  // Update all affected tasks
  updateTaskPositions([...tasksInOldColumn, ...updatedTasksInNewColumn])
  revalidatePath("/")
}
