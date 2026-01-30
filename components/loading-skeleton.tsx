'use client'

import { Card, CardContent, CardHeader } from './ui/card'
import { cn } from '@/lib/utils'

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("animate-pulse", className)}>
      <CardHeader>
        <div className="h-4 bg-muted rounded w-1/2"></div>
      </CardHeader>
      <CardContent>
        <div className="h-8 bg-muted rounded w-3/4"></div>
      </CardContent>
    </Card>
  )
}

export function TaskCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-3 bg-muted rounded w-full"></div>
        <div className="h-3 bg-muted rounded w-2/3"></div>
        <div className="flex gap-2">
          <div className="h-5 bg-muted rounded w-16"></div>
          <div className="h-5 bg-muted rounded w-20"></div>
        </div>
      </div>
    </Card>
  )
}

export function KanbanColumnSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 border min-h-[500px] bg-card">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
        <div className="h-5 bg-muted rounded w-8 animate-pulse"></div>
      </div>
      <div className="flex flex-col gap-2">
        {[...Array(3)].map((_, i) => (
          <TaskCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
