"use server"

import { revalidatePath } from "next/cache"
import db from "@/lib/database"

interface Notification {
  id: number
  user_id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  action_url: string | null
  created_at: string
}

export async function getNotifications(userId = "current_user"): Promise<Notification[]> {
  const stmt = db.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20")
  return stmt.all(userId) as Notification[]
}

export async function markNotificationAsRead(notificationId: number) {
  const stmt = db.prepare("UPDATE notifications SET read = TRUE WHERE id = ?")
  stmt.run(notificationId)
  revalidatePath("/")
}

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: "info" | "success" | "warning" | "error" = "info",
  actionUrl?: string,
) {
  const stmt = db.prepare(
    "INSERT INTO notifications (user_id, title, message, type, action_url) VALUES (?, ?, ?, ?, ?)",
  )
  return stmt.run(userId, title, message, type, actionUrl || null)
}
