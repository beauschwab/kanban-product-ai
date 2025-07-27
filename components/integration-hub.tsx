"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { GitBranch, FileText, Share2, Github, Settings, CheckCircle, AlertCircle, Clock, Zap } from "lucide-react"

interface Integration {
  id: string
  name: string
  description: string
  icon: any
  status: "connected" | "disconnected" | "error" | "syncing"
  enabled: boolean
  lastSync: string
  syncFrequency: string
  features: string[]
  metrics: {
    totalSyncs: number
    successRate: number
    avgSyncTime: string
  }
}

const integrations: Integration[] = [
  {
    id: "jira",
    name: "Jira",
    description: "Project management and issue tracking",
    icon: GitBranch,
    status: "connected",
    enabled: true,
    lastSync: "2024-01-27 10:30 AM",
    syncFrequency: "Real-time",
    features: ["Bi-directional sync", "Epic mapping", "Custom fields", "Webhook support"],
    metrics: {
      totalSyncs: 1247,
      successRate: 99.2,
      avgSyncTime: "1.2s",
    },
  },
  {
    id: "confluence",
    name: "Confluence",
    description: "Documentation and knowledge management",
    icon: FileText,
    status: "connected",
    enabled: true,
    lastSync: "2024-01-27 10:25 AM",
    syncFrequency: "15 minutes",
    features: ["Auto-publish", "Template sync", "Space mapping", "Version control"],
    metrics: {
      totalSyncs: 892,
      successRate: 98.7,
      avgSyncTime: "2.1s",
    },
  },
  {
    id: "sharepoint",
    name: "SharePoint",
    description: "Document management and collaboration",
    icon: Share2,
    status: "syncing",
    enabled: true,
    lastSync: "2024-01-27 10:20 AM",
    syncFrequency: "Hourly",
    features: ["Document sync", "Approval workflows", "Power Automate", "Security inheritance"],
    metrics: {
      totalSyncs: 456,
      successRate: 97.8,
      avgSyncTime: "3.4s",
    },
  },
  {
    id: "github",
    name: "GitHub",
    description: "Code repository and version control",
    icon: Github,
    status: "connected",
    enabled: true,
    lastSync: "2024-01-27 10:35 AM",
    syncFrequency: "Real-time",
    features: ["Repository sync", "PR workflows", "Branch protection", "Security scanning"],
    metrics: {
      totalSyncs: 2134,
      successRate: 99.8,
      avgSyncTime: "0.8s",
    },
  },
  {
    id: "slack",
    name: "Slack",
    description: "Team communication and notifications",
    icon: Zap,
    status: "error",
    enabled: false,
    lastSync: "2024-01-26 3:45 PM",
    syncFrequency: "Real-time",
    features: ["Notifications", "Bot integration", "Channel sync", "File sharing"],
    metrics: {
      totalSyncs: 3421,
      successRate: 95.4,
      avgSyncTime: "0.5s",
    },
  },
]

const statusColors = {
  connected: "bg-green-100 text-green-800",
  disconnected: "bg-gray-100 text-gray-800",
  error: "bg-red-100 text-red-800",
  syncing: "bg-blue-100 text-blue-800",
}

const statusIcons = {
  connected: CheckCircle,
  disconnected: Clock,
  error: AlertCircle,
  syncing: Clock,
}

