import { useEffect } from 'react'

interface KeyboardShortcuts {
  onExecuteQuery?: () => void
}

export function useKeyboardShortcuts({ onExecuteQuery }: KeyboardShortcuts) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+Enter or Cmd+Enter
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault()
        event.stopPropagation()
        onExecuteQuery?.()
      }
    }

    // Add event listener to document to capture all keyboard events
    document.addEventListener('keydown', handleKeyDown, true)

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [onExecuteQuery])
}
