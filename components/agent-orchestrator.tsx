"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Bot, Play, Pause, Settings, Activity, Clock, AlertTriangle } from "lucide-react"

interface Agent {
  id: string
  name: string
  specialization: string
  status: "active" | "idle" | "error" | "maintenance"
  currentTask?: string
  progress: number
  model: string
  securityClearance: string
  capabilities: string[]
  tasksCompleted: number
  avgResponseTime: string
}

const agents: Agent[] = [
  {
    id: "discovery-001",
    name: "Discovery Agent",
    specialization: "Stakeholder Analysis & Research",
    status: "active",
    currentTask: "Analyzing payment system stakeholders",
    progress: 75,
    model: "GPT-4 Treasury",
    securityClearance: "Internal",
    capabilities: ["stakeholder-mapping", "regulatory-research", "market-analysis"],
    tasksCompleted: 23,
    avgResponseTime: "2.3s",
  },
  {
    id: "analysis-001",
    name: "Analysis Agent",
    specialization: "Requirements & Impact Analysis",
    status: "active",
    currentTask: "Processing functional requirements",
    progress: 45,
    model: "GPT-4 Treasury",
    securityClearance: "Confidential",
    capabilities: ["requirements-analysis", "gap-assessment", "impact-analysis"],
    tasksCompleted: 18,
    avgResponseTime: "3.1s",
  },
  {
    id: "documentation-001",
    name: "Documentation Agent",
    specialization: "Compliance & Technical Documentation",
    status: "idle",
    model: "GPT-4 Compliance",
    securityClearance: "Restricted",
    capabilities: ["compliance-docs", "technical-specs", "process-flows"],
    tasksCompleted: 31,
    avgResponseTime: "1.8s",
    progress: 0,
  },
  {
    id: "compliance-001",
    name: "Compliance Agent",
    specialization: "Regulatory Validation",
    status: "active",
    currentTask: "SOX compliance validation",
    progress: 90,
    model: "GPT-4 Compliance",
    securityClearance: "Restricted",
    capabilities: ["sox-validation", "basel-iii", "audit-trails"],
    tasksCompleted: 15,
    avgResponseTime: "4.2s",
  },
  {
    id: "prototype-001",
    name: "Prototype Agent",
    specialization: "MVP Development & Validation",
    status: "error",
    model: "GPT-4 Technical",
    securityClearance: "Internal",
    capabilities: ["wireframes", "data-models", "integration-specs"],
    tasksCompleted: 8,
    avgResponseTime: "5.1s",
    progress: 0,
  },
]

const statusColors = {
  active: "bg-green-100 text-green-800",
  idle: "bg-gray-100 text-gray-800",
  error: "bg-red-100 text-red-800",
  maintenance: "bg-yellow-100 text-yellow-800",
}

const statusIcons = {
  active: Activity,
  idle: Clock,
  error: AlertTriangle,
  maintenance: Settings,
}

export function AgentOrchestrator() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)

  const activeAgents = agents.filter((a) => a.status === "active").length
  const totalTasks = agents.reduce((sum, agent) => sum + agent.tasksCompleted, 0)
  const avgResponseTime = "2.8s"

  return (
    <div className="space-y-6">
      {/* Agent Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeAgents}</div>
            <p className="text-xs text-gray-500">of {agents.length} total agents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tasks Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalTasks}</div>
            <p className="text-xs text-gray-500">across all agents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{avgResponseTime}</div>
            <p className="text-xs text-gray-500">system-wide average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Operational</div>
            <p className="text-xs text-gray-500">all systems normal</p>
          </CardContent>
        </Card>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {agents.map((agent) => {
          const StatusIcon = statusIcons[agent.status]

          return (
            <Card
              key={agent.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedAgent === agent.id ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setSelectedAgent(agent.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium">{agent.name}</CardTitle>
                      <p className="text-xs text-gray-500">{agent.specialization}</p>
                    </div>
                  </div>
                  <Badge className={statusColors[agent.status]}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {agent.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Current Task */}
                {agent.currentTask && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">Current Task</span>
                      <span className="text-xs text-gray-500">{agent.progress}%</span>
                    </div>
                    <p className="text-xs text-gray-600">{agent.currentTask}</p>
                    <Progress value={agent.progress} className="h-2" />
                  </div>
                )}

                {/* Agent Details */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-medium text-gray-700">Model:</span>
                    <p className="text-gray-600">{agent.model}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Clearance:</span>
                    <p className="text-gray-600">{agent.securityClearance}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Tasks:</span>
                    <p className="text-gray-600">{agent.tasksCompleted}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Avg Time:</span>
                    <p className="text-gray-600">{agent.avgResponseTime}</p>
                  </div>
                </div>

                {/* Capabilities */}
                <div>
                  <span className="text-xs font-medium text-gray-700 mb-2 block">Capabilities</span>
                  <div className="flex flex-wrap gap-1">
                    {agent.capabilities.slice(0, 2).map((capability) => (
                      <Badge key={capability} variant="secondary" className="text-xs">
                        {capability}
                      </Badge>
                    ))}
                    {agent.capabilities.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{agent.capabilities.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 pt-2">
                  {agent.status === "active" ? (
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      <Pause className="w-3 h-3 mr-1" />
                      Pause
                    </Button>
                  ) : (
                    <Button size="sm" className="flex-1">
                      <Play className="w-3 h-3 mr-1" />
                      Start
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <Settings className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Agent Configuration Panel */}
      {selectedAgent && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Agent Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Configuration Form */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">YAML Configuration</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                  <pre>{`agent:
  id: "${selectedAgent}"
  name: "${agents.find((a) => a.id === selectedAgent)?.name}"
  specialization: "${agents.find((a) => a.id === selectedAgent)?.specialization}"
  model:
    provider: "internal-openai"
    modelName: "${agents.find((a) => a.id === selectedAgent)?.model}"
    temperature: 0.3
  securityClearance: "${agents.find((a) => a.id === selectedAgent)?.securityClearance}"
  capabilities:${agents
    .find((a) => a.id === selectedAgent)
    ?.capabilities.map((c) => `\n    - "${c}"`)
    .join("")}
  
workflow:
  maxConcurrentTasks: 3
  timeoutMinutes: 30
  retryAttempts: 2
  
monitoring:
  enableMetrics: true
  logLevel: "info"
  alertThreshold: 5000ms`}</pre>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Performance Metrics</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Success Rate</span>
                    <span className="text-sm text-green-600">98.5%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Error Rate</span>
                    <span className="text-sm text-red-600">1.5%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Avg Processing Time</span>
                    <span className="text-sm text-blue-600">
                      {agents.find((a) => a.id === selectedAgent)?.avgResponseTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Queue Length</span>
                    <span className="text-sm text-purple-600">2 tasks</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
