/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { QueryResult, QueryHistoryItem } from '../types'
import { executeQuery } from '../lib/queryExecutor'

interface QueryResultContextType {
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

const QueryResultContext = createContext<QueryResultContextType | undefined>(undefined)

export function useQueryResult() {
  const context = useContext(QueryResultContext)
  if (context === undefined) {
    throw new Error('useQueryResult must be used within a QueryResultProvider')
  }
  return context
}

interface QueryResultProviderProps {
  children: ReactNode
  defaultSelectedTabId: string
}

export function QueryResultProvider({ children, defaultSelectedTabId }: QueryResultProviderProps) {
  const [queryResults, setQueryResults] = useState<Record<string, QueryResult | null>>({})
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([])
  const [selectedResultTabId, setSelectedResultTabIdState] = useState<string>(defaultSelectedTabId)
  const [isExecuting, setIsExecuting] = useState<boolean>(false)

  const executeQueryForTab = useCallback(
    async (tabId: string, query: string) => {
      if (!query.trim() || isExecuting) return

      setIsExecuting(true)

      try {
        const options = {
          generateLargeDataset: query.toLowerCase().includes('from employees'),
          maxRows: 10000,
        }

        const result = await executeQuery(query, options)

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
    [isExecuting]
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
          setSelectedResultTabIdState(remaining[0] ?? defaultSelectedTabId)
        }

        return newResults
      })
    },
    [selectedResultTabId, defaultSelectedTabId]
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

  const value: QueryResultContextType = {
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

  return <QueryResultContext.Provider value={value}>{children}</QueryResultContext.Provider>
}
