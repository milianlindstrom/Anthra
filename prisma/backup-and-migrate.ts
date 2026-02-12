/**
 * Complete migration script using raw SQL
 * Backs up old data, pushes new schema, restores with projects
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'fs'
import { join } from 'path'
import Database from 'better-sqlite3'

const execAsync = promisify(exec)

const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#06b6d4', '#f97316', '#14b8a6',
]

const PROJECT_ICONS = [
  '📁', '🚀', '💼', '🎯', '⚡', '🔥', '💡', '🌟',
  '🎨', '🔧', '📊', '🎮', '🏗️', '📱', '🌐', '🔬'
]

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let id = 'c'
  for (let i = 0; i < 24; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

async function migrate() {
  console.log('🚀 Starting migration to Projects schema...\n')

  const dbPath = join(__dirname, 'dev.db')
  const backupPath = join(__dirname, 'dev.db.backup')

  try {
    // Step 1: Check if database exists
    if (!existsSync(dbPath)) {
      console.log('ℹ️  No existing database found. Will create fresh schema.')
      await execAsync('cd /home/milian/Documents/Anthra && npx prisma db push --skip-generate')
      console.log('✅ New schema created!')
      return
    }

    // Step 2: Backup database file
    console.log('📦 Creating database backup...')
    copyFileSync(dbPath, backupPath)
    console.log(`   ✓ Backup saved to: ${backupPath}`)

    // Step 3: Read existing tasks using raw SQL
    console.log('\n📊 Reading existing tasks...')
    const db = new Database(dbPath, { readonly: true })
    
    let tasks: any[] = []
    try {
      tasks = db.prepare('SELECT * FROM Task').all()
      console.log(`   ✓ Found ${tasks.length} tasks`)
    } catch (error) {
      console.log('   ℹ️  No tasks table found or empty')
    }
    
    db.close()

    // Step 4: Save tasks to JSON
    if (tasks.length > 0) {
      const backupJsonPath = join(__dirname, 'tasks-backup.json')
      writeFileSync(backupJsonPath, JSON.stringify(tasks, null, 2))
      console.log(`   ✓ Tasks backed up to: ${backupJsonPath}`)
    }

    // Step 5: Push new schema
    console.log('\n🔄 Applying new schema...')
    await execAsync('cd /home/milian/Documents/Anthra && npx prisma db push --force-reset --skip-generate')
    console.log('   ✓ New schema applied!')

    // Step 6: Restore data with projects
    if (tasks.length === 0) {
      console.log('\n✅ Migration complete! (No data to restore)')
      return
    }

    console.log('\n🏗️  Creating projects and restoring tasks...')

    // Open new database
    const newDb = new Database(dbPath)

    // Extract unique project names
    const projectNames = new Set<string>()
    tasks.forEach((task: any) => {
      if (task.project && typeof task.project === 'string') {
        projectNames.add(task.project)
      }
    })

    // Create projects
    const projectMap = new Map<string, string>()
    let colorIndex = 0
    let iconIndex = 0

    for (const name of Array.from(projectNames)) {
      const id = generateId()
      const slug = generateSlug(name)
      const color = PROJECT_COLORS[colorIndex % PROJECT_COLORS.length]
      const icon = PROJECT_ICONS[iconIndex % PROJECT_ICONS.length]
      const now = new Date().toISOString()

      newDb.prepare(`
        INSERT INTO Project (id, name, slug, description, color, icon, archived, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
      `).run(id, name, slug, 'Migrated from existing tasks', color, icon, now, now)

      projectMap.set(name, id)
      console.log(`   ✓ ${icon} ${name}`)

      colorIndex++
      iconIndex++
    }

    // Create "Unassigned" project
    const unassignedId = generateId()
    const now = new Date().toISOString()
    newDb.prepare(`
      INSERT INTO Project (id, name, slug, description, color, icon, archived, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
    `).run(unassignedId, 'Unassigned', 'unassigned', 'Tasks without a project', '#6b7280', '📋', now, now)
    console.log(`   ✓ 📋 Unassigned`)

    // Restore tasks
    console.log(`\n🔄 Restoring ${tasks.length} tasks...`)
    
    let restored = 0
    const insertTask = newDb.prepare(`
      INSERT INTO Task (
        id, title, description, status, priority, project_id, 
        start_date, due_date, estimated_hours, archived, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    for (const oldTask of tasks) {
      const projectId = oldTask.project 
        ? (projectMap.get(oldTask.project) || unassignedId)
        : unassignedId

      // Calculate start_date if due_date exists
      let startDate = null
      if (oldTask.due_date && oldTask.estimated_hours) {
        const dueDate = new Date(oldTask.due_date)
        const daysBack = Math.ceil(oldTask.estimated_hours / 8) || 1
        const startDateObj = new Date(dueDate.getTime() - (daysBack * 24 * 60 * 60 * 1000))
        startDate = startDateObj.toISOString()
      }

      insertTask.run(
        oldTask.id,
        oldTask.title,
        oldTask.description,
        oldTask.status,
        oldTask.priority,
        projectId,
        startDate,
        oldTask.due_date,
        oldTask.estimated_hours,
        oldTask.archived ? 1 : 0,
        oldTask.created_at,
        oldTask.updated_at
      )

      restored++
      if (restored % 10 === 0 || restored === tasks.length) {
        process.stdout.write(`\r   Progress: ${restored}/${tasks.length}`)
      }
    }

    newDb.close()
    console.log('\n')

    console.log('✅ Migration complete!')
    console.log(`\n📊 Summary:`)
    console.log(`   Projects: ${projectNames.size + 1}`)
    console.log(`   Tasks: ${restored}`)
    console.log(`\n💾 Backup saved at: ${backupPath}`)

  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    console.log(`\n⚠️  You can restore from backup: ${backupPath}`)
    throw error
  }
}

migrate()
