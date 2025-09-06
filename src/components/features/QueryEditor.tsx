import { useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { Play, Code, Sparkles, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { useTheme } from '../theme-provider'

interface QueryEditorProps {
  query: string
  onQueryChange: (query: string) => void
  isExecuting: boolean
  onExecuteQuery: (query: string) => void
}

export function QueryEditor({
  query,
  onQueryChange,
  isExecuting,
  onExecuteQuery,
}: QueryEditorProps) {
  const { theme } = useTheme()
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  useEffect(() => {
    if (editorRef.current && editorRef.current.getValue() !== query) {
      editorRef.current.setValue(query)
    }
  }, [query])

  function handleEditorDidMount(editorInstance: editor.IStandaloneCodeEditor) {
    editorRef.current = editorInstance
  }

  function handleEditorChange(value: string | undefined) {
    onQueryChange(value || '')
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
            <Button size="sm" variant="outline" disabled className="cursor-default opacity-50">
              <Code className="h-4 w-4 mr-1" />
              Format
            </Button>
            <Button size="sm" variant="outline" disabled className="cursor-default opacity-50">
              <Sparkles className="h-4 w-4 mr-1" />
              AI
            </Button>
            <Button size="sm" variant="outline" disabled className="cursor-default opacity-50">
              <BarChart3 className="h-4 w-4 mr-1" />
              Analyze
            </Button>
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
