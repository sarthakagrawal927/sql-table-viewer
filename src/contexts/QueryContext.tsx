import { type ReactNode } from 'react'
import { TabProvider, useTab } from './TabContext'
import { QueryResultProvider } from './QueryResultContext'

interface QueryProviderProps {
  children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <TabProvider>
      <QueryProviderInner>{children}</QueryProviderInner>
    </TabProvider>
  )
}

function QueryProviderInner({ children }: { children: ReactNode }) {
  const { tabs } = useTab()
  const defaultTabId = tabs[0]?.id || ''

  return <QueryResultProvider defaultSelectedTabId={defaultTabId}>{children}</QueryResultProvider>
}

// Intentionally do not export hooks from this file to satisfy
// react-refresh rule of exporting only components.
