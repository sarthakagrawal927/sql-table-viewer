import type { QueryResult } from '../types'

// Hardcoded simple data - no imports that might cause issues
const simpleData = [
  { id: 1, name: 'John', department: 'Engineering' },
  { id: 2, name: 'Jane', department: 'Marketing' },
  { id: 3, name: 'Bob', department: 'Engineering' }
]

const simpleColumns = [
  { id: 'id', name: 'id', type: 'number' as const },
  { id: 'name', name: 'name', type: 'string' as const },
  { id: 'department', name: 'department', type: 'string' as const }
]

export function executeQuery(_sql: string): QueryResult {
  // Return hardcoded result - no processing at all
  return {
    id: 'result-1',
    queryId: 'query-1',
    columns: simpleColumns,
    rows: simpleData,
    executionTime: 1,
    rowCount: simpleData.length,
    timestamp: new Date()
  }
}