'use client'

import React, { useState } from 'react'
import { CreateTaskInput, EnergyLevel } from '@/types/task'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, Zap, Coffee, BatteryLow, Send } from 'lucide-react'

interface TaskInputProps {
  onSubmit: (data: CreateTaskInput, file?: File) => void
  isLoading?: boolean
}

export function TaskInput({ onSubmit, isLoading }: TaskInputProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [energy, setEnergy] = useState<EnergyLevel>('medium')
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onSubmit({
      title,
      description, 
      energy_level: energy,
      category: 'neutral', 
    }, file || undefined)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto border-2 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">What&apos;s on your mind?</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-lg">Task Name</Label>
            <Input 
              id="title"
              placeholder="e.g., Study for Chem Midterm" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg py-6"
              required
            />
          </div>

          {/* Description / Brain Dump */}
          <div className="space-y-2">
            <Label htmlFor="desc">Quick Description</Label>
            <Textarea 
              id="desc"
              placeholder="Paste the syllabus requirements or just vent about what needs to be done..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          {/* File Upload Area */}
          <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer relative">
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".pdf,.txt,.doc,.docx"
            />
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">
              {file ? file.name : "Drop a PDF or homework file here"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Optional - we&apos;ll use this to break down tasks</p>
          </div>

          {/* Energy Level Selection */}
          <div className="space-y-3">
            <Label className="text-lg">How much energy do you have?</Label>
            <div className="grid grid-cols-3 gap-4">
              <Button
                type="button"
                variant={energy === 'low' ? 'default' : 'outline'}
                className={`h-20 flex flex-col gap-2 ${energy === 'low' ? 'bg-red-500 hover:bg-red-600' : ''}`}
                onClick={() => setEnergy('low')}
              >
                <BatteryLow className="h-6 w-6" />
                <span>Low</span>
              </Button>
              <Button
                type="button"
                variant={energy === 'medium' ? 'default' : 'outline'}
                className={`h-20 flex flex-col gap-2 ${energy === 'medium' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}`}
                onClick={() => setEnergy('medium')}
              >
                <Coffee className="h-6 w-6" />
                <span>Medium</span>
              </Button>
              <Button
                type="button"
                variant={energy === 'high' ? 'default' : 'outline'}
                className={`h-20 flex flex-col gap-2 ${energy === 'high' ? 'bg-green-500 hover:bg-green-600' : ''}`}
                onClick={() => setEnergy('high')}
              >
                <Zap className="h-6 w-6" />
                <span>High</span>
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full h-14 text-xl gap-2" disabled={isLoading}>
            {isLoading ? "Breaking it down..." : (
              <>
                Let&apos;s Go <Send className="h-5 w-5" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
