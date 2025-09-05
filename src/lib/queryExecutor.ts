import type { QueryResult, DataSet } from '../types'
import { sampleDataSets } from '../data/sampleData'

interface QueryExecutionOptions {
  generateLargeDataset?: boolean
  maxRows?: number
}

export async function executeQuery(
  sql: string,
  options: QueryExecutionOptions = {}
): Promise<QueryResult> {
  const startTime = performance.now()

  const fromMatch = sql.match(/\bfrom\s+(\w+)/i)
  const tableName = fromMatch?.[1]?.toLowerCase()

  if (!tableName) {
    const endTime = performance.now()
    return {
      columns: [{ key: 'error', label: 'Error', type: 'string' }],
      rows: [{ error: 'No table found in query' }],
      executionTime: endTime - startTime,
      rowCount: 0,
      error: 'No table found in query',
    }
  }

  const dataSet = sampleDataSets.find(ds => ds.id === tableName)

  if (!dataSet) {
    const endTime = performance.now()
    return {
      columns: [{ key: 'error', label: 'Error', type: 'string' }],
      rows: [{ error: `Table '${tableName}' not found` }],
      executionTime: endTime - startTime,
      rowCount: 0,
      error: `Table '${tableName}' not found`,
    }
  }

  let result: QueryResult

  if (options.generateLargeDataset && tableName === 'employees') {
    result = generateLargeEmployeeDataset(dataSet, options.maxRows || 10000)
  } else {
    result = processStandardQuery(dataSet, sql, options.maxRows)
  }

  const endTime = performance.now()
  result.executionTime = endTime - startTime

  return result
}

function generateLargeEmployeeDataset(dataSet: DataSet, maxRows: number): QueryResult {
  const baseEmployee = dataSet.rows[0]
  const departments = [
    'Engineering',
    'Marketing',
    'Sales',
    'HR',
    'Finance',
    'Research & Development',
  ]

  const rows = Array.from({ length: maxRows }, (_, i) => ({
    ...baseEmployee,
    id: i + 1,
    name: `Employee ${i + 1}`,
    email: `employee.${i + 1}@company.com`,
    department: departments[i % departments.length],
    salary: 50000 + Math.floor(Math.random() * 100000),
    hireDate: new Date(
      2020 + Math.floor(Math.random() * 4),
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    )
      .toISOString()
      .split('T')[0],
    isActive: Math.random() > 0.1,
  }))

  return {
    columns: dataSet.columns.map(col => ({
      key: col.id,
      label: col.name,
      type: col.type as 'string' | 'number' | 'boolean' | 'date',
    })),
    rows,
    executionTime: 0,
    rowCount: rows.length,
  }
}

function processStandardQuery(dataSet: DataSet, query: string, maxRows?: number): QueryResult {
  const columns = dataSet.columns.map(col => ({
    key: col.id,
    label: col.name,
    type: col.type as 'string' | 'number' | 'boolean' | 'date',
  }))

  let rows = [...dataSet.rows]

  if (maxRows) {
    rows = rows.slice(0, maxRows)
  }

  const limitMatch = query.match(/\blimit\s+(\d+)/i)
  if (limitMatch) {
    const limit = parseInt(limitMatch[1], 10)
    rows = rows.slice(0, limit)
  }

  return {
    columns,
    rows,
    executionTime: 0,
    rowCount: rows.length,
  }
}
