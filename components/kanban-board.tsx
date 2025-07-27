"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, MoreHorizontal, Clock, Bot, User } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string
  assignee: "agent" | "human"
  assigneeName: string
  priority: "low" | "medium" | "high" | "critical"
  type: "discovery" | "analysis" | "documentation" | "prototype" | "review" | "compliance"
  dueDate: string
  tags: string[]
}

const columns = [
  { id: "discovery", title: "Discovery", color: "bg-purple-100 border-purple-200" },
  { id: "analysis", title: "Analysis", color: "bg-blue-100 border-blue-200" },
  { id: "documentation", title: "Documentation", color: "bg-green-100 border-green-200" },
  { id: "prototype", title: "Prototype", color: "bg-orange-100 border-orange-200" },
  { id: "review", title: "Review", color: "bg-yellow-100 border-yellow-200" },
  { id: "approved", title: "Approved", color: "bg-emerald-100 border-emerald-200" },
]

const tasks: Record<string, Task[]> = {
  discovery: [
    {
      id: "1",
      title: "Stakeholder Analysis for Payment System",
      description: "Map all stakeholders involved in payment system modernization",
      assignee: "agent",
      assigneeName: "Discovery Agent",
      priority: "high",
      type: "discovery",
      dueDate: "2024-02-15",
      tags: ["stakeholders", "payments", "SOX"],
    },
    {
      id: "2",
      title: "Regulatory Impact Assessment",
      description: "Analyze regulatory requirements for new payment infrastructure",
      assignee: "agent",
      assigneeName: "Compliance Agent",
      priority: "critical",
      type: "compliance",
      dueDate: "2024-02-10",
      tags: ["regulation", "Basel III", "compliance"],
    },
  ],
  analysis: [
    {
      id: "3",
      title: "Requirements Specification",
      description: "Detailed functional and non-functional requirements",
      assignee: "human",
      assigneeName: "Sarah Chen",
      priority: "high",
      type: "analysis",
      dueDate: "2024-02-20",
      tags: ["requirements", "functional"],
    },
  ],
  documentation: [
    {
      id: "4",
      title: "SOX Controls Documentation",
      description: "Document internal controls for financial reporting",
      assignee: "agent",
      assigneeName: "Documentation Agent",
      priority: "medium",
      type: "documentation",
      dueDate: "2024-02-25",
      tags: ["SOX", "controls", "audit"],
    },
  ],
  prototype: [],
  review: [
    {
      id: "5",
      title: "Risk Assessment Review",
      description: "Executive review of identified risks and mitigation strategies",
      assignee: "human",
      assigneeName: "Michael Torres",
      priority: "high",
      type: "review",
      dueDate: "2024-02-18",
      tags: ["risk", "executive", "review"],
    },
  ],
  approved: [
    {
      id: "6",
      title: "Architecture Blueprint",
      description: "High-level system architecture approved for implementation",
      assignee: "human",
      assigneeName: "David Kim",
      priority: "medium",
      type: "prototype",
      dueDate: "2024-02-05",
      tags: ["architecture", "approved"],
    },
  ],
}

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
}

export function KanbanBoard() {
  const [selectedTask, setSelectedTask] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      {/* Board Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment System Modernization</h2>
          <p className="text-gray-600">Treasury transformation initiative with AI-assisted workflows</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 overflow-x-auto">
        {columns.map((column) => (
          <Card key={column.id} className={`min-h-[600px] ${column.color}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{column.title}</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {tasks[column.id]?.length || 0}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks[column.id]?.map((task) => (
                <Card
                  key={task.id}
                  className="cursor-pointer hover:shadow-md transition-shadow bg-white"
                  onClick={() => setSelectedTask(task.id)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Task Header */}
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium text-sm text-gray-900 line-clamp-2">{task.title}</h3>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </div>

                      {/* Task Description */}
                      <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>

                      {/* Priority and Type */}
                      <div className="flex items-center space-x-2">
                        <Badge className={`text-xs ${priorityColors[task.priority]}`}>{task.priority}</Badge>
                        <Badge variant="outline" className="text-xs">
                          {task.type}
                        </Badge>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {task.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {task.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{task.tags.length - 2}
                          </Badge>
                        )}
                      </div>

                      {/* Assignee and Due Date */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">
                              {task.assignee === "agent" ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-gray-600 truncate">{task.assigneeName}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add Task Button */}
              <Button variant="ghost" className="w-full border-2 border-dashed border-gray-300 hover:border-gray-400">
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
