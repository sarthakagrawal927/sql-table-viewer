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
  columns: Column[]
  rows: Row[]
  executionTime: number
  rowCount: number
  error?: string
}

interface Column {
  key: string
  label: string
  type: 'string' | 'number' | 'boolean' | 'date' | 'null'
  nullable?: boolean
}

export type Row = Record<string, string | number | boolean | null>

export interface QueryHistoryItem {
  id: number
  query: string
  timestamp: Date
  executionTime: number
  rowCount: number
}

export interface DataSet {
  id: string
  name: string
  description: string
  category: string
  columns: Array<{
    id: string
    name: string
    type: 'string' | 'number' | 'boolean' | 'date'
  }>
  rows: Row[]
  sampleQueries?: string[]
}

export interface QueryTab {
  id: string
  name: string
  query: string
  isExecuting: boolean
}

export interface DBConnection {
  id: string
  name: string
  type: 'postgresql' | 'mysql' | 'sqlite' | 'mongodb' | 'redis' | 'oracle'
  host: string
  port: number
  database: string
  username: string
  status: 'connected' | 'disconnected' | 'error'
  lastConnected?: Date
  description?: string
  tables?: string[]
}
