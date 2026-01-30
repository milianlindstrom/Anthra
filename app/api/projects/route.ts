import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/projects - Get all projects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const archivedParam = searchParams.get('archived')

    // Handle archived parameter:
    // - archived=true: only archived projects
    // - archived=false or no param: only non-archived projects (default)
    const archivedFilter = archivedParam === 'true' 
      ? { archived: true } 
      : { archived: false }

    const projects = await prisma.project.findMany({
      where: archivedFilter,
      include: {
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, color, icon } = body

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    // Check if slug already exists
    const existingProject = await prisma.project.findUnique({
      where: { slug },
    })

    if (existingProject) {
      // Append a random suffix to make it unique
      const uniqueSlug = `${slug}-${Date.now().toString(36)}`
      
      const project = await prisma.project.create({
        data: {
          name: name.trim(),
          slug: uniqueSlug,
          description: description?.trim() || null,
          color: color || '#6366f1',
          icon: icon || '📁',
        },
        include: {
          _count: {
            select: { tasks: true },
          },
        },
      })

      return NextResponse.json(project, { status: 201 })
    }

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        color: color || '#6366f1',
        icon: icon || '📁',
      },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
