"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users, AlertTriangle } from "lucide-react"

interface GanttTask {
  id: string
  name: string
  phase: string
  startDate: string
  endDate: string
  progress: number
  assignee: string
  dependencies: string[]
  status: "not-started" | "in-progress" | "completed" | "delayed"
  critical: boolean
}

const tasks: GanttTask[] = [
  {
    id: "1",
    name: "Stakeholder Discovery",
    phase: "Discovery",
    startDate: "2024-01-15",
    endDate: "2024-02-15",
    progress: 75,
    assignee: "Discovery Agent",
    dependencies: [],
    status: "in-progress",
    critical: true,
  },
  {
    id: "2",
    name: "Regulatory Assessment",
    phase: "Discovery",
    startDate: "2024-01-20",
    endDate: "2024-02-10",
    progress: 90,
    assignee: "Compliance Agent",
    dependencies: [],
    status: "in-progress",
    critical: true,
  },
  {
    id: "3",
    name: "Requirements Analysis",
    phase: "Analysis",
    startDate: "2024-02-01",
    endDate: "2024-02-28",
    progress: 30,
    assignee: "Analysis Agent",
    dependencies: ["1"],
    status: "in-progress",
    critical: false,
  },
  {
    id: "4",
    name: "Risk Assessment",
    phase: "Analysis",
    startDate: "2024-02-10",
    endDate: "2024-03-05",
    progress: 0,
    assignee: "Risk Agent",
    dependencies: ["2"],
    status: "not-started",
    critical: true,
  },
  {
    id: "5",
    name: "Technical Documentation",
    phase: "Documentation",
    startDate: "2024-02-20",
    endDate: "2024-03-15",
    progress: 0,
    assignee: "Documentation Agent",
    dependencies: ["3"],
    status: "not-started",
    critical: false,
  },
  {
    id: "6",
    name: "Prototype Development",
    phase: "Prototype",
    startDate: "2024-03-01",
    endDate: "2024-03-30",
    progress: 0,
    assignee: "Prototype Agent",
    dependencies: ["4", "5"],
    status: "not-started",
    critical: true,
  },
]

const phases = ["Discovery", "Analysis", "Documentation", "Prototype", "Review", "Approved"]
const phaseColors = {
  Discovery: "bg-purple-100 text-purple-800",
  Analysis: "bg-blue-100 text-blue-800",
  Documentation: "bg-green-100 text-green-800",
  Prototype: "bg-orange-100 text-orange-800",
  Review: "bg-yellow-100 text-yellow-800",
  Approved: "bg-emerald-100 text-emerald-800",
}

const statusColors = {
  "not-started": "bg-gray-100 text-gray-800",
  "in-progress": "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  delayed: "bg-red-100 text-red-800",
}

export function GanttChart() {
  const generateTimelineMonths = () => {
    const months = []
    const start = new Date("2024-01-01")
    for (let i = 0; i < 6; i++) {
      const month = new Date(start.getFullYear(), start.getMonth() + i, 1)
      months.push(month.toLocaleDateString("en-US", { month: "short", year: "numeric" }))
    }
    return months
  }

  const getTaskPosition = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const projectStart = new Date("2024-01-01")
    const projectEnd = new Date("2024-06-30")

    const startPercent =
      ((start.getTime() - projectStart.getTime()) / (projectEnd.getTime() - projectStart.getTime())) * 100
    const duration = ((end.getTime() - start.getTime()) / (projectEnd.getTime() - projectStart.getTime())) * 100

    return { left: `${startPercent}%`, width: `${duration}%` }
  }

  return (
    <div className="space-y-6">
      {/* Timeline Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Project Timeline</h2>
          <p className="text-gray-600">Payment System Modernization - Gantt View</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            View Calendar
          </Button>
          <Button size="sm">
            <Clock className="w-4 h-4 mr-2" />
            Critical Path
          </Button>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Project Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">6 months</div>
            <p className="text-xs text-gray-500">Jan 2024 - Jun 2024</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tasks Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">45%</div>
            <p className="text-xs text-gray-500">3 of 6 tasks in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Critical Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">4</div>
            <p className="text-xs text-gray-500">on critical path</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Team Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">85%</div>
            <p className="text-xs text-gray-500">5 agents active</p>
          </CardContent>
        </Card>
      </div>

      {/* Gantt Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Timeline Header */}
            <div className="flex">
              <div className="w-80 flex-shrink-0"></div>
              <div className="flex-1 grid grid-cols-6 gap-0 border-b">
                {generateTimelineMonths().map((month, index) => (
                  <div key={index} className="p-2 text-center text-sm font-medium text-gray-600 border-r">
                    {month}
                  </div>
                ))}
              </div>
            </div>

            {/* Task Rows */}
            <div className="space-y-2">
              {tasks.map((task) => {
                const position = getTaskPosition(task.startDate, task.endDate)

                return (
                  <div key={task.id} className="flex items-center">
                    {/* Task Info */}
                    <div className="w-80 flex-shrink-0 pr-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-sm text-gray-900 flex items-center">
                            {task.name}
                            {task.critical && <AlertTriangle className="w-3 h-3 ml-1 text-red-500" />}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={phaseColors[task.phase as keyof typeof phaseColors]} size="sm">
                              {task.phase}
                            </Badge>
                            <Badge className={statusColors[task.status]} size="sm">
                              {task.status.replace("-", " ")}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">{task.progress}%</div>
                      </div>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <Users className="w-3 h-3 mr-1" />
                        {task.assignee}
                      </div>
                    </div>

                    {/* Timeline Bar */}
                    <div className="flex-1 relative h-8 bg-gray-50 rounded">
                      <div
                        className={`absolute top-1 bottom-1 rounded ${task.critical ? "bg-red-200" : "bg-blue-200"}`}
                        style={position}
                      >
                        <div
                          className={`h-full rounded ${task.critical ? "bg-red-500" : "bg-blue-500"}`}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>

                      {/* Task dates */}
                      <div className="absolute -bottom-5 left-0 text-xs text-gray-500">
                        {new Date(task.startDate).toLocaleDateString()}
                      </div>
                      <div className="absolute -bottom-5 right-0 text-xs text-gray-500">
                        {new Date(task.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center space-x-6 pt-4 border-t">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-2 bg-blue-500 rounded"></div>
                <span className="text-xs text-gray-600">Regular Task</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-2 bg-red-500 rounded"></div>
                <span className="text-xs text-gray-600">Critical Path</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-2 bg-gray-300 rounded"></div>
                <span className="text-xs text-gray-600">Not Started</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
