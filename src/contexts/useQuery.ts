import { useCallback, useRef } from 'react'
import type { QueryEditorRef } from '../components/features/QueryEditor'
import { useTab } from './TabContext'
import { useQueryResult } from './QueryResultContext'

export function useQuery() {
  const tabContext = useTab()
  const queryResultContext = useQueryResult()
  const queryEditorRef = useRef<QueryEditorRef>(null)

  const setQueryInEditor = useCallback(
    (query: string) => {
      // Keep the editor and tab state in sync
      const activeId = tabContext.activeTabId
      if (!activeId) return
      tabContext.updateTabQuery(activeId, query)
      queryEditorRef.current?.setQuery(query)
    },
    [tabContext.activeTabId, tabContext.updateTabQuery]
  )

  const executeQuery = useCallback(
    (query: string) => {
      // Persist query text to tab before executing
      const activeId = tabContext.activeTabId
      if (!activeId) return
      tabContext.updateTabQuery(activeId, query)
      queryResultContext.executeQueryForTab(activeId, query)
    },
    [tabContext.activeTabId, tabContext.updateTabQuery, queryResultContext.executeQueryForTab]
  )

  return {
    // Tab state
    tabs: tabContext.tabs,
    activeTabId: tabContext.activeTabId,
    selectedResultTabId: queryResultContext.selectedResultTabId,

    // Query state
    queryResults: queryResultContext.queryResults,
    queryHistory: queryResultContext.queryHistory,
    isExecuting: queryResultContext.isExecuting,
    queryEditorRef,

    // Tab actions
    addTab: tabContext.addTab,
    closeTab: (tabId: string) => {
      tabContext.closeTab(tabId)
      queryResultContext.clearResults(tabId)
      // Ensure selected result tab remains valid
      if (queryResultContext.selectedResultTabId === tabId && tabContext.tabs.length > 0) {
        queryResultContext.setSelectedResultTabId(tabContext.tabs[0].id)
      }
      queryResultContext.clearOldResults()
    },
    setActiveTabId: tabContext.setActiveTabId,
    setSelectedResultTabId: queryResultContext.setSelectedResultTabId,

    // Query actions
    executeQuery,
    setQueryInEditor,

    // Memory management
    clearAllResults: queryResultContext.clearAllResults,
  }
}
