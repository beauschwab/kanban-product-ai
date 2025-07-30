"use server"

import { revalidatePath } from "next/cache"
import db from "@/lib/database"

interface TimeEntry {
  id: number
  task_id: number
  agent_id: number
  start_time: string
  end_time: string | null
  duration_minutes: number | null
  description: string | null
  created_at: string
}

export async function getTimeEntries(taskId: number): Promise<TimeEntry[]> {
  const stmt = db.prepare("SELECT * FROM time_entries WHERE task_id = ? ORDER BY created_at DESC")
  return stmt.all(taskId) as TimeEntry[]
}

export async function startTimeEntry(taskId: number, agentId: number, description: string): Promise<TimeEntry> {
  const stmt = db.prepare(
    "INSERT INTO time_entries (task_id, agent_id, start_time, description) VALUES (?, ?, datetime('now'), ?)",
  )
  const result = stmt.run(taskId, agentId, description)

  const getStmt = db.prepare("SELECT * FROM time_entries WHERE id = ?")
  return getStmt.get(result.lastInsertRowid) as TimeEntry
}

export async function stopTimeEntry(entryId: number, description?: string) {
  const updateStmt = db.prepare(`
    UPDATE time_entries 
    SET end_time = datetime('now'), 
        duration_minutes = CAST((julianday(datetime('now')) - julianday(start_time)) * 24 * 60 AS INTEGER),
        description = COALESCE(?, description)
    WHERE id = ?
  `)
  updateStmt.run(description || null, entryId)
  revalidatePath("/")
}

export async function getAgentTimeStats(agentId: number) {
  const stmt = db.prepare(`
    SELECT 
      COUNT(*) as total_entries,
      SUM(duration_minutes) as total_minutes,
      AVG(duration_minutes) as avg_minutes
    FROM time_entries 
    WHERE agent_id = ? AND duration_minutes IS NOT NULL
  `)
  return stmt.get(agentId)
}
