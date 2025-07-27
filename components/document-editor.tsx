"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Code, Eye, Save, Share, Settings, Users, MessageSquare, GitBranch } from "lucide-react"

export function DocumentEditor() {
  const [activeDocument, setActiveDocument] = useState("requirements-spec")
  const [editorMode, setEditorMode] = useState<"rich" | "yaml" | "preview">("rich")

  const documents = [
    {
      id: "requirements-spec",
      title: "Payment System Requirements",
      type: "requirements",
      status: "draft",
      lastModified: "2024-01-27",
      collaborators: ["Sarah Chen", "Documentation Agent"],
      hasYaml: true,
    },
    {
      id: "compliance-checklist",
      title: "SOX Compliance Checklist",
      type: "compliance",
      status: "review",
      lastModified: "2024-01-26",
      collaborators: ["Compliance Agent", "Michael Torres"],
      hasYaml: true,
    },
    {
      id: "risk-assessment",
      title: "Risk Assessment Matrix",
      type: "risk",
      status: "approved",
      lastModified: "2024-01-25",
      collaborators: ["Risk Agent", "David Kim"],
      hasYaml: true,
    },
  ]

  const sampleRichContent = `# Payment System Modernization Requirements

## Executive Summary
This document outlines the functional and non-functional requirements for modernizing our treasury payment system infrastructure.

## Stakeholder Analysis
The following stakeholders have been identified through AI-assisted discovery:

### Primary Stakeholders
- **Treasury Operations Team**: Daily system users
- **Risk Management**: Compliance and risk oversight
- **IT Architecture**: Technical implementation
- **Compliance Officers**: Regulatory adherence

## Functional Requirements

### FR-001: Real-time Payment Processing
**Priority**: Critical
**Assigned Agent**: Analysis Agent
**Compliance Framework**: SOX, Basel III

The system must process payments in real-time with the following capabilities:
- Sub-second transaction processing
- 99.99% uptime requirement
- Automated reconciliation
- Fraud detection integration

### FR-002: Multi-currency Support
**Priority**: High
**Assigned Agent**: Discovery Agent

Support for major global currencies with:
- Real-time exchange rate integration
- Currency conversion tracking
- Regulatory reporting by jurisdiction`

  const sampleYamlContent = `# Payment System Configuration
project:
  name: "Payment System Modernization"
  id: "payment-modernization-2024"
  phase: "requirements"
  
stakeholders:
  primary:
    - role: "Treasury Lead"
      name: "Sarah Chen"
      responsibilities: ["oversight", "approval"]
      clearance: "confidential"
    - role: "Risk Manager"
      name: "Michael Torres"
      responsibilities: ["risk-assessment", "compliance"]
      clearance: "restricted"
      
agents:
  discovery:
    id: "discovery-agent-001"
    specialization: "stakeholder-analysis"
    model:
      provider: "internal-openai"
      modelName: "gpt-4-treasury"
      temperature: 0.3
    securityClearance: "internal"
    capabilities:
      - "stakeholder-mapping"
      - "regulatory-research"
      - "market-analysis"
      
  compliance:
    id: "compliance-agent-001"
    specialization: "regulatory-compliance"
    model:
      provider: "internal-openai"
      modelName: "gpt-4-compliance"
      temperature: 0.1
    securityClearance: "restricted"
    capabilities:
      - "sox-validation"
      - "basel-iii-compliance"
      - "audit-trail-generation"

requirements:
  functional:
    - id: "FR-001"
      title: "Real-time Payment Processing"
      priority: "critical"
      assignedAgent: "analysis-agent"
      complianceFramework: ["SOX", "Basel-III"]
      acceptance:
        - "Sub-second processing"
        - "99.99% uptime"
        - "Automated reconciliation"
        
  nonFunctional:
    - id: "NFR-001"
      title: "Security Requirements"
      priority: "critical"
      requirements:
        - "End-to-end encryption"
        - "Multi-factor authentication"
        - "Audit logging"

compliance:
  frameworks:
    - name: "SOX"
      sections:
        - id: "SOX-302"
          title: "CEO/CFO Certification"
          status: "in-progress"
          assignedAgent: "compliance-agent"
        - id: "SOX-404"
          title: "Management Assessment"
          status: "pending"
          
integrations:
  jira:
    enabled: true
    projectKey: "TREAS"
    epicMapping: "payment-modernization"
    
  confluence:
    enabled: true
    spaceKey: "TREASURY"
    autoPublish: true
    
  github:
    enabled: true
    repository: "treasury/payment-modernization"
    branch: "feature/requirements"`

  return (
    <div className="space-y-4">
      {/* Document Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Treasury Documentation Hub</h2>
          <p className="text-gray-600">Unified rich text and YAML configuration editor</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Document List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  activeDocument === doc.id ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                }`}
                onClick={() => setActiveDocument(doc.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">{doc.title}</h3>
                  {doc.hasYaml && (
                    <Badge variant="secondary" className="text-xs">
                      <Code className="w-3 h-3 mr-1" />
                      YAML
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <Badge
                    className={`text-xs ${
                      doc.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : doc.status === "review"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {doc.status}
                  </Badge>
                  <span>{doc.lastModified}</span>
                </div>
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <Users className="w-3 h-3 mr-1" />
                  <span>{doc.collaborators.length} collaborators</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Editor */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{documents.find((d) => d.id === activeDocument)?.title}</CardTitle>
              <div className="flex items-center space-x-2">
                <Tabs value={editorMode} onValueChange={(value) => setEditorMode(value as any)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="rich" className="text-xs">
                      <FileText className="w-3 h-3 mr-1" />
                      Rich Text
                    </TabsTrigger>
                    <TabsTrigger value="yaml" className="text-xs">
                      <Code className="w-3 h-3 mr-1" />
                      YAML
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="text-xs">
                      <Eye className="w-3 h-3 mr-1" />
                      Preview
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {editorMode === "rich" && (
              <div className="space-y-4">
                <div className="border rounded-lg p-4 min-h-[500px] bg-white">
                  <div className="prose max-w-none">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: sampleRichContent
                          .replace(/\n/g, "<br>")
                          .replace(/#{1,6} /g, "<h3>")
                          .replace(/<h3>/g, '</p><h3 class="text-lg font-semibold mt-4 mb-2">')
                          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
                      }}
                    />
                  </div>
                </div>

                {/* Collaboration Panel */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">3 collaborators online</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">2 comments</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <GitBranch className="w-4 h-4 mr-2" />
                    View Changes
                  </Button>
                </div>
              </div>
            )}

            {editorMode === "yaml" && (
              <div className="space-y-4">
                <div className="border rounded-lg bg-gray-900 text-gray-100 p-4 min-h-[500px] font-mono text-sm overflow-auto">
                  <pre>{sampleYamlContent}</pre>
                </div>

                {/* YAML Validation */}
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-800">YAML is valid</span>
                  </div>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Schema Settings
                  </Button>
                </div>
              </div>
            )}

            {editorMode === "preview" && (
              <div className="border rounded-lg p-4 min-h-[500px] bg-white">
                <div className="prose max-w-none">
                  <h1 className="text-2xl font-bold mb-4">Payment System Modernization Requirements</h1>
                  <h2 className="text-xl font-semibold mb-3">Executive Summary</h2>
                  <p className="mb-4">
                    This document outlines the functional and non-functional requirements for modernizing our treasury
                    payment system infrastructure.
                  </p>

                  <h2 className="text-xl font-semibold mb-3">Stakeholder Analysis</h2>
                  <p className="mb-4">The following stakeholders have been identified through AI-assisted discovery:</p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Treasury Operations Team</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">Daily system users</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Risk Management</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">Compliance and risk oversight</p>
                      </CardContent>
                    </Card>
                  </div>

                  <h2 className="text-xl font-semibold mb-3">Functional Requirements</h2>
                  <Card className="mb-4">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">FR-001: Real-time Payment Processing</CardTitle>
                        <Badge className="bg-red-100 text-red-800">Critical</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-2">Assigned Agent: Analysis Agent</p>
                      <p className="text-sm text-gray-600 mb-2">Compliance Framework: SOX, Basel III</p>
                      <ul className="text-sm space-y-1">
                        <li>• Sub-second transaction processing</li>
                        <li>• 99.99% uptime requirement</li>
                        <li>• Automated reconciliation</li>
                        <li>• Fraud detection integration</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
