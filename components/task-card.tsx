"use client"

import { motion } from "framer-motion"
import { Calendar, User, MoreHorizontal, Trash2, Edit } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Task } from "@/lib/database"
import { deleteTaskAction } from "@/actions/kanban-actions"
import { AITaskAssignment } from "./ai-task-assignment"

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onClick?: () => void
  showAIAssignment?: boolean
}

const priorityColors = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-red-100 text-red-800 border-red-200",
}

export function TaskCard({ task, onEdit, onClick, showAIAssignment = false }: TaskCardProps) {
  const handleDelete = async () => {
    await deleteTaskAction(task.id)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="space-y-2"
    >
      {showAIAssignment && !task.assignee && (
        <AITaskAssignment
          task={task}
          onAssignmentComplete={(result) => {
            if (result.success) {
              // Refresh the page or update the task
              window.location.reload()
            }
          }}
        />
      )}

      <Card className="cursor-pointer active:cursor-grabbing hover:shadow-md transition-shadow duration-200 border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">{task.title}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit className="h-3 w-3 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                  <Trash2 className="h-3 w-3 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {task.description && <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-xs px-2 py-0.5 ${priorityColors[task.priority]}`}>
                {task.priority}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              {task.assignee && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span className="truncate max-w-16">{task.assignee}</span>
                </div>
              )}
              {task.due_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(task.due_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