export function IntegrationHub() {
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null)

  const connectedIntegrations = integrations.filter((i) => i.status === "connected").length
  const totalSyncs = integrations.reduce((sum, integration) => sum + integration.metrics.totalSyncs, 0)
  const avgSuccessRate =
    integrations.reduce((sum, integration) => sum + integration.metrics.successRate, 0) / integrations.length

  return (
    <div className="space-y-6">
      {/* Integration Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Connected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{connectedIntegrations}</div>
            <p className="text-xs text-gray-500">of {integrations.length} integrations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Syncs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalSyncs.toLocaleString()}</div>
            <p className="text-xs text-gray-500">across all integrations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{avgSuccessRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-500">average across all</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Data Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">Active</div>
            <p className="text-xs text-gray-500">real-time syncing</p>
          </CardContent>
        </Card>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {integrations.map((integration) => {
          const StatusIcon = statusIcons[integration.status]
          const IntegrationIcon = integration.icon

          return (
            <Card
              key={integration.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedIntegration === integration.id ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setSelectedIntegration(integration.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <IntegrationIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-medium">{integration.name}</CardTitle>
                      <p className="text-sm text-gray-500">{integration.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={statusColors[integration.status]}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {integration.status}
                    </Badge>
                    <Switch checked={integration.enabled} />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Sync Information */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Last Sync:</span>
                    <p className="text-gray-600">{integration.lastSync}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Frequency:</span>
                    <p className="text-gray-600">{integration.syncFrequency}</p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-bold text-blue-600">{integration.metrics.totalSyncs}</div>
                    <div className="text-xs text-gray-500">Total Syncs</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-bold text-green-600">{integration.metrics.successRate}%</div>
                    <div className="text-xs text-gray-500">Success Rate</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-bold text-purple-600">{integration.metrics.avgSyncTime}</div>
                    <div className="text-xs text-gray-500">Avg Time</div>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <span className="text-sm font-medium text-gray-700 mb-2 block">Features</span>
                  <div className="flex flex-wrap gap-1">
                    {integration.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    <Settings className="w-3 h-3 mr-1" />
                    Configure
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    Test Connection
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Integration Configuration Panel */}
      {selectedIntegration && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {integrations.find((i) => i.id === selectedIntegration)?.name} Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* YAML Configuration */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Integration Settings</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                  <pre>{`integration:
  name: "${integrations.find((i) => i.id === selectedIntegration)?.name}"
  type: "${selectedIntegration}"
  enabled: ${integrations.find((i) => i.id === selectedIntegration)?.enabled}
  
connection:
  ${
    selectedIntegration === "jira"
      ? `baseUrl: "https://treasury.atlassian.net"
  authentication: "oauth2"
  projectKey: "TREAS"`
      : ""
  }${
    selectedIntegration === "confluence"
      ? `baseUrl: "https://treasury.atlassian.net/wiki"
  spaceKey: "TREASURY"
  authentication: "oauth2"`
      : ""
  }${
    selectedIntegration === "sharepoint"
      ? `tenantUrl: "https://treasury.sharepoint.com"
  siteCollection: "/sites/treasury-transformation"
  authentication: "certificate"`
      : ""
  }${
    selectedIntegration === "github"
      ? `organization: "treasury-corp"
  repository: "payment-modernization"
  authentication: "token"`
      : ""
  }${
    selectedIntegration === "slack"
      ? `workspace: "treasury-team"
  botToken: "${process.env.SLACK_BOT_TOKEN}"
  channels: ["#treasury-updates", "#compliance"]`
      : ""
  }
  
sync:
  frequency: "${integrations.find((i) => i.id === selectedIntegration)?.syncFrequency}"
  bidirectional: true
  conflictResolution: "manual"
  
features:${integrations
                    .find((i) => i.id === selectedIntegration)
                    ?.features.map((f) => `\n  - "${f}"`)
                    .join("")}
  
monitoring:
  enableMetrics: true
  alertOnFailure: true
  retryAttempts: 3`}</pre>
                </div>
              </div>

              {/* Sync History */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Recent Sync Activity</h3>
                <div className="space-y-2">
                  {[
                    { time: "10:35 AM", status: "success", message: "Synced 12 items successfully" },
                    { time: "10:30 AM", status: "success", message: "Configuration updated" },
                    { time: "10:25 AM", status: "success", message: "Synced 8 items successfully" },
                    { time: "10:20 AM", status: "warning", message: "2 items skipped due to conflicts" },
                    { time: "10:15 AM", status: "success", message: "Synced 15 items successfully" },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          activity.status === "success"
                            ? "bg-green-500"
                            : activity.status === "warning"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
