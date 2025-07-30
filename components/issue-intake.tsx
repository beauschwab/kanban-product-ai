"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle, AlertTriangle, Clock, User, Calendar, Bug } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Issue } from "@/lib/database"
import { getIssuesData, createTasksFromIssues } from "@/actions/issue-actions"

interface IssueIntakeProps {
  onIssuesConverted: () => void
}

const severityColors = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-red-100 text-red-800 border-red-200",
}

const severityIcons = {
  low: CheckCircle,
  medium: Clock,
  high: AlertTriangle,
}

export function IssueIntake({ onIssuesConverted }: IssueIntakeProps) {
  const [issues, setIssues] = useState<Issue[]>([])
  const [selectedIssues, setSelectedIssues] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadIssues()
  }, [])

  const loadIssues = async () => {
    const data = await getIssuesData()
    setIssues(data)
  }

  const handleSelectIssue = (issueId: number, checked: boolean) => {
    const newSelected = new Set(selectedIssues)
    if (checked) {
      newSelected.add(issueId)
    } else {
      newSelected.delete(issueId)
    }
    setSelectedIssues(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const availableIssues = issues.filter((issue) => !issue.selected_for_kanban && !issue.kanban_task_id)
      setSelectedIssues(new Set(availableIssues.map((issue) => issue.id)))
    } else {
      setSelectedIssues(new Set())
    }
  }

  const handleCreateTasks = async () => {
    if (selectedIssues.size === 0) return

    setIsLoading(true)
    await createTasksFromIssues(Array.from(selectedIssues))
    setSelectedIssues(new Set())
    await loadIssues()
    onIssuesConverted()
    setIsLoading(false)
  }

  const availableIssues = issues.filter((issue) => !issue.selected_for_kanban && !issue.kanban_task_id)
  const convertedIssues = issues.filter((issue) => issue.kanban_task_id)

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Issue Intake
            <Badge variant="secondary">{availableIssues.length} pending</Badge>
          </CardTitle>
          <Button onClick={handleCreateTasks} disabled={selectedIssues.size === 0 || isLoading} size="sm">
            {isLoading ? "Creating..." : `Create ${selectedIssues.size} Tasks`}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={availableIssues.length > 0 && selectedIssues.size === availableIssues.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {issues.map((issue) => {
                const SeverityIcon = severityIcons[issue.severity]
                const isConverted = !!issue.kanban_task_id
                const isSelected = selectedIssues.has(issue.id)

                return (
                  <motion.tr
                    key={issue.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`${isConverted ? "opacity-50 bg-gray-50" : ""} hover:bg-gray-50`}
                  >
                    <TableCell>
                      {!isConverted && (
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectIssue(issue.id, checked as boolean)}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{issue.title}</div>
                        <div className="text-xs text-gray-500 line-clamp-2">{issue.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${severityColors[issue.severity]}`}>
                        <SeverityIcon className="h-3 w-3 mr-1" />
                        {issue.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {issue.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs">
                        <User className="h-3 w-3" />
                        {issue.reporter}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {issue.reported_date ? new Date(issue.reported_date).toLocaleDateString() : "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isConverted ? "default" : "secondary"} className="text-xs">
                        {isConverted ? "Converted" : issue.status}
                      </Badge>
                    </TableCell>
                  </motion.tr>
                )
              })}
            </TableBody>
          </Table>
        </ScrollArea>

        {convertedIssues.length > 0 && (
          <div className="p-4 border-t bg-gray-50">
            <div className="text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 inline mr-1 text-green-600" />
              {convertedIssues.length} issues converted to Kanban tasks
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
