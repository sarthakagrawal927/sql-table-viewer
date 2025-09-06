import type { QueryResult, DataSet } from '../types'
import { sampleDataSets } from '../data/sampleData'

export async function executeQuery(sql: string): Promise<QueryResult> {
  const startTime = performance.now()

  await new Promise(resolve => setTimeout(resolve, 800))

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

  const result = processStandardQuery(dataSet, sql)

  const endTime = performance.now()
  result.executionTime = endTime - startTime

  return result
}

function processStandardQuery(dataSet: DataSet, query: string): QueryResult {
  const columns = dataSet.columns.map(col => ({
    key: col.id,
    label: col.name,
    type: col.type as 'string' | 'number' | 'boolean' | 'date',
  }))

  let rows = [...dataSet.rows]

  // Generate more rows if needed for large limits
  const limitMatch = query.match(/\blimit\s+(\d+)/i)
  const requestedLimit = Math.min(limitMatch ? parseInt(limitMatch[1], 10) : 100, 500000)

  // If we need more rows than available, generate them
  if (requestedLimit > rows.length && rows.length > 0) {
    const baseRow = rows[0]
    const additionalRows = []

    for (let i = rows.length; i < requestedLimit; i++) {
      const newRow = { ...baseRow }
      // Update ID field if it exists
      if ('id' in newRow) {
        newRow.id = i + 1
      }
      additionalRows.push(newRow)
    }

    rows = [...rows, ...additionalRows]
  }

  // Apply LIMIT clause
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
