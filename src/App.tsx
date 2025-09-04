import { useState } from 'react'
import { ThemeProvider } from './components/theme-provider'
import { Header } from './components/features/Header'
import { Sidebar } from './components/features/Sidebar'
import { QueryEditor } from './components/features/QueryEditor'
import { QueryTabs } from './components/features/QueryTabs'
import { DataTable } from './components/features/DataTable'

// Simple local state instead of complex store
interface QueryTab {
  id: string
  name: string
  query: string
  result: any
  isExecuting: boolean
}

function App() {
  const [tabs, setTabs] = useState<QueryTab[]>([
    {
      id: 'tab-1',
      name: 'Query 1',
      query: 'SELECT * FROM employees',
      result: null,
      isExecuting: false,
    }
  ])
  const [activeTabId, setActiveTabId] = useState('tab-1')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [queryHistory, setQueryHistory] = useState<any[]>([])

  const activeTab = tabs.find(tab => tab.id === activeTabId)!

  const addTab = () => {
    const id = `tab-${Date.now()}`
    setTabs(prev => {
      const newTab: QueryTab = {
        id,
        name: `Query ${prev.length + 1}`,
        query: 'SELECT * FROM employees',
        result: null,
        isExecuting: false,
      }
      return [...prev, newTab]
    })
    setActiveTabId(id)
  }

  const closeTab = (tabId: string) => {
    setTabs(prevTabs => {
      if (prevTabs.length === 1) return prevTabs
      const newTabs = prevTabs.filter(t => t.id !== tabId)
      setActiveTabId(prevActive => (prevActive === tabId ? newTabs[0].id : prevActive))
      return newTabs
    })
  }

  const updateTab = (tabId: string, updates: Partial<QueryTab>) => {
    setTabs(prevTabs =>
      prevTabs.map(tab => (tab.id === tabId ? { ...tab, ...updates } : tab))
    )
  }

  const handleExecuteQuery = () => {
    if (!activeTab.query.trim() || activeTab.isExecuting) return

    console.log('🚀 Starting data generation...')
    const startTime = performance.now()

    // Generate enormous data by repeating the same rows
    const baseRows = [
      { 
        id: 1, name: 'John Doe', email: 'john.doe@company.com', department: 'Engineering', 
        salary: 95000, hire_date: '2022-03-15', is_active: true, age: 28, city: 'San Francisco',
        country: 'USA', phone: '+1-555-0001', manager: 'Sarah Wilson', level: 'Senior',
        bonus: 15000, stock_options: 5000, remote: true, projects: 12
      },
      { 
        id: 2, name: 'Jane Smith', email: 'jane.smith@company.com', department: 'Marketing', 
        salary: 75000, hire_date: '2021-07-20', is_active: true, age: 32, city: 'New York',
        country: 'USA', phone: '+1-555-0002', manager: 'Mike Johnson', level: 'Mid',
        bonus: 8000, stock_options: 2000, remote: false, projects: 8
      },
      { 
        id: 3, name: 'Bob Johnson', email: 'bob.johnson@company.com', department: 'Engineering', 
        salary: 88000, hire_date: '2023-01-10', is_active: true, age: 26, city: 'Austin',
        country: 'USA', phone: '+1-555-0003', manager: 'Sarah Wilson', level: 'Junior',
        bonus: 5000, stock_options: 1000, remote: true, projects: 6
      },
      { 
        id: 4, name: 'Alice Brown', email: 'alice.brown@company.com', department: 'Sales', 
        salary: 82000, hire_date: '2022-09-05', is_active: false, age: 30, city: 'Chicago',
        country: 'USA', phone: '+1-555-0004', manager: 'Tom Davis', level: 'Mid',
        bonus: 12000, stock_options: 3000, remote: false, projects: 15
      }
    ]

    // Generate 50,000 rows (50K) by repeating the base rows - enough to show virtualization
    console.log('📊 Generating 50,000 rows...')
    const enormousRows: any[] = new Array(50000) // Pre-allocate array for better performance
    let rowIndex = 0
    
    for (let i = 0; i < 12500; i++) { // 12.5K iterations × 4 rows = 50K rows
      for (let j = 0; j < baseRows.length; j++) {
        const row = baseRows[j]
        enormousRows[rowIndex] = {
          ...row,
          id: rowIndex + 1,
          name: `${row.name} ${Math.floor(i / 1000) + 1}`,
          email: `${row.name.toLowerCase().replace(' ', '.')}.${i + 1}@company.com`
        }
        rowIndex++
      }

      // Log progress every 5K iterations
      if (i % 5000 === 0) {
        console.log(`📈 Progress: ${((i / 12500) * 100).toFixed(1)}% (${rowIndex.toLocaleString()} rows)`)
      }
    }

    const generationTime = performance.now() - startTime
    console.log(`✅ Generated ${enormousRows.length.toLocaleString()} rows in ${generationTime.toFixed(0)}ms`)
    console.log(`💾 Estimated memory usage: ~${((enormousRows.length * 300) / 1024 / 1024).toFixed(1)}MB`)

    const result = {
      id: `result-${Date.now()}`,
      queryId: `query-${Date.now()}`,
      columns: [
        { id: 'id', name: 'id', type: 'number' as const },
        { id: 'name', name: 'name', type: 'string' as const },
        { id: 'email', name: 'email', type: 'string' as const },
        { id: 'department', name: 'department', type: 'string' as const },
        { id: 'salary', name: 'salary', type: 'number' as const },
        { id: 'hire_date', name: 'hire_date', type: 'date' as const },
        { id: 'is_active', name: 'is_active', type: 'boolean' as const },
        { id: 'age', name: 'age', type: 'number' as const },
        { id: 'city', name: 'city', type: 'string' as const },
        { id: 'country', name: 'country', type: 'string' as const },
        { id: 'phone', name: 'phone', type: 'string' as const },
        { id: 'manager', name: 'manager', type: 'string' as const },
        { id: 'level', name: 'level', type: 'string' as const },
        { id: 'bonus', name: 'bonus', type: 'number' as const },
        { id: 'stock_options', name: 'stock_options', type: 'number' as const },
        { id: 'remote', name: 'remote', type: 'boolean' as const },
        { id: 'projects', name: 'projects', type: 'number' as const }
      ],
      rows: enormousRows,
      executionTime: generationTime,
      rowCount: enormousRows.length,
      timestamp: new Date()
    }

    console.log('🎯 Table data ready for virtualization')
    
    // Add to query history
    const historyItem = {
      id: `history-${Date.now()}`,
      query: activeTab.query,
      result,
      executionTime: generationTime,
      timestamp: new Date(),
      status: 'success' as const,
    }
    setQueryHistory(prev => [historyItem, ...prev].slice(0, 50)) // Keep last 50 items

    updateTab(activeTab.id, { result })
  }

  return (
    <ThemeProvider defaultTheme="dark">
      <div className="h-screen flex flex-col">
        <Header 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <div className="flex flex-1 overflow-hidden">
          {sidebarOpen && (
            <Sidebar 
              className="flex-shrink-0"
              queryHistory={queryHistory}
              onQuerySelect={(query) => {
                updateTab(activeTab.id, { query: query.sql })
              }}
              onHistorySelect={(item) => {
                updateTab(activeTab.id, { query: item.query })
              }}
            />
          )}

          <div className="flex-1 flex flex-col overflow-hidden">
            <QueryTabs 
              tabs={tabs}
              activeTabId={activeTabId}
              onAddTab={addTab}
              onCloseTab={closeTab}
              onSetActiveTab={setActiveTabId}
            />
            
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 overflow-hidden">
              <div className="flex flex-col space-y-4">
                <QueryEditor 
                  query={activeTab.query}
                  isExecuting={activeTab.isExecuting}
                  onQueryChange={(query) => updateTab(activeTab.id, { query })}
                  onExecuteQuery={handleExecuteQuery}
                />
              </div>

              <div className="lg:col-span-2 flex flex-col">
                <DataTable 
                  result={activeTab.result} 
                  isLoading={activeTab.isExecuting} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App