/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { useLocalStorage } from 'usehooks-ts'
import type { QueryResult, QueryHistoryItem, QueryTab } from '../types'
import { executeQuery } from '../lib/queryExecutor'
import { v4 as uuid } from 'uuid'

interface QueryContextType {
  // Tab management
  tabs: QueryTab[]
  activeTabId: string
  addTab: () => void
  closeTab: (tabId: string) => void
  setActiveTabId: (tabId: string) => void
  updateTabQuery: (tabId: string, query: string) => void

  // Query results
  queryResults: Record<string, QueryResult | null>
  queryHistory: QueryHistoryItem[]
  selectedResultTabId: string
  isExecuting: boolean
  executeQueryForTab: (tabId: string, query: string) => Promise<void>
  setSelectedResultTabId: (tabId: string) => void
  clearResults: (tabId: string) => void
  clearAllResults: () => void
  clearOldResults: () => void
}

const QueryContext = createContext<QueryContextType | undefined>(undefined)

export function useQuery() {
  const context = useContext(QueryContext)
  if (context === undefined) {
    throw new Error('useQuery must be used within a QueryProvider')
  }
  return context
}

interface QueryProviderProps {
  children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Initialize with first tab
  const initialTab: QueryTab = {
    id: `tab-${uuid()}`,
    name: 'Query 1',
    query: 'SELECT * FROM employees',
    isExecuting: false,
  }

  const [tabs, setTabs] = useState<QueryTab[]>([initialTab])
  const [activeTabId, setActiveTabIdState] = useState<string>(initialTab.id)

  const [queryHistory, setQueryHistory] = useLocalStorage<QueryHistoryItem[]>(
    'sql-query-viewer-query-history',
    []
  )

  const [queryResults, setQueryResults] = useState<Record<string, QueryResult | null>>({})
  const [selectedResultTabId, setSelectedResultTabIdState] = useState<string>(initialTab.id)
  const [isExecuting, setIsExecuting] = useState<boolean>(false)

  // Tab management functions
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

      // Also clear results for closed tab
      setQueryResults(prev => {
        const newResults = { ...prev }
        delete newResults[tabId]
        return newResults
      })

      // Update selected result tab if needed
      if (selectedResultTabId === tabId) {
        setSelectedResultTabIdState(newTabs[0]?.id || '')
      }
    },
    [tabs, activeTabId, selectedResultTabId]
  )

  const setActiveTabId = useCallback((tabId: string) => {
    setActiveTabIdState(tabId)
  }, [])

  const updateTabQuery = useCallback((tabId: string, query: string) => {
    setTabs(prev => prev.map(tab => (tab.id === tabId ? { ...tab, query } : tab)))
  }, [])

  // Query execution functions
  const executeQueryForTab = useCallback(
    async (tabId: string, query: string) => {
      if (!query.trim() || isExecuting) return

      setIsExecuting(true)

      try {
        const result = await executeQuery(query)

        setQueryHistory(prev => [
          {
            id: Date.now(),
            query,
            timestamp: new Date(),
            executionTime: result.executionTime,
            rowCount: result.rowCount,
          },
          ...prev.slice(0, 99),
        ])

        setQueryResults(prev => ({ ...prev, [tabId]: result }))
        setSelectedResultTabIdState(tabId)
      } catch (error) {
        const errorResult: QueryResult = {
          columns: [{ key: 'error', label: 'Error', type: 'string' }],
          rows: [{ error: error instanceof Error ? error.message : 'Unknown error occurred' }],
          executionTime: 0,
          rowCount: 0,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        }
        setQueryResults(prev => ({ ...prev, [tabId]: errorResult }))
      } finally {
        setIsExecuting(false)
      }
    },
    [isExecuting, setQueryHistory]
  )

  const setSelectedResultTabId = useCallback((tabId: string) => {
    setSelectedResultTabIdState(tabId)
  }, [])

  const clearResults = useCallback(
    (tabId: string) => {
      setQueryResults(prev => {
        const newResults = { ...prev }
        delete newResults[tabId]

        if (selectedResultTabId === tabId) {
          const remaining = Object.keys(newResults)
          setSelectedResultTabIdState(remaining[0] ?? (tabs[0]?.id || ''))
        }

        return newResults
      })
    },
    [selectedResultTabId, tabs]
  )

  const clearAllResults = useCallback(() => {
    setQueryResults({})
    setQueryHistory([])
  }, [])

  const clearOldResults = useCallback(() => {
    const resultKeys = Object.keys(queryResults)
    if (resultKeys.length > 10) {
      const keysToRemove = resultKeys.slice(10)
      setQueryResults(prev => {
        const newResults = { ...prev }
        keysToRemove.forEach(key => delete newResults[key])
        return newResults
      })
    }

    if (queryHistory.length > 100) {
      setQueryHistory(prev => prev.slice(0, 100))
    }
  }, [queryResults, queryHistory])

  const value: QueryContextType = {
    // Tab management
    tabs,
    activeTabId,
    addTab,
    closeTab,
    setActiveTabId,
    updateTabQuery,

    // Query results
    queryResults,
    queryHistory,
    selectedResultTabId,
    isExecuting,
    executeQueryForTab,
    setSelectedResultTabId,
    clearResults,
    clearAllResults,
    clearOldResults,
  }

  return <QueryContext.Provider value={value}>{children}</QueryContext.Provider>
}
