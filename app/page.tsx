import { redirect } from 'next/navigation'
import { getUserFromRequest } from '@/lib/auth-server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, AlertCircle, TrendingUp, Package, Calendar } from 'lucide-react'
import { format, isToday, isTomorrow, differenceInDays, isBefore } from 'date-fns'
import Link from 'next/link'

async function getDashboardData() {
  const tasks = await prisma.task.findMany({
    where: { archived: false },
    include: {
      project: true,
      dependencies: {
        include: {
          depends_on_task: true,
        },
      },
    },
  })

  const statusCounts = {
    backlog: tasks.filter(t => t.status === 'backlog').length,
    todo: tasks.filter(t => t.status === 'todo').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    done: tasks.filter(t => t.status === 'done').length,
  }

  const totalTasks = tasks.length
  const completedTasks = statusCounts.done
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const totalHours = tasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0)
  const hoursInProgress = tasks.filter(t => t.status === 'in-progress').reduce((sum, t) => sum + (t.estimated_hours || 0), 0)

  const today = new Date()
  const overdueTasks = tasks.filter(t => t.due_date && isBefore(new Date(t.due_date), today) && t.status !== 'done')
  const dueToday = tasks.filter(t => t.due_date && isToday(new Date(t.due_date)) && t.status !== 'done')
  const dueThisWeek = tasks.filter(t => {
    if (!t.due_date || t.status === 'done') return false
    const dueDate = new Date(t.due_date)
    const days = differenceInDays(dueDate, today)
    return days >= 0 && days <= 7
  })

  const blockedTasks = tasks.filter(t =>
    t.dependencies?.some((dep: any) => dep.depends_on_task?.status !== 'done')
  )

  return {
    totalTasks,
    completedTasks,
    completionRate,
    statusCounts,
    totalHours,
    hoursInProgress,
    overdueTasks: overdueTasks.length,
    dueToday: dueToday.length,
    dueThisWeek: dueThisWeek.length,
    blockedTasks: blockedTasks.length,
    inProgressTasks: statusCounts['in-progress'],
  }
}

export default async function Home() {
  // Get user from request
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth-token')?.value
  
  if (!authToken) {
    redirect('/login')
  }
  
  // Create a mock request for getUserFromRequest
  const request = {
    cookies: {
      get: (name: string) => ({ value: name === 'auth-token' ? authToken : null }),
    },
  } as any
  
  const user = await getUserFromRequest(request)

  if (!user) {
    redirect('/login')
  }

  if (!user.onboarding_completed) {
    redirect('/onboarding')
  }

  const data = await getDashboardData()

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-12 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-medium tracking-tight mb-2">
          Welcome, {user.username}!
        </h1>
        <p className="text-muted-foreground">
          Your AI-native project management workspace
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-semibold">{data.totalTasks}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <span className="text-2xl font-semibold">{data.completionRate}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{data.completedTasks} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-400" />
              <span className="text-2xl font-semibold">{data.inProgressTasks}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{data.hoursInProgress}h estimated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Due This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-400" />
              <span className="text-2xl font-semibold">{data.dueThisWeek}</span>
            </div>
            {data.dueToday > 0 && (
              <p className="text-xs text-orange-400 mt-1">{data.dueToday} due today</p>
            )}
            {data.overdueTasks > 0 && (
              <p className="text-xs text-red-400 mt-1">{data.overdueTasks} overdue</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Backlog</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-400">{data.statusCounts.backlog}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">To Do</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-blue-400">{data.statusCounts.todo}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-purple-400">{data.statusCounts['in-progress']}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-orange-400">{data.statusCounts.review}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Done</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-emerald-400">{data.statusCounts.done}</div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(data.overdueTasks > 0 || data.blockedTasks > 0) && (
        <div className="mb-8 space-y-2">
          {data.overdueTasks > 0 && (
            <Card className="border-red-500/30 bg-red-500/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div>
                    <p className="font-medium text-red-400">{data.overdueTasks} overdue task{data.overdueTasks !== 1 ? 's' : ''}</p>
                    <p className="text-sm text-muted-foreground">Tasks past their due date</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {data.blockedTasks > 0 && (
            <Card className="border-orange-500/30 bg-orange-500/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-400" />
                  <div>
                    <p className="font-medium text-orange-400">{data.blockedTasks} blocked task{data.blockedTasks !== 1 ? 's' : ''}</p>
                    <p className="text-sm text-muted-foreground">Tasks waiting on dependencies</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <Link
          href="/kanban"
          className="p-6 border bg-card hover:bg-muted/50 transition-colors"
        >
          <h2 className="text-lg font-medium mb-2">Kanban Board</h2>
          <p className="text-sm text-muted-foreground">
            Manage your tasks with drag and drop
          </p>
        </Link>

        <Link
          href="/projects"
          className="p-6 border bg-card hover:bg-muted/50 transition-colors"
        >
          <h2 className="text-lg font-medium mb-2">Projects</h2>
          <p className="text-sm text-muted-foreground">
            Organize tasks by project
          </p>
        </Link>

        <Link
          href="/analytics"
          className="p-6 border bg-card hover:bg-muted/50 transition-colors"
        >
          <h2 className="text-lg font-medium mb-2">Analytics</h2>
          <p className="text-sm text-muted-foreground">
            View your productivity insights
          </p>
        </Link>
      </div>
    </div>
  )
}
