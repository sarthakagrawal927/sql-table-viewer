import {
  AlertCircle,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Database,
  History,
  Play,
  Table,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { useState } from 'react'
import { sampleConnections, sampleQueries } from '../../data/sampleData'
import type { DBConnection, QueryHistoryItem, SQLQuery } from '../../types'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { CardContent } from '../ui/card'
import { ScrollArea } from '../ui/scroll-area'

interface SidebarProps {
  className?: string
  queryHistory?: QueryHistoryItem[]
  onQuerySelect: (query: SQLQuery) => void
  onHistorySelect?: (item: QueryHistoryItem) => void
}

export function Sidebar({
  className,
  queryHistory = [],
  onQuerySelect,
  onHistorySelect,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'queries' | 'history' | 'connections'>('queries')
  const [expandedConnections, setExpandedConnections] = useState<Set<string>>(new Set())

  return (
    <div className={`w-80 border-r bg-background/50 ${className}`}>
      <div className="p-4 border-b">
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          <Button
            variant={activeTab === 'queries' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1"
            onClick={() => setActiveTab('queries')}
          >
            <BookOpen className="h-4 w-4 mr-1" />
          </Button>
          <Button
            variant={activeTab === 'history' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1"
            onClick={() => setActiveTab('history')}
          >
            <History className="h-4 w-4 mr-1" />
            History
          </Button>
          <Button
            variant={activeTab === 'connections' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1"
            onClick={() => setActiveTab('connections')}
          >
            <Database className="h-4 w-4 mr-1" />
            Connections
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 h-[calc(100vh-8rem)]">
        <div className="p-4 space-y-4">
          {activeTab === 'queries' && (
            <CardContent className="space-y-2 p-3 pt-0">
              {sampleQueries.map(query => (
                <QueryItem key={query.id} query={query} onSelect={onQuerySelect} />
              ))}
            </CardContent>
          )}

          {activeTab === 'history' && (
            <CardContent className="space-y-2 p-3 pt-0">
              {queryHistory.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No query history yet
                </div>
              ) : (
                queryHistory.map(item => (
                  <div
                    key={item.id}
                    className="p-3 rounded-md border hover:bg-accent cursor-pointer"
                    onClick={() => onHistorySelect?.(item)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground">
                          {item.timestamp.toLocaleString()}
                        </div>
                        <div className="text-sm font-mono mt-1 whitespace-pre-wrap break-words">
                          {item.query}
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="default">success</Badge>
                          <span className="text-xs text-muted-foreground">
                            {item.executionTime.toFixed(0)}ms
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          )}

          {activeTab === 'connections' && (
            <CardContent className="space-y-2 p-3 pt-0">
              {sampleConnections.map(connection => (
                <ConnectionItem
                  key={connection.id}
                  connection={connection}
                  isExpanded={expandedConnections.has(connection.id)}
                  onToggleExpand={() => {
                    const newExpanded = new Set(expandedConnections)
                    if (newExpanded.has(connection.id)) {
                      newExpanded.delete(connection.id)
                    } else {
                      newExpanded.add(connection.id)
                    }
                    setExpandedConnections(newExpanded)
                  }}
                />
              ))}
            </CardContent>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

interface QueryItemProps {
  query: SQLQuery
  onSelect: (query: SQLQuery) => void
}

function QueryItem({ query, onSelect }: QueryItemProps) {
  return (
    <div
      className="group p-3 rounded-md border hover:bg-accent cursor-pointer"
      onClick={() => onSelect(query)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium truncate">{query.name}</h3>
          {query.description && (
            <p className="text-xs text-muted-foreground mt-1">{query.description}</p>
          )}
          <Badge variant="outline" className="text-xs mt-2">
            {query.category}
          </Badge>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="h-3 w-3" />
        </div>
      </div>
    </div>
  )
}

interface ConnectionItemProps {
  connection: DBConnection
  isExpanded: boolean
  onToggleExpand: () => void
}

function ConnectionItem({ connection, isExpanded, onToggleExpand }: ConnectionItemProps) {
  const getStatusIcon = () => {
    switch (connection.status) {
      case 'connected':
        return <Wifi className="h-3 w-3 text-green-500" />
      case 'disconnected':
        return <WifiOff className="h-3 w-3 text-gray-500" />
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />
      default:
        return <WifiOff className="h-3 w-3 text-gray-500" />
    }
  }

  return (
    <div className="rounded-md border">
      <div className="p-3 cursor-pointer hover:bg-accent" onClick={onToggleExpand}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {isExpanded ? (
              <ChevronDown className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{connection.name}</div>
              <div className="text-xs text-muted-foreground truncate">{connection.database}</div>
            </div>
          </div>
          <div className="flex-shrink-0">{getStatusIcon()}</div>
        </div>
      </div>

      {isExpanded && connection.tables && (
        <div className="px-3 pb-3">
          <div className="pl-4 border-l-2 border-muted">
            <div className="space-y-1">
              {connection.tables.map((table, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 py-1 px-2 rounded hover:bg-accent cursor-pointer"
                >
                  <Table className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs truncate">{table}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
