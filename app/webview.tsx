import React, { useCallback, useEffect, useState } from 'react'

import WebViewScreen from '@src/screens/webview'
import {
  useNavigation,
  useLocalSearchParams,
  router,
  useFocusEffect,
} from 'expo-router'
import { useAccount } from '@src/lib/aleo/ready'
import { sanitizeUrl } from '@src/utils/strings'
import useBrowserStore from '@src/state/zustand/browser'
import { useDeepLinking } from '@src/hooks/useDeepLinking'
import * as Linking from 'expo-linking'
import { Alert, StatusBar } from 'react-native'

interface WebviewRouteProps {
  url?: string
  isActivityLink?: string
  applyTopPadding?: boolean
  applyBottomPadding?: boolean
  flow?: 'buy-tokens'
}
const WebviewRoute: React.FC<WebviewRouteProps> = props => {
  const navigaton = useNavigation()
  const {
    url = props.url,
    isActivityLink = props.isActivityLink,
    applyTopPadding = props.applyTopPadding,
    applyBottomPadding = props.applyBottomPadding,
    flow = props.flow,
  } = useLocalSearchParams<{
    url?: string
    isActivityLink?: string
    applyTopPadding?: string
    applyBottomPadding?: string
    flow?: 'buy-tokens'
  }>()
  const { deepLink } = useDeepLinking()
  const account = useAccount()
  const { addTabUrl } = useBrowserStore()

  const [innerUrl, setInnerUrl] = useState<string | undefined>(sanitizeUrl(url))

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content')
      if (deepLink) {
        const { queryParams } = Linking.parse(deepLink)

        const queryUrl = queryParams?.['url'] as string
        if (url && queryUrl?.startsWith(url)) {
          const sanitizeQueryUrl = sanitizeUrl(queryUrl)
          setInnerUrl(sanitizeQueryUrl)
          addTabUrl(sanitizeQueryUrl)
        }
      }
    }, [deepLink]),
  )

  const onUrlUpdate = (searchQuery: string) => {
    let newUrl
    if (!searchQuery.includes('.')) {
      // If the search query doesn't contain a dot, it's probably a search query, not a URL
      // So we search it on Google
      newUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`
    } else if (
      !searchQuery.startsWith('http://') &&
      !searchQuery.startsWith('https://')
    ) {
      // If the search query doesn't start with http, it's probably a URL without a protocol, so we add https
      newUrl = `https://${searchQuery}`
    } else {
      // Otherwise, it's probably a valid URL
      newUrl = searchQuery
    }
    setInnerUrl(newUrl)
  }

  const onClose = () => {
    if (flow === 'buy-tokens') {
      Alert.alert('Do you want to close the purchase process?', '', [
        {
          text: 'Yes',
          onPress: () => {
            router.replace('/home')
          },
        },
        {
          text: 'No',
          style: 'cancel',
        },
      ])
      return
    }
    if (isActivityLink) {
      router.replace('/activities')
      return
    }
    router.replace({
      pathname: '/home',
      params: {
        isClosingWebView: 'true',
      },
    })
  }

  const onOpenTabs = () => {
    router.push('/browser-tabs')
  }

  useEffect(() => {
    if (!url) {
      alert('No URL provided')
      navigaton.goBack()
    }
  }, [url])

  if (!innerUrl) {
    return null
  }

  return (
    <WebViewScreen
      account={account}
      url={innerUrl}
      onUrlUpdate={onUrlUpdate}
      onClose={onClose}
      onOpenTabs={onOpenTabs}
      applyTopPadding={Boolean(applyTopPadding)}
      applyBottomPadding={Boolean(applyBottomPadding)}
      flow={flow}
    />
  )
}

export default WebviewRoute
