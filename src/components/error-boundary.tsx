import { logger } from '@src/utils/logger'
import React, { Component, ErrorInfo, ReactNode } from 'react'
import { View, Text, SafeAreaView } from 'react-native'

// Define an interface for the component's props
interface ErrorBoundaryProps {
  children: ReactNode // This type is for any valid React child
}

// Define an interface for the component's state
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<ErrorBoundaryProps> {
  state: ErrorBoundaryState = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error(error.toString(), errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <SafeAreaView className="flex-1 items-center justify-center px-4 bg-white">
          <View>
            <Text className="text-2xl font-bold mb-1 text-center">
              Oops! Something went wrong.
            </Text>
            <Text className="text-base mb-5 text-center">
              Please restart the app and try again.
            </Text>
          </View>
        </SafeAreaView>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
