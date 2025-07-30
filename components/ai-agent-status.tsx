"use client"
import { motion } from "framer-motion"
import { Bot, Activity, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useWebSocket, type AgentStatus } from "@/lib/websocket-client"

interface AIAgentStatusProps {
  onAssignTask?: (agentId: string) => void
}

export function AIAgentStatus({ onAssignTask }: AIAgentStatusProps) {
  const { client, connected, agentStatuses, recentUpdates } = useWebSocket("ws://localhost:8000/ws")

  const getStatusColor = (agent: AgentStatus) => {
    if (!agent.available) return "bg-red-100 text-red-800 border-red-200"
    if (agent.current_tasks === 0) return "bg-green-100 text-green-800 border-green-200"
    return "bg-yellow-100 text-yellow-800 border-yellow-200"
  }

  const getStatusIcon = (agent: AgentStatus) => {
    if (!agent.available) return AlertCircle
    if (agent.current_tasks === 0) return CheckCircle
    return Activity
  }

  const handleRequestUpdate = (agentId: string, taskId?: number) => {
    if (client && taskId) {
      client.requestUpdate(taskId, agentId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Agents System
            <Badge variant={connected ? "default" : "destructive"} className="text-xs">
              {connected ? "Connected" : "Disconnected"}
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Agent Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agentStatuses.map((agent, index) => {
          const StatusIcon = getStatusIcon(agent)
          const workloadPercentage = (agent.current_tasks / agent.max_tasks) * 100

          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusIcon className="h-4 w-4" />
                      <h3 className="font-semibold">{agent.name}</h3>
                    </div>
                    <Badge variant="outline" className={`text-xs ${getStatusColor(agent)}`}>
                      {agent.available ? "Available" : "Busy"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{agent.specialization}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Workload</span>
                      <span>
                        {agent.current_tasks}/{agent.max_tasks}
                      </span>
                    </div>
                    <Progress value={workloadPercentage} className="h-2" />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAssignTask?.(agent.id)}
                      disabled={!agent.available}
                      className="flex-1"
                    >
                      Assign Task
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleRequestUpdate(agent.id)} className="px-3">
                      <Activity className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Recent Updates */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Agent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {recentUpdates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No recent activity</div>
              ) : (
                recentUpdates.map((update, index) => (
                  <motion.div
                    key={`${update.task_id}-${update.timestamp}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 bg-gray-50 rounded-lg border-l-4 border-l-blue-500"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Bot className="h-3 w-3 text-blue-600" />
                        <span className="font-medium text-sm">{update.agent_name}</span>
                      </div>
                      <span className="text-xs text-gray-500">{new Date(update.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">Task #{update.task_id}</p>
                    <p className="text-xs text-gray-600">{update.update}</p>
                  </motion.div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
