import { useRef, useState, useImperativeHandle, forwardRef } from 'react'
import Editor from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { Play } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { useTheme } from '../theme-provider'

interface QueryEditorProps {
  initialQuery?: string
  isExecuting: boolean
  onExecuteQuery: (query: string) => void
}

export interface QueryEditorRef {
  setQuery: (query: string) => void
  getQuery: () => string
}

export const QueryEditor = forwardRef<QueryEditorRef, QueryEditorProps>(
  ({ initialQuery = 'SELECT * FROM employees', isExecuting, onExecuteQuery }, ref) => {
    const { theme } = useTheme()
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
    const [query, setQuery] = useState(initialQuery)

    useImperativeHandle(ref, () => ({
      setQuery: (newQuery: string) => setQuery(newQuery),
      getQuery: () => query,
    }))

    function handleEditorDidMount(editorInstance: editor.IStandaloneCodeEditor) {
      editorRef.current = editorInstance
    }

    function handleEditorChange(value: string | undefined) {
      setQuery(value || '')
    }

    function handleExecute() {
      onExecuteQuery(query)
    }

    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-lg">Query Editor</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" onClick={handleExecute} disabled={isExecuting || !query.trim()}>
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
              onChange={handleEditorChange}
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
)
