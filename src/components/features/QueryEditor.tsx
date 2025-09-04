import { useRef } from 'react'
import Editor from '@monaco-editor/react'
import { Play } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { useTheme } from '../theme-provider'

interface QueryEditorProps {
  query: string
  isExecuting: boolean
  onQueryChange: (query: string) => void
  onExecuteQuery: () => void
}

export function QueryEditor({ query, isExecuting, onQueryChange, onExecuteQuery }: QueryEditorProps) {
  const { theme } = useTheme()
  const editorRef = useRef<any>(null)

  function handleEditorDidMount(editor: any) {
    editorRef.current = editor
  }

  const handleQueryChange = (value: string | undefined) => {
    onQueryChange(value || '')
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-lg">Query Editor</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              onClick={onExecuteQuery}
              disabled={isExecuting || !query.trim()}
            >
              <Play className="h-4 w-4 mr-1" />
              {isExecuting ? 'Executing...' : 'Execute'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <div className="h-[200px] border-t">
          <Editor
            height="200px"
            defaultLanguage="sql"
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            value={query}
            onChange={handleQueryChange}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              wordWrap: 'on',
              automaticLayout: true,
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
