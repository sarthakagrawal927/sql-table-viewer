import { useState, useCallback, useMemo } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { ThemeProvider } from './components/theme-provider'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Header } from './components/features/Header'
import { Sidebar } from './components/features/Sidebar'
import { QueryEditor } from './components/features/QueryEditor'
import { QueryTabs } from './components/features/QueryTabs'
import { DataTable } from './components/features/DataTable'
import { QueryProvider, useQuery } from './contexts/QueryContext'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'

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

  useKeyboardShortcuts({
    onExecuteQuery: () => {
      if (activeTab?.query.trim()) {
        executeQueryForTab(activeTabId!, activeTab.query)
      }
    },
  })

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
                console.log('App onQuerySelect called:', query, 'activeTabId:', activeTabId)
                if (activeTabId) {
                  updateTabQuery(activeTabId, query.sql)
                }
              }}
              onHistorySelect={item => {
                console.log('App onHistorySelect called:', item, 'activeTabId:', activeTabId)
                if (activeTabId) {
                  updateTabQuery(activeTabId, item.query)
                }
              }}
            />
          )}

          <div className="flex-1 flex flex-col overflow-hidden p-4">
            <PanelGroup direction="horizontal" className="flex-1">
              <Panel defaultSize={35} minSize={25} maxSize={50}>
                <div className="flex flex-col space-y-4 h-full pr-2">
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
                    onQueryChange={query => {
                      if (activeTabId) {
                        updateTabQuery(activeTabId, query)
                      }
                    }}
                    isExecuting={isExecuting}
                    onExecuteQuery={executeQuery}
                  />
                </div>
              </Panel>

              <PanelResizeHandle className="w-2 bg-border hover:bg-accent transition-colors cursor-col-resize flex items-center justify-center">
                <div className="w-1 h-8 bg-border rounded-full"></div>
              </PanelResizeHandle>

              <Panel defaultSize={65} minSize={50}>
                <div className="flex flex-col h-full pl-2">
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
              </Panel>
            </PanelGroup>
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
