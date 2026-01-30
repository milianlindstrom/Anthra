'use client'

import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <Card className={cn("text-center py-12 md:py-16", className)}>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <div className="rounded-full bg-muted/50 p-4">
            <Icon className="h-8 w-8 md:h-12 md:w-12 text-muted-foreground/60" />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {description}
          </p>
        </div>
        {action && (
          <Button onClick={action.onClick} className="mt-4">
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
