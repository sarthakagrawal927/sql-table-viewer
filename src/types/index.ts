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
}

export interface Column {
  key: string
  label: string
  type: 'string' | 'number' | 'boolean' | 'date' | 'null'
  nullable?: boolean
}

export type Row = Record<string, string | number | boolean | null>

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
  sampleQueries: string[]
}
