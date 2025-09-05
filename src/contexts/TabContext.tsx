/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useCallback, useState, type ReactNode } from 'react'
import type { QueryTab } from '../types'
import { v4 as uuid } from 'uuid'

interface TabContextType {
  tabs: QueryTab[]
  activeTabId: string
  addTab: () => void
  closeTab: (tabId: string) => void
  setActiveTabId: (tabId: string) => void
  updateTabQuery: (tabId: string, query: string) => void
}

const TabContext = createContext<TabContextType | undefined>(undefined)

export function useTab() {
  const context = useContext(TabContext)
  if (context === undefined) {
    throw new Error('useTab must be used within a TabProvider')
  }
  return context
}

interface TabProviderProps {
  children: ReactNode
}

export function TabProvider({ children }: TabProviderProps) {
  const initialTab: QueryTab = {
    id: `tab-${uuid()}`,
    name: 'Query 1',
    query: 'SELECT * FROM employees',
    isExecuting: false,
  }

  const [tabs, setTabs] = useState<QueryTab[]>([initialTab])
  const [activeTabId, setActiveTabIdState] = useState<string>(initialTab.id)

  const addTab = useCallback(() => {
    const newTab: QueryTab = {
      id: `tab-${uuid()}`,
      name: `Query ${tabs.length + 1}`,
      query: 'SELECT * FROM employees',
      isExecuting: false,
    }
    setTabs(prev => [...prev, newTab])
    setActiveTabIdState(newTab.id)
  }, [tabs.length])

  const closeTab = useCallback(
    (tabId: string) => {
      if (tabs.length === 1) return

      const newTabs = tabs.filter(t => t.id !== tabId)
      setTabs(newTabs)

      if (activeTabId === tabId) {
        setActiveTabIdState(newTabs[0].id)
      }
    },
    [tabs, activeTabId]
  )

  const setActiveTabId = useCallback((tabId: string) => {
    setActiveTabIdState(tabId)
  }, [])

  const updateTabQuery = useCallback((tabId: string, query: string) => {
    setTabs(prev => prev.map(tab => (tab.id === tabId ? { ...tab, query } : tab)))
  }, [])

  const value: TabContextType = {
    tabs,
    activeTabId,
    addTab,
    closeTab,
    setActiveTabId,
    updateTabQuery,
  }

  return <TabContext.Provider value={value}>{children}</TabContext.Provider>
}
