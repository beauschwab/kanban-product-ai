"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, User, Clock, FileText, GitBranch, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import type { Agent, Task, FileDiff } from "@/lib/database"
import { getAgentProgress, getTaskDetails, getTaskFileDiffs } from "@/actions/panel-actions"
import { TimeTracker } from "./time-tracker"

interface SlideOutPanelProps {
  isOpen: boolean
  onClose: () => void
  type: "agent" | "task" | null
  itemId: number | null
}

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

export function SlideOutPanel({ isOpen, onClose, type, itemId }: SlideOutPanelProps) {
  const [agentProgress, setAgentProgress] = useState<AgentProgress | null>(null)
  const [taskDetails, setTaskDetails] = useState<Task | null>(null)
  const [fileDiffs, setFileDiffs] = useState<FileDiff[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && itemId && type) {
      loadData()
    }
  }, [isOpen, itemId, type])

  const loadData = async () => {
    if (!itemId || !type) return

    setLoading(true)
    try {
      if (type === "agent") {
        const progress = await getAgentProgress(itemId)
        setAgentProgress(progress)
      } else if (type === "task") {
        const [details, diffs] = await Promise.all([getTaskDetails(itemId), getTaskFileDiffs(itemId)])
        setTaskDetails(details)
        setFileDiffs(diffs)
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderDiffLine = (line: string, index: number) => {
    const type = line.startsWith("+") ? "addition" : line.startsWith("-") ? "deletion" : "context"
    const colorClass = {
      addition: "bg-green-50 text-green-800 border-l-2 border-l-green-500",
      deletion: "bg-red-50 text-red-800 border-l-2 border-l-red-500",
      context: "bg-gray-50 text-gray-700",
    }[type]

    return (
      <div key={index} className={`px-3 py-1 text-xs font-mono ${colorClass}`}>
        {line}
      </div>
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 border-l"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <h2 className="font-semibold text-gray-900">{type === "agent" ? "Agent Progress" : "Task Details"}</h2>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Content */}
              <ScrollArea className="flex-1">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    {type === "agent" && agentProgress && <AgentProgressView progress={agentProgress} />}
                    {type === "task" && taskDetails && <TaskDetailsView task={taskDetails} fileDiffs={fileDiffs} />}
                  </div>
                )}
              </ScrollArea>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function AgentProgressView({ progress }: { progress: AgentProgress }) {
  const workloadPercentage = (progress.agent.current_workload / progress.agent.max_workload) * 100
  const completionRate = progress.totalTasks > 0 ? (progress.completedTasks / progress.totalTasks) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Agent Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            {progress.agent.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Role</span>
            <Badge variant="outline">{progress.agent.role}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Status</span>
            <Badge variant={progress.agent.status === "available" ? "default" : "secondary"}>
              {progress.agent.status}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Current Workload</span>
              <span>
                {progress.agent.current_workload}/{progress.agent.max_workload}
              </span>
            </div>
            <Progress value={workloadPercentage} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Completion Rate</span>
              <span>{completionRate.toFixed(0)}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {JSON.parse(progress.agent.skills || "[]").map((skill: string) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Assignments */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4" />
            Current Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {progress.assignments.map((assignment) => (
              <div key={assignment.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-sm mb-1">{assignment.task_title}</div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(assignment.assigned_at).toLocaleDateString()}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {assignment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TaskDetailsView({ task, fileDiffs }: { task: Task; fileDiffs: FileDiff[] }) {
  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="diffs">File Diffs</TabsTrigger>
        <TabsTrigger value="time">Time Tracking</TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              {task.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {task.description && (
              <div>
                <h4 className="font-medium text-sm mb-2">Description</h4>
                <p className="text-sm text-gray-600">{task.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Priority</span>
                <div className="mt-1">
                  <Badge
                    variant="outline"
                    className={
                      task.priority === "high"
                        ? "bg-red-100 text-red-800"
                        : task.priority === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                    }
                  >
                    {task.priority}
                  </Badge>
                </div>
              </div>

              <div>
                <span className="text-gray-600">Assignee</span>
                <div className="mt-1 font-medium">{task.assignee || "Unassigned"}</div>
              </div>
            </div>

            <div className="text-sm">
              <span className="text-gray-600">Created</span>
              <div className="mt-1">{new Date(task.created_at).toLocaleString()}</div>
            </div>

            <div className="text-sm">
              <span className="text-gray-600">Last Updated</span>
              <div className="mt-1">{new Date(task.updated_at).toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="diffs" className="space-y-4">
        {fileDiffs.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32 text-gray-500">
              No file changes yet
            </CardContent>
          </Card>
        ) : (
          fileDiffs.map((diff) => (
            <Card key={diff.id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <GitBranch className="h-4 w-4" />
                  {diff.file_path}
                </CardTitle>
                <div className="text-xs text-gray-500">{new Date(diff.created_at).toLocaleString()}</div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 border-b">Diff</div>
                  <div className="max-h-64 overflow-y-auto">
                    {diff.diff_content?.split("\n").map((line, index) => renderDiffLine(line, index))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      <TabsContent value="time" className="space-y-4">
        <TimeTracker task={task} agentId={1} />
      </TabsContent>
    </Tabs>
  )
}

function renderDiffLine(line: string, index: number) {
  const type = line.startsWith("+") ? "addition" : line.startsWith("-") ? "deletion" : "context"
  const colorClass = {
    addition: "bg-green-50 text-green-800 border-l-2 border-l-green-500",
    deletion: "bg-red-50 text-red-800 border-l-2 border-l-red-500",
    context: "bg-gray-50 text-gray-700",
  }[type]

  return (
    <div key={index} className={`px-3 py-1 text-xs font-mono ${colorClass}`}>
      {line}
    </div>
  )
}
