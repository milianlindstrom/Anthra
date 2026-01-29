'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from './ui/button'
import { Sidebar } from './sidebar'

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile sidebar */}
      <div className="md:hidden fixed inset-y-0 left-0 z-50 w-64">
        <Sidebar
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          className="w-full"
        />
      </div>
    </>
  )
}
