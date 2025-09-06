import Editor from '@monaco-editor/react'
import { BarChart3, Code, Play, Sparkles } from 'lucide-react'
import type { editor } from 'monaco-editor'
import { useEffect, useRef } from 'react'
import { useTheme } from '../theme-provider'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

interface QueryEditorProps {
  query: string
  onQueryChange: (query: string) => void
  isExecuting: boolean
  onExecuteQuery: (query: string) => void
  height?: string
}

export function QueryEditor({
  query,
  onQueryChange,
  isExecuting,
  onExecuteQuery,
  height = '200px',
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
              <Play className={`h-4 w-4 mr-1 ${isExecuting ? 'animate-spin' : ''}`} />
              {isExecuting ? 'Executing...' : 'Execute'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <div
          className="flex-1 border-t"
          style={{ height: height === '200px' ? '200px' : 'calc(100% - 60px)' }}
        >
          <Editor
            height="100%"
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
