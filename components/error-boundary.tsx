"use client"

import React, { ReactNode } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] Error caught:", error, errorInfo)
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset)
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-blue-50">
          <Card className="max-w-md w-full border-red-200 bg-white">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-red-600">حدث خطأ</CardTitle>
              </div>
              <CardDescription>
                حدث خطأ غير متوقع. يرجى محاولة تحديث الصفحة.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <details className="text-sm">
                <summary className="cursor-pointer font-medium text-slate-600 hover:text-slate-900">
                  تفاصيل الخطأ
                </summary>
                <pre className="mt-2 p-3 bg-slate-100 rounded text-xs overflow-auto max-h-32 text-red-600">
                  {this.state.error.message}
                </pre>
              </details>
              <Button onClick={this.reset} className="w-full gap-2" size="sm">
                <RefreshCw className="h-4 w-4" />
                حاول مرة أخرى
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Functional error fallback component for use with error.tsx files
 */
export function ErrorFallback({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <Card className="max-w-md w-full border-red-200 bg-white">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-600">حدث خطأ</CardTitle>
          </div>
          <CardDescription>
            حدث خطأ غير متوقع. يرجى محاولة تحديث الصفحة.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <details className="text-sm">
            <summary className="cursor-pointer font-medium text-slate-600 hover:text-slate-900">
              تفاصيل الخطأ
            </summary>
            <pre className="mt-2 p-3 bg-slate-100 rounded text-xs overflow-auto max-h-32 text-red-600">
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          </details>
          <Button onClick={() => reset()} className="w-full gap-2" size="sm">
            <RefreshCw className="h-4 w-4" />
            حاول مرة أخرى
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
