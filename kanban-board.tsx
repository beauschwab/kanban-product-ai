"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { KanbanColumn } from "./components/kanban-column"
import { TaskFormDialog } from "./components/task-form-dialog"
import { getKanbanData } from "./actions/kanban-actions"
import type { Column, Task } from "./lib/database"
import { IssueIntake } from "./components/issue-intake"
import { SlideOutPanel } from "./components/slide-out-panel"
import { getAgents } from "./lib/database"
import { NotificationCenter } from "./components/notification-center"
import { AnalyticsDashboard } from "./components/analytics-dashboard"
import { AIAgentStatus } from "./components/ai-agent-status"

export default function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>([])
  const [tasks, setTasks] = useState<Record<number, Task[]>>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [defaultColumnId, setDefaultColumnId] = useState<number | undefined>()

  const [showIssueIntake, setShowIssueIntake] = useState(false)
  const [agents, setAgents] = useState<any[]>([])
  const [slideOutPanel, setSlideOutPanel] = useState<{
    isOpen: boolean
    type: "agent" | "task" | null
    itemId: number | null
  }>({
    isOpen: false,
    type: null,
    itemId: null,
  })

  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showAIAgents, setShowAIAgents] = useState(false)
  const [selectedTaskForAI, setSelectedTaskForAI] = useState<Task | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [kanbanData, agentsData] = await Promise.all([getKanbanData(), getAgents()])
    setColumns(kanbanData.columns)
    setTasks(kanbanData.tasks)
    setAgents(agentsData)
  }

  const handleAddTask = (columnId: number) => {
    setDefaultColumnId(columnId)
    setEditingTask(null)
    setIsTaskDialogOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setDefaultColumnId(undefined)
    setIsTaskDialogOpen(true)
  }

  const handleDrop = async (columnId: number, position: number) => {
    // This would be called when a task is dropped
    // The drag data would contain the task ID
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const filteredTasks = (columnTasks: Task[]) => {
    return columnTasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPriority = filterPriority === "all" || task.priority === filterPriority
      return matchesSearch && matchesPriority
    })
  }

  const handleOpenAgentProgress = (agentId: number) => {
    setSlideOutPanel({
      isOpen: true,
      type: "agent",
      itemId: agentId,
    })
  }

  const handleOpenTaskDetails = (taskId: number) => {
    setSlideOutPanel({
      isOpen: true,
      type: "task",
      itemId: taskId,
    })
  }

  const handleCloseSlideOut = () => {
    setSlideOutPanel({
      isOpen: false,
      type: null,
      itemId: null,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Board</h1>
              <p className="text-gray-600">Manage your tasks efficiently with drag & drop</p>
            </div>
            <div className="flex items-center gap-3">
              <NotificationCenter />
              <Button variant="outline" onClick={() => setShowAIAgents(!showAIAgents)}>
                {showAIAgents ? "Hide" : "Show"} AI Agents
              </Button>
              <Button variant="outline" onClick={() => setShowAnalytics(!showAnalytics)}>
                {showAnalytics ? "Hide" : "Show"} Analytics
              </Button>
              <Button variant="outline" onClick={() => setShowIssueIntake(!showIssueIntake)}>
                {showIssueIntake ? "Hide" : "Show"} Issue Intake
              </Button>
              <Button onClick={() => handleAddTask(columns[0]?.id)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </div>
          </div>

          {/* Agent Quick Access */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Agents</h3>
            <div className="flex gap-2 flex-wrap">
              {agents.map((agent) => (
                <Button
                  key={agent.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenAgentProgress(agent.id)}
                  className="text-xs"
                >
                  {agent.name} ({agent.current_workload}/{agent.max_workload})
                </Button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Filter className="h-4 w-4" />
                  Priority: {filterPriority === "all" ? "All" : filterPriority}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterPriority("all")}>All Priorities</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterPriority("high")}>High Priority</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterPriority("medium")}>Medium Priority</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterPriority("low")}>Low Priority</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>

        {/* Issue Intake */}
        {showIssueIntake && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <IssueIntake onIssuesConverted={loadData} />
          </motion.div>
        )}

        {/* Analytics Dashboard */}
        {showAnalytics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <AnalyticsDashboard />
          </motion.div>
        )}

        {/* AI Agents Dashboard */}
        {showAIAgents && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <AIAgentStatus onAssignTask={(agentId) => console.log("Assign task to agent:", agentId)} />
          </motion.div>
        )}

        {/* Kanban Board */}
        <div className="flex gap-6 overflow-x-auto pb-6">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={filteredTasks(tasks[column.id] || [])}
              onAddTask={handleAddTask}
              onEditTask={handleEditTask}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onTaskClick={handleOpenTaskDetails}
            />
          ))}
        </div>

        {/* Task Form Dialog */}
        <TaskFormDialog
          open={isTaskDialogOpen}
          onOpenChange={(open) => {
            setIsTaskDialogOpen(open)
            if (!open) {
              setEditingTask(null)
              setDefaultColumnId(undefined)
              loadData() // Refresh data when dialog closes
            }
          }}
          columns={columns}
          task={editingTask}
          defaultColumnId={defaultColumnId}
        />

        {/* Slide Out Panel */}
        <SlideOutPanel
          isOpen={slideOutPanel.isOpen}
          onClose={handleCloseSlideOut}
          type={slideOutPanel.type}
          itemId={slideOutPanel.itemId}
        />
      </div>
    </div>
  )
}
