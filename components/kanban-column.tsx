"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TaskCard } from "./task-card"
import type { Column, Task } from "@/lib/database"

interface KanbanColumnProps {
  column: Column
  tasks: Task[]
  onAddTask: (columnId: number) => void
  onEditTask: (task: Task) => void
  onTaskClick: (taskId: number) => void
  onDrop: (columnId: number, position: number) => void
  onDragOver: (e: React.DragEvent) => void
}

export function KanbanColumn({
  column,
  tasks,
  onAddTask,
  onEditTask,
  onTaskClick,
  onDrop,
  onDragOver,
}: KanbanColumnProps) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const position = tasks.length
    onDrop(column.id, position)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-shrink-0 w-80"
    >
      <Card className="h-full bg-gray-50 border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: column.color }} />
              <h2 className="font-semibold text-gray-900">{column.title}</h2>
              <Badge variant="secondary" className="text-xs">
                {tasks.length}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddTask(column.id)}
              className="h-6 w-6 p-0 hover:bg-gray-200"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 min-h-96 pb-4" onDrop={handleDrop} onDragOver={onDragOver}>
          <motion.div layout className="space-y-3">
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", task.id.toString())
                }}
                layout
              >
                <TaskCard task={task} onEdit={onEditTask} onClick={() => onTaskClick(task.id)} />
              </motion.div>
            ))}
          </motion.div>

          {tasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-32 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg"
            >
              Drop tasks here
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
