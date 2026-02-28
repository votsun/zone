'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

export function BrainDump() {
  const [text, setText] = useState('')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold italic text-muted-foreground">Empty your mind here...</h2>
        <Button variant="ghost" size="sm" onClick={() => setText('')}>Clear</Button>
      </div>
      <Card className="border-none shadow-none bg-secondary/20">
        <CardContent className="p-0">
          <Textarea 
            placeholder="Write down every single thing bothering you or needing attention. Don't worry about order or spelling."
            className="min-h-[300px] border-none focus-visible:ring-0 text-lg leading-relaxed bg-transparent resize-none p-6"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button className="gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90">
          <Sparkles className="h-4 w-4" />
          Structure this for me
        </Button>
      </div>
    </div>
  )
}