import { createContext, useContext, useCallback, useState, useRef, type ReactNode } from 'react'
import type { QueryResult } from '../types'
import type { QueryEditorRef } from '../components/features/QueryEditor'
import { sampleDataSets } from '../data/sampleData'
import { v4 as uuid } from 'uuid'

// Simple local state instead of complex store
interface QueryTab {
  id: string
  name: string
  query: string
  isExecuting: boolean
}

interface QueryHistoryItem {
  id: number
  query: string
  timestamp: string
  executionTime: number
  rowCount: number
}

interface QueryContextType {
  // Tab state
  tabs: QueryTab[]
  activeTabId: string
  selectedResultTabId: string

  // Query state
  queryResults: Record<string, QueryResult | null>
  queryHistory: QueryHistoryItem[]
  isExecuting: boolean
  queryEditorRef: React.RefObject<QueryEditorRef>

  // Tab actions
  addTab: () => void
  closeTab: (tabId: string) => void
  setActiveTabId: (tabId: string) => void
  setSelectedResultTabId: (tabId: string) => void

  // Query actions
  executeQuery: (query: string) => void
  setQueryInEditor: (query: string) => void
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
  const [tabs, setTabs] = useState<QueryTab[]>([
    {
      id: `tab-${uuid()}`,
      name: 'Query 1',
      query: 'SELECT * FROM employees',
      isExecuting: false,
    },
  ])
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0].id)
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([])
  const [queryResults, setQueryResults] = useState<Record<string, QueryResult | null>>({})
  const [selectedResultTabId, setSelectedResultTabId] = useState<string>(tabs[0].id)
  const [isExecuting, setIsExecuting] = useState<boolean>(false)
  const queryEditorRef = useRef<QueryEditorRef>(null)

  const addTab = useCallback(() => {
    const newTab: QueryTab = {
      id: `tab-${uuid()}`,
      name: `Query ${tabs.length + 1}`,
      query: 'SELECT * FROM employees',
      isExecuting: false,
    }
    setTabs(prev => [...prev, newTab])
    setActiveTabId(newTab.id)
  }, [tabs])

  const closeTab = useCallback(
    (tabId: string) => {
      if (tabs.length === 1) return
      const newTabs = tabs.filter(t => t.id !== tabId)
      setTabs(newTabs)
      // Clean up the result for this tab
      setQueryResults(prev => {
        const newResults = { ...prev }
        delete newResults[tabId]
        return newResults
      })
      if (activeTabId === tabId) {
        setActiveTabId(newTabs[0].id)
      }
    },
    [tabs, activeTabId]
  )

  const executeQuery = useCallback(
    (query: string) => {
      if (!query.trim() || isExecuting) return

      const startTime = performance.now()
      const executingTabId = activeTabId // Capture the current active tab

      // Set executing state
      setIsExecuting(true)

      // Parse table name from SQL query
      const parseTableName = (sql: string): string | null => {
        const normalizedSql = sql.toLowerCase().trim()
        const fromMatch = normalizedSql.match(/from\s+(\w+)/i)
        return fromMatch ? fromMatch[1] : null
      }

      const tableName = parseTableName(query)
      const dataSet = tableName ? sampleDataSets.find(ds => ds.id === tableName) : null

      let result: QueryResult

      if (dataSet) {
        const endTime = performance.now()
        const executionTime = endTime - startTime

        if (tableName === 'employees') {
          // Generate 50k employee results
          const baseRow = {
            id: 1,
            name: 'John Doe',
            email: 'john.doe@company.com',
            department: 'Engineering',
            salary: 95000,
            hire_date: '2022-03-15',
            is_active: true,
          }

          const rows = Array.from({ length: 50000 }, (_, i) => ({
            ...baseRow,
            id: i + 1,
            name: `${baseRow.name} ${i + 1}`,
            email: `john.doe.${i + 1}@company.com`,
          }))

          result = {
            columns: [
              { key: 'id', label: 'ID', type: 'number' },
              { key: 'name', label: 'Name', type: 'string' },
              { key: 'email', label: 'Email', type: 'string' },
              { key: 'department', label: 'Department', type: 'string' },
              { key: 'salary', label: 'Salary', type: 'number' },
              { key: 'hire_date', label: 'Hire Date', type: 'date' },
              { key: 'is_active', label: 'Active', type: 'boolean' },
            ],
            rows,
            executionTime,
            rowCount: rows.length,
          }
        } else {
          // For other tables, return only first 10 rows
          const columns = dataSet.columns.map(col => ({
            key: col.id,
            label: col.name,
            type: col.type as 'string' | 'number' | 'boolean' | 'date',
          }))

          const rows = dataSet.rows.slice(0, 10)

          result = {
            columns,
            rows,
            executionTime,
            rowCount: rows.length,
          }
        }
      } else {
        // Fallback to empty result if table not found
        const endTime = performance.now()
        const executionTime = endTime - startTime

        result = {
          columns: [{ key: 'error', label: 'Error', type: 'string' }],
          rows: [{ error: `Table '${tableName || 'unknown'}' not found` }],
          executionTime,
          rowCount: 1,
        }
      }

      // Add to history
      setQueryHistory(prev => [
        {
          id: Date.now(),
          query: query,
          timestamp: new Date().toISOString(),
          executionTime: result.executionTime,
          rowCount: result.rowCount,
        },
        ...prev.slice(0, 99), // Keep last 100 queries
      ])

      // Store result separately and update execution state
      setQueryResults(prev => ({ ...prev, [executingTabId]: result }))
      // Auto-set the results dropdown to show results from the executing tab
      setSelectedResultTabId(executingTabId)
      setIsExecuting(false)
    },
    [isExecuting, activeTabId]
  )

  const setQueryInEditor = useCallback((query: string) => {
    queryEditorRef.current?.setQuery(query)
  }, [])

  const value: QueryContextType = {
    // Tab state
    tabs,
    activeTabId,
    selectedResultTabId,

    // Query state
    queryResults,
    queryHistory,
    isExecuting,
    queryEditorRef,

    // Tab actions
    addTab,
    closeTab,
    setActiveTabId,
    setSelectedResultTabId,

    // Query actions
    executeQuery,
    setQueryInEditor,
  }

  return <QueryContext.Provider value={value}>{children}</QueryContext.Provider>
}
