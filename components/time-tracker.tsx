"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Play, Square, Clock, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { startTimeEntry, stopTimeEntry, getTimeEntries } from "@/actions/time-tracking-actions"
import type { Task } from "@/lib/database"

interface TimeTrackerProps {
  task: Task
  agentId: number
}

interface TimeEntry {
  id: number
  start_time: string
  end_time: string | null
  duration_minutes: number | null
  description: string | null
  created_at: string
}

export function TimeTracker({ task, agentId }: TimeTrackerProps) {
  const [isTracking, setIsTracking] = useState(false)
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [description, setDescription] = useState("")
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])

  useEffect(() => {
    loadTimeEntries()
  }, [task.id])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTracking && currentEntry) {
      interval = setInterval(() => {
        const startTime = new Date(currentEntry.start_time).getTime()
        const now = new Date().getTime()
        setElapsedTime(Math.floor((now - startTime) / 1000))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTracking, currentEntry])

  const loadTimeEntries = async () => {
    const entries = await getTimeEntries(task.id)
    setTimeEntries(entries)
  }

  const handleStart = async () => {
    const entry = await startTimeEntry(task.id, agentId, description)
    setCurrentEntry(entry)
    setIsTracking(true)
    setElapsedTime(0)
  }

  const handleStop = async () => {
    if (currentEntry) {
      await stopTimeEntry(currentEntry.id, description)
      setIsTracking(false)
      setCurrentEntry(null)
      setElapsedTime(0)
      setDescription("")
      loadTimeEntries()
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const totalTime = timeEntries.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4" />
          Time Tracking
          <Badge variant="secondary" className="text-xs">
            Total: {formatDuration(totalTime)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Timer */}
        <div className="text-center">
          <div className="text-3xl font-mono font-bold text-gray-900 mb-4">{formatTime(elapsedTime)}</div>
          <div className="flex items-center justify-center gap-2">
            {!isTracking ? (
              <Button onClick={handleStart} className="gap-2">
                <Play className="h-4 w-4" />
                Start
              </Button>
            ) : (
              <Button onClick={handleStop} variant="destructive" className="gap-2">
                <Square className="h-4 w-4" />
                Stop
              </Button>
            )}
          </div>
        </div>

        {/* Description Input */}
        <div className="space-y-2">
          <Label htmlFor="description">Work Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What are you working on?"
            rows={2}
            disabled={isTracking}
          />
        </div>

        {/* Time Entries History */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Recent Entries</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {timeEntries.slice(0, 5).map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="text-xs">
                    {entry.duration_minutes ? formatDuration(entry.duration_minutes) : "In Progress"}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {new Date(entry.created_at).toLocaleDateString()}
                  </div>
                </div>
                {entry.description && <p className="text-xs text-gray-600">{entry.description}</p>}
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
