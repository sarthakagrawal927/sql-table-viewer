import { useState, useCallback, useMemo } from 'react'
import { ThemeProvider } from './components/theme-provider'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Header } from './components/features/Header'
import { Sidebar } from './components/features/Sidebar'
import { QueryEditor } from './components/features/QueryEditor'
import { QueryTabs } from './components/features/QueryTabs'
import { DataTable } from './components/features/DataTable'
import { QueryProvider, useQuery } from './contexts/QueryContext'

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true)
  const {
    tabs,
    activeTabId,
    selectedResultTabId,
    queryResults,
    queryHistory,
    isExecuting,
    addTab,
    closeTab,
    setActiveTabId,
    setSelectedResultTabId,
    executeQueryForTab,
    updateTabQuery,
  } = useQuery()

  const activeTab = tabs.find(tab => tab.id === activeTabId)


  const executeQuery = useCallback(
    (query: string) => {
      const activeId = activeTabId
      if (!activeId) return
      updateTabQuery(activeId, query)
      executeQueryForTab(activeId, query)
    },
    [activeTabId, updateTabQuery, executeQueryForTab]
  )

  // Memoize the current result to prevent unnecessary re-renders
  const currentResult = useMemo(() => {
    return queryResults[selectedResultTabId] || null
  }, [queryResults, selectedResultTabId])

  return (
    <ThemeProvider defaultTheme="dark">
      <div className="h-screen flex flex-col">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="flex flex-1 overflow-hidden">
          {sidebarOpen && (
            <Sidebar
              className="flex-shrink-0"
              queryHistory={queryHistory}
              onQuerySelect={query => {
                if (activeTabId) {
                  updateTabQuery(activeTabId, query.sql)
                }
              }}
              onHistorySelect={item => {
                if (activeTabId) {
                  updateTabQuery(activeTabId, item.query)
                }
              }}
            />
          )}

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 overflow-hidden">
              <div className="flex flex-col space-y-4">
                <QueryTabs
                  tabs={tabs}
                  activeTabId={activeTabId}
                  onAddTab={addTab}
                  onCloseTab={closeTab}
                  onSetActiveTab={setActiveTabId}
                />
                <QueryEditor
                  key={activeTab?.id}
                  query={activeTab?.query ?? 'SELECT * FROM employees'}
                  onQueryChange={(query) => {
                    if (activeTabId) {
                      updateTabQuery(activeTabId, query)
                    }
                  }}
                  isExecuting={isExecuting}
                  onExecuteQuery={executeQuery}
                />
              </div>

              <div className="lg:col-span-2 flex flex-col">
                <div className="mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">View Results From:</span>
                    <select
                      value={selectedResultTabId}
                      onChange={e => setSelectedResultTabId(e.target.value)}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
                    >
                      {tabs.map(tab => (
                        <option key={tab.id} value={tab.id}>
                          {tab.name} {queryResults[tab.id] ? '✓' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <DataTable
                  key={selectedResultTabId}
                  result={currentResult}
                  isLoading={isExecuting}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AppContent />
      </QueryProvider>
    </ErrorBoundary>
  )
}

export default App
