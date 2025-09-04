import { Plus, X } from 'lucide-react'
import { Button } from '../ui/button'

interface QueryTabsProps {
  tabs: Array<{ id: string; name: string }>
  activeTabId: string
  onAddTab: () => void
  onCloseTab: (tabId: string) => void
  onSetActiveTab: (tabId: string) => void
}

export function QueryTabs({ tabs, activeTabId, onAddTab, onCloseTab, onSetActiveTab }: QueryTabsProps) {
  return (
    <div className="flex items-center space-x-1 border-b bg-background/50 px-4 py-2">
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={`group flex items-center space-x-2 px-3 py-1 rounded-t-md cursor-pointer transition-colors ${
            activeTabId === tab.id
              ? 'bg-background border border-b-0 shadow-sm'
              : 'bg-muted/50 hover:bg-muted'
          }`}
          onClick={() => onSetActiveTab(tab.id)}
        >
          <span className="text-sm font-medium">{tab.name}</span>
          {tabs.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
              onClick={e => {
                e.stopPropagation()
                onCloseTab(tab.id)
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      ))}
      
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={onAddTab}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}