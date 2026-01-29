import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

function calculateStartDate(dueDate: Date, estimatedHours: number): Date {
  const daysNeeded = Math.ceil(estimatedHours / 8) || 1 // 8-hour workdays
  const startDate = new Date(dueDate)
  startDate.setDate(startDate.getDate() - daysNeeded)
  return startDate
}

// GET /api/tasks - List all tasks with optional project filter
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('project_id')
    const includeArchived = searchParams.get('archived') === 'true'
    const searchQuery = searchParams.get('search')

    const tasks = await prisma.task.findMany({
      where: {
        ...(projectId && { project_id: projectId }),
        ...(includeArchived ? {} : { archived: false }),
        ...(searchQuery && {
          OR: [
            { title: { contains: searchQuery } },
            { description: { contains: searchQuery } },
          ],
        }),
      },
      include: {
        project: true,
        dependencies: {
          include: {
            depends_on_task: true,
          },
        },
        blocking_tasks: {
          include: {
            task: true,
          },
        },
        subtasks: {
          where: { archived: false },
        },
        parent_task: true,
        recurring_template: true,
        _count: {
          select: { subtasks: true },
        },
      },
      orderBy: { created_at: 'desc' },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate project_id
    if (!body.project_id) {
      return NextResponse.json(
        { error: 'project_id is required' },
        { status: 400 }
      )
    }

    // Calculate start_date if not provided but due_date and estimated_hours are
    let startDate = body.start_date ? new Date(body.start_date) : null
    const dueDate = body.due_date ? new Date(body.due_date) : null

    if (!startDate && dueDate && body.estimated_hours) {
      startDate = calculateStartDate(dueDate, body.estimated_hours)
    }

    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description || null,
        status: body.status || 'backlog',
        priority: body.priority || 'medium',
        project_id: body.project_id,
        start_date: startDate,
        due_date: dueDate,
        estimated_hours: body.estimated_hours || null,
        archived: false,
        parent_task_id: body.parent_task_id || null,
        is_recurring: body.is_recurring || false,
        recurring_template_id: body.recurring_template_id || null,
        recurrence_instance_date: body.recurrence_instance_date
          ? new Date(body.recurrence_instance_date)
          : null,
        needs_ai_briefing: body.needs_ai_briefing || false,
      },
      include: {
        project: true,
        dependencies: {
          include: {
            depends_on_task: true,
          },
        },
        blocking_tasks: {
          include: {
            task: true,
          },
        },
        subtasks: true,
        parent_task: true,
        recurring_template: true,
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error: any) {
    console.error('Error creating task:', error)
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid project_id' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
