import { redirect } from 'next/navigation'
import { getUserFromRequest } from '@/lib/auth-server'
import { cookies } from 'next/headers'

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

  // Show dashboard with welcome message
  return (
    <div className="container mx-auto px-8 py-12 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-medium tracking-tight mb-2">
          Welcome, {user.username}!
        </h1>
        <p className="text-muted-foreground">
          Your AI-native project management workspace
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a
          href="/kanban"
          className="p-6 border bg-card hover:bg-muted/50 transition-colors"
        >
          <h2 className="text-lg font-medium mb-2">Kanban Board</h2>
          <p className="text-sm text-muted-foreground">
            Manage your tasks with drag and drop
          </p>
        </a>

        <a
          href="/projects"
          className="p-6 border bg-card hover:bg-muted/50 transition-colors"
        >
          <h2 className="text-lg font-medium mb-2">Projects</h2>
          <p className="text-sm text-muted-foreground">
            Organize tasks by project
          </p>
        </a>

        <a
          href="/analytics"
          className="p-6 border bg-card hover:bg-muted/50 transition-colors"
        >
          <h2 className="text-lg font-medium mb-2">Analytics</h2>
          <p className="text-sm text-muted-foreground">
            View your productivity insights
          </p>
        </a>
      </div>
    </div>
  )
}
