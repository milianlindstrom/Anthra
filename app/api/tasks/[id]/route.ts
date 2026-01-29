import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

function calculateStartDate(dueDate: Date, estimatedHours: number): Date {
  const daysNeeded = Math.ceil(estimatedHours / 8) || 1
  const startDate = new Date(dueDate)
  startDate.setDate(startDate.getDate() - daysNeeded)
  return startDate
}

// GET /api/tasks/[id] - Get a single task
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
        dependencies: {
          include: {
            depends_on_task: {
              include: {
                project: true,
              },
            },
          },
        },
        blocking_tasks: {
          include: {
            task: {
              include: {
                project: true,
              },
            },
          },
        },
        subtasks: {
          where: { archived: false },
          include: {
            project: true,
          },
        },
        parent_task: {
          include: {
            project: true,
          },
        },
        recurring_template: true,
        _count: {
          select: { subtasks: true },
        },
      },
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    )
  }
}

// PATCH /api/tasks/[id] - Update a task
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { id } = params

    const updateData: any = {}
    
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.priority !== undefined) updateData.priority = body.priority
    if (body.project_id !== undefined) updateData.project_id = body.project_id
    if (body.estimated_hours !== undefined) updateData.estimated_hours = body.estimated_hours
    if (body.archived !== undefined) updateData.archived = body.archived
    if (body.parent_task_id !== undefined) updateData.parent_task_id = body.parent_task_id
    if (body.needs_ai_briefing !== undefined) updateData.needs_ai_briefing = body.needs_ai_briefing
    
    // Check if moving to in-progress - validate dependencies
    if (body.status !== undefined) {
      if (body.status === 'in-progress') {
        // Check if task has incomplete dependencies
        const dependencies = await prisma.taskDependency.findMany({
          where: { task_id: id },
          include: { depends_on_task: true },
        })

        const incompleteDeps = dependencies.filter(
          (dep) => dep.depends_on_task.status !== 'done'
        )

        if (incompleteDeps.length > 0) {
          const depTitles = incompleteDeps
            .map((dep) => dep.depends_on_task.title)
            .join(', ')
          return NextResponse.json(
            {
              error: `Cannot move to in-progress. Task is blocked by: ${depTitles}`,
              blocked_by: incompleteDeps.map((dep) => dep.depends_on_task),
            },
            { status: 400 }
          )
        }
      }
      updateData.status = body.status
    }
    
    if (body.start_date !== undefined) {
      updateData.start_date = body.start_date ? new Date(body.start_date) : null
    }
    
    if (body.due_date !== undefined) {
      updateData.due_date = body.due_date ? new Date(body.due_date) : null
      
      // Auto-calculate start_date if not explicitly provided and estimated_hours exists
      if (body.start_date === undefined && updateData.due_date && body.estimated_hours) {
        updateData.start_date = calculateStartDate(updateData.due_date, body.estimated_hours)
      }
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        project: true,
        dependencies: {
          include: {
            depends_on_task: {
              include: {
                project: true,
              },
            },
          },
        },
        blocking_tasks: {
          include: {
            task: {
              include: {
                project: true,
              },
            },
          },
        },
        subtasks: {
          include: {
            project: true,
          },
        },
        parent_task: {
          include: {
            project: true,
          },
        },
        recurring_template: true,
      },
    })

    return NextResponse.json(task)
  } catch (error: any) {
    console.error('Error updating task:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await prisma.task.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}
