"use client"

import { useState } from "react"
import { KanbanBoard } from "@/components/kanban-board"
import { GanttChart } from "@/components/gantt-chart"
import { DocumentEditor } from "@/components/document-editor"
import { AgentOrchestrator } from "@/components/agent-orchestrator"
import { IntegrationHub } from "@/components/integration-hub"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Bot, FileText, GitBranch, Shield, Calendar, Settings, Bell } from "lucide-react"

export default function TreasuryTransformationHub() {
  const [activeProject, setActiveProject] = useState("payment-modernization")
  const [notifications, setNotifications] = useState(3)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Treasury Transformation Hub</h1>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                SOX Compliant
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500">
                    {notifications}
                  </Badge>
                )}
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">TL</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Project Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">3</div>
              <p className="text-xs text-gray-500">2 in progress, 1 in review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">AI Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">5</div>
              <p className="text-xs text-gray-500">All systems operational</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Compliance Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">98%</div>
              <p className="text-xs text-gray-500">SOX, Basel III compliant</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Risk Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">Low</div>
              <p className="text-xs text-gray-500">2 items need attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="kanban" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6 bg-white">
            <TabsTrigger value="kanban" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Kanban</span>
            </TabsTrigger>
            <TabsTrigger value="gantt" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Documents</span>
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center space-x-2">
              <Bot className="w-4 h-4" />
              <span>AI Agents</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center space-x-2">
              <GitBranch className="w-4 h-4" />
              <span>Integrations</span>
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Compliance</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kanban" className="space-y-4">
            <KanbanBoard />
          </TabsContent>

          <TabsContent value="gantt" className="space-y-4">
            <GanttChart />
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <DocumentEditor />
          </TabsContent>

          <TabsContent value="agents" className="space-y-4">
            <AgentOrchestrator />
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4">
            <IntegrationHub />
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-green-900">SOX Compliance</h3>
                      <p className="text-sm text-green-700">All controls documented and tested</p>
                    </div>
                    <Badge className="bg-green-500">Compliant</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-blue-900">Basel III</h3>
                      <p className="text-sm text-blue-700">Capital requirements documented</p>
                    </div>
                    <Badge className="bg-blue-500">Compliant</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-yellow-900">GDPR</h3>
                      <p className="text-sm text-yellow-700">2 items require review</p>
                    </div>
                    <Badge className="bg-yellow-500">Review Required</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
