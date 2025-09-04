export interface SQLQuery {
  id: string
  name: string
  sql: string
  description?: string
  category: string
  executionTime?: number
  lastExecuted?: Date
  isFavorite?: boolean
}

export interface QueryResult {
  id: string
  queryId: string
  columns: Column[]
  rows: Row[]
  executionTime: number
  rowCount: number
  timestamp: Date
}

export interface Column {
  id: string
  name: string
  type: 'string' | 'number' | 'boolean' | 'date' | 'null'
  nullable?: boolean
}

export type Row = Record<string, any>

export interface QueryHistoryItem {
  id: string
  query: string
  result?: QueryResult
  executionTime: number
  timestamp: Date
  status: 'success' | 'error' | 'running'
  error?: string
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx'
  includeHeaders: boolean
  selectedColumns?: string[]
  maxRows?: number
}

export interface AppTheme {
  mode: 'light' | 'dark' | 'system'
}

export interface DataSet {
  id: string
  name: string
  description: string
  columns: Column[]
  rows: Row[]
  category: string
  sampleQueries: string[]
}
