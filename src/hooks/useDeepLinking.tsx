import React, { createContext, useContext, useEffect, useState } from 'react'
import * as Linking from 'expo-linking'

export const publicRoutes = [
  'auth/auth-splash',
  'auth/login',
  'back-up-wallet',
  'create-password',
  'db-example',
  'forgot-password',
  'get-started',
  'import-wallet',
  'index',
  'network-logger',
  'qr-code-scanner',
  'screens-list',
  'sdk-example',
  'signup',
  'storybook',
  'verify-seed-phrase',
  'webview',
  'welcome',
]

interface DeepLinkingContextProps {
  url: string | null
  initialUrl: string | null
  deepLink: string | null
  setInitialUrl: (url: string | null) => void
}

const DeepLinkingContext = createContext<DeepLinkingContextProps | undefined>(
  undefined,
)

export const DeepLinkingProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const url = Linking.useURL()
  const [initialUrl, setInitialUrl] = useState<string | null>(null)
  const [deepLink, setDeepLink] = useState<string | null>(null)

  useEffect(() => {
    Linking.getInitialURL().then(setDeepLink)
  }, [])

  useEffect(() => setDeepLink(url), [url])

  return (
    <DeepLinkingContext.Provider
      value={{ url, initialUrl, setInitialUrl, deepLink }}
    >
      {children}
    </DeepLinkingContext.Provider>
  )
}

export const useDeepLinking = () => {
  const context = useContext(DeepLinkingContext)
  if (context === undefined) {
    throw new Error('useDeepLinking must be used within a DeepLinkingProvider')
  }
  return context
}
