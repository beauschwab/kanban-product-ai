"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Bot, Zap, Brain, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useWebSocket, type TaskAssignmentResult } from "@/lib/websocket-client"
import type { Task } from "@/lib/database"

interface AITaskAssignmentProps {
  task: Task
  onAssignmentComplete?: (result: TaskAssignmentResult) => void
}

export function AITaskAssignment({ task, onAssignmentComplete }: AITaskAssignmentProps) {
  const { client, connected } = useWebSocket("ws://localhost:8000/ws")
  const [isAssigning, setIsAssigning] = useState(false)
  const [lastResult, setLastResult] = useState<TaskAssignmentResult | null>(null)

  const handleAIAssignment = async () => {
    if (!client || !connected) {
      console.error("WebSocket client not connected")
      return
    }

    setIsAssigning(true)

    try {
      // Send task assignment request via WebSocket
      client.assignTask({
        task_id: task.id,
        task_title: task.title,
        task_description: task.description || "",
        priority: task.priority,
        category: "development", // You might want to add category to your Task type
      })

      // Listen for the assignment result
      client.onMessage("task_assigned", (result: TaskAssignmentResult) => {
        setLastResult(result)
        setIsAssigning(false)
        onAssignmentComplete?.(result)
      })
    } catch (error) {
      console.error("Error assigning task:", error)
      setIsAssigning(false)
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity?.toLowerCase()) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Card className="border-2 border-dashed border-blue-200 bg-blue-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bot className="h-5 w-5 text-blue-600" />
          AI Task Assignment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-sm mb-1">{task.title}</h3>
            <p className="text-xs text-gray-600">Let AI analyze and assign this task automatically</p>
          </div>
          <Button onClick={handleAIAssignment} disabled={isAssigning || !connected} className="gap-2" size="sm">
            {isAssigning ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="h-3 w-3" />
                Auto Assign
              </>
            )}
          </Button>
        </div>

        {!connected && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">AI agents are not connected. Please check the backend service.</p>
          </div>
        )}

        {lastResult && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {lastResult.success ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-sm text-green-800">Task Assigned Successfully!</span>
                </div>
                <p className="text-xs text-green-700 mb-2">
                  <strong>Assigned to:</strong> {lastResult.assigned_agent}
                </p>
                <p className="text-xs text-green-700">{lastResult.agent_response}</p>
              </div>
            ) : (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-sm text-red-800">Assignment Failed</span>
                </div>
                <p className="text-xs text-red-700">{lastResult.reason}</p>
              </div>
            )}

            {lastResult.analysis && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                  <Brain className="h-3 w-3" />
                  AI Analysis
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">Complexity:</span>
                    <Badge
                      variant="outline"
                      className={`ml-1 text-xs ${getComplexityColor(lastResult.analysis.complexity)}`}
                    >
                      {lastResult.analysis.complexity}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-600">Est. Hours:</span>
                    <span className="ml-1 font-medium">{lastResult.analysis.estimated_hours}h</span>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-gray-600 text-xs">Required Skills:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {lastResult.analysis.required_skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
