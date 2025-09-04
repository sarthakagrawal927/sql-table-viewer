import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SQLQuery, QueryResult, QueryHistoryItem, AppTheme } from '../types'
import { sampleQueries } from '../data/sampleData'

interface QueryTab {
  id: string
  name: string
  query: string
  result: QueryResult | null
  isExecuting: boolean
}

interface AppState {
  // Theme
  theme: AppTheme
  setTheme: (theme: AppTheme) => void

  // Tabs
  tabs: QueryTab[]
  activeTabId: string
  addTab: () => void
  closeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  updateTab: (tabId: string, updates: Partial<QueryTab>) => void

  // Saved Queries
  savedQueries: SQLQuery[]
  saveQuery: (query: Omit<SQLQuery, 'id'>) => void
  deleteQuery: (id: string) => void
  toggleQueryFavorite: (id: string) => void

  // Query History
  queryHistory: QueryHistoryItem[]
  addToHistory: (item: Omit<QueryHistoryItem, 'id'>) => void
  clearHistory: () => void

  // UI State
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void

  // Selected query from samples
  selectedSampleQuery: SQLQuery | null
  setSelectedSampleQuery: (query: SQLQuery | null) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: { mode: 'dark' },
      setTheme: theme => set({ theme }),

      // Tabs
      tabs: [
        {
          id: 'tab-1',
          name: 'Query 1',
          query: sampleQueries[0]?.sql || 'SELECT * FROM employees',
          result: null,
          isExecuting: false,
        }
      ],
      activeTabId: 'tab-1',
      
      addTab: () => {
        const tabCount = get().tabs.length + 1
        const newTab: QueryTab = {
          id: `tab-${Date.now()}`,
          name: `Query ${tabCount}`,
          query: 'SELECT * FROM employees',
          result: null,
          isExecuting: false,
        }
        set(state => ({
          tabs: [...state.tabs, newTab],
          activeTabId: newTab.id,
        }))
      },

      closeTab: (tabId: string) => {
        set(state => {
          const filteredTabs = state.tabs.filter(t => t.id !== tabId)
          if (filteredTabs.length === 0) return state // Keep at least one tab
          
          const newActiveId = state.activeTabId === tabId 
            ? filteredTabs[0].id 
            : state.activeTabId
          
          return {
            tabs: filteredTabs,
            activeTabId: newActiveId,
          }
        })
      },

      setActiveTab: (tabId: string) => set({ activeTabId: tabId }),

      updateTab: (tabId: string, updates: Partial<QueryTab>) => {
        set(state => ({
          tabs: state.tabs.map(tab => 
            tab.id === tabId ? { ...tab, ...updates } : tab
          ),
        }))
      },

      // Saved Queries
      savedQueries: sampleQueries,
      saveQuery: query => {
        const newQuery: SQLQuery = {
          ...query,
          id: `query-${Date.now()}`,
          lastExecuted: new Date(),
        }
        set(state => ({
          savedQueries: [...state.savedQueries, newQuery],
        }))
      },
      deleteQuery: id => {
        set(state => ({
          savedQueries: state.savedQueries.filter(q => q.id !== id),
        }))
      },
      toggleQueryFavorite: id => {
        set(state => ({
          savedQueries: state.savedQueries.map(q =>
            q.id === id ? { ...q, isFavorite: !q.isFavorite } : q
          ),
        }))
      },

      // Query History
      queryHistory: [],
      addToHistory: item => {
        const historyItem: QueryHistoryItem = {
          ...item,
          id: `history-${Date.now()}`,
        }
        set(state => ({
          queryHistory: [historyItem, ...state.queryHistory].slice(0, 50),
        }))
      },
      clearHistory: () => set({ queryHistory: [] }),

      // UI State
      sidebarOpen: true,
      setSidebarOpen: open => set({ sidebarOpen: open }),

      selectedSampleQuery: null,
      setSelectedSampleQuery: query => set({ selectedSampleQuery: query }),
    }),
    {
      name: 'sql-query-viewer-storage',
      partialize: state => ({
        theme: state.theme,
        tabs: state.tabs,
        activeTabId: state.activeTabId,
        savedQueries: state.savedQueries,
        queryHistory: state.queryHistory,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
)
