import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    window.location.reload()
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="m-4 border-red-200 dark:border-red-800">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <CardTitle className="text-lg text-red-700 dark:text-red-300">
                Something went wrong
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              An unexpected error occurred. You can try reloading the page or reset the application.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3">
                <p className="text-sm font-mono text-red-800 dark:text-red-200">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <div className="flex space-x-2">
              <Button onClick={this.handleReset} variant="outline" size="sm">
                Try Again
              </Button>
              <Button onClick={this.handleReload} size="sm">
                <RefreshCw className="h-4 w-4 mr-1" />
                Reload Page
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}
