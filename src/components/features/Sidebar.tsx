import { useState } from 'react'
import { ScrollArea } from '../ui/scroll-area'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { BookOpen, History, Star, Play, Database } from 'lucide-react'
import { sampleQueries } from '../../data/sampleData'
import type { SQLQuery, QueryHistoryItem } from '../../types'

interface SidebarProps {
  className?: string
  queryHistory?: QueryHistoryItem[]
  onQuerySelect: (query: SQLQuery) => void
  onHistorySelect?: (item: QueryHistoryItem) => void
}

export function Sidebar({ className, queryHistory = [], onQuerySelect, onHistorySelect }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'queries' | 'history'>('queries')

  const handleQuerySelect = (query: SQLQuery) => {
    onQuerySelect(query)
  }

  const favoriteQueries = sampleQueries.filter(q => q.isFavorite)
  const regularQueries = sampleQueries.filter(q => !q.isFavorite)

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
            Queries
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
        </div>
      </div>

      <ScrollArea className="flex-1 h-[calc(100vh-8rem)]">
        <div className="p-4 space-y-4">
          {activeTab === 'queries' && (
            <>
              {favoriteQueries.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-500" />
                      Favorites
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 p-3 pt-0">
                    {favoriteQueries.map(query => (
                      <QueryItem
                        key={query.id}
                        query={query}
                        onSelect={handleQuerySelect}
                      />
                    ))}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Database className="h-4 w-4 mr-1" />
                    Sample Queries
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 p-3 pt-0">
                  {regularQueries.map(query => (
                    <QueryItem
                      key={query.id}
                      query={query}
                      onSelect={handleQuerySelect}
                    />
                  ))}
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === 'history' && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center">
                    <History className="h-4 w-4 mr-1" />
                    Recent Executions
                  </CardTitle>
                </div>
              </CardHeader>
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
                          <div className="text-sm font-mono mt-1 truncate">
                            {item.query.substring(0, 50)}...
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
            </Card>
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
    <div className="group p-3 rounded-md border hover:bg-accent cursor-pointer">
      <div onClick={() => onSelect(query)}>
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
        </div>
      </div>

      <div className="flex items-center justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={e => {
            e.stopPropagation()
            onSelect(query)
          }}
        >
          <Play className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
