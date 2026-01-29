'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, X, Sparkles, FolderKanban, LayoutGrid, Zap, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const slides = [
  {
    title: 'Welcome to Ulrik 🐱',
    subtitle: 'AI-native project management',
    description: 'Built for conversations with your AI, not endless clicking. Let\'s get you started in 60 seconds!',
    icon: Sparkles,
    image: '🐱',
  },
  {
    title: 'Organize with Projects',
    subtitle: 'Group your tasks by context',
    description: 'Create projects for different areas of your life: Personal, Work, Side Projects, or anything else. Each project can have its own color and icon.',
    icon: FolderKanban,
    tips: [
      'Start with 2-3 projects to keep it simple',
      'Use emojis for quick visual identification',
      'Archive projects you\'re not actively working on',
    ],
  },
  {
    title: '5-Step Kanban Workflow',
    subtitle: 'From idea to done',
    description: 'Track your tasks through five stages: Backlog → To Do → In Progress → Review → Done. Drag and drop tasks between columns or let your AI manage them for you.',
    icon: LayoutGrid,
    tips: [
      'Use keyboard shortcuts for quick actions',
      'Backlog is for future ideas',
      'Only keep 3-5 tasks in "In Progress"',
    ],
  },
  {
    title: 'Powered by AI (Optional)',
    subtitle: 'Connect Ziggy or Claude',
    description: 'Ulrik works great standalone, but it\'s designed for AI. Connect via MCP (Model Context Protocol) to let your AI create tasks, manage priorities, and keep you organized.',
    icon: Zap,
    tips: [
      'Chat naturally: "Add a task to review the budget"',
      'Your AI can break down big tasks into subtasks',
      'Set up recurring tasks for daily/weekly routines',
    ],
    skipable: true,
  },
  {
    title: 'You\'re All Set! 🎉',
    subtitle: 'Start managing your tasks',
    description: 'You now know everything you need. Here are some quick tips to get productive immediately:',
    icon: CheckCircle2,
    tips: [
      'Press Cmd+K anywhere to quick-add tasks',
      'Check Analytics to see your progress over time',
      'Visit /recurring to set up recurring tasks',
      'Visit /settings/api-keys to set up MCP authentication',
    ],
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      handleFinish()
    }
  }

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const handleFinish = async () => {
    try {
      // Mark onboarding as complete via API
      await fetch('/api/auth/onboarding-complete', {
        method: 'POST',
      })
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error completing onboarding:', error)
      // Still redirect even if API call fails
      router.push('/')
      router.refresh()
    }
  }

  const slide = slides[currentSlide]
  const Icon = slide.icon
  const isLastSlide = currentSlide === slides.length - 1

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">

        {/* Main card */}
        <Card className="overflow-hidden">
          <CardContent className="p-8 md:p-12">
            <div className="space-y-8">
              {/* Progress indicator */}
              <div className="flex items-center gap-2">
                {slides.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      'h-1.5 rounded-full transition-all',
                      index === currentSlide
                        ? 'bg-primary w-12'
                        : index < currentSlide
                        ? 'bg-primary/50 w-8'
                        : 'bg-muted w-8'
                    )}
                  />
                ))}
              </div>

              {/* Icon/Image */}
              <div className="flex justify-center">
                {currentSlide === 0 ? (
                  <div className="text-9xl">{slide.image}</div>
                ) : (
                  <div className="rounded-full bg-primary/10 p-6">
                    <Icon className="h-16 w-16 text-primary" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="text-center space-y-3">
                <h1 className="text-4xl font-bold">{slide.title}</h1>
                <p className="text-xl text-primary">{slide.subtitle}</p>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  {slide.description}
                </p>
              </div>

              {/* Tips */}
              {slide.tips && (
                <div className="bg-muted/30 rounded-lg p-6 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    Quick Tips
                  </h3>
                  <ul className="space-y-2">
                    {slide.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentSlide === 0}
                  className="min-w-24"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>

                <div className="text-sm text-muted-foreground">
                  {currentSlide + 1} of {slides.length}
                </div>

                <Button
                  onClick={handleNext}
                  className="min-w-24"
                >
                  {isLastSlide ? (
                    <>
                      Start Using Ulrik
                      <CheckCircle2 className="h-4 w-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>

              {/* Keyboard hints */}
              <div className="text-center text-xs text-muted-foreground">
                <kbd className="px-2 py-1 bg-muted rounded">←</kbd>
                {' '}Back{' '}
                <kbd className="px-2 py-1 bg-muted rounded">→</kbd>
                {' '}Next{' '}
                <kbd className="px-2 py-1 bg-muted rounded">Esc</kbd>
                {' '}Skip
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer note */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          You can revisit this tutorial anytime from Settings
        </div>
      </div>
    </div>
  )
}
