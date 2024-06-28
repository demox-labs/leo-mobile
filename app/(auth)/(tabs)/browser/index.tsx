import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import BrowserScreen from '@src/screens/browser'
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
  usePathname,
} from 'expo-router'
import useSettingsStore from '@src/state/zustand/settings'
import { appsInfo } from '@src/constants/apps'
import useBrowserStore from '@src/state/zustand/browser'
import { AppInfo } from '@src/types/browser'
import { uniqueId } from 'lodash'
import { StatusBar } from 'react-native'

const BrowserRoute = () => {
  const { showRecentsOnMount, isClosingWebView } = useLocalSearchParams<{
    showRecentsOnMount: 'true' | 'false'
    isClosingWebView: 'true' | 'false'
  }>()
  const router = useRouter()
  const { isBrowserEnabled } = useSettingsStore()
  const {
    tabs,
    recents,
    tabsCount,
    addTabUrl,
    deleteActiveTabId,
    activeTabId,
  } = useBrowserStore()
  const pathname = usePathname()

  const [showRecents, setShowRecents] = useState(showRecentsOnMount === 'true')

  const recentApps = useMemo(() => {
    const _recents = recents.map(value => {
      const url = new URL(value)
      const app = appsInfo.find(app => app.url?.includes(url.origin))
      return (
        app ??
        ({ id: uniqueId(), name: url.hostname, url: url.origin } as AppInfo)
      )
    })

    return _recents.filter(
      (value, index, self) =>
        self.findIndex(t => t.url === value.url) === index,
    )
  }, [recents])

  const onAppPress = (url: string) => {
    addTabUrl(url)

    router.push({
      pathname: '/browser/browser-webview',
      params: {
        url: url,
      },
    })
  }

  const handleSearchSubmit = (searchQuery: string) => {
    let url
    if (!searchQuery.includes('.')) {
      // If the search query doesn't contain a dot, it's probably a search query, not a URL
      // So we search it on Google
      url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`
    } else if (!searchQuery.startsWith('http')) {
      // If the search query doesn't start with http, it's probably a URL without a protocol, so we add https
      url = `https://${searchQuery}`
    } else {
      // Otherwise, it's probably a valid URL
      url = searchQuery
    }

    addTabUrl(url)

    router.push({
      pathname: '/browser/browser-webview',
      params: {
        url: url,
      },
    })
  }

  const onGoToSettings = () => {
    router.push('/general')
  }

  const onOpenTabs = () => {
    if (tabsCount > 0) {
      router.push('/browser-tabs')
      return
    }

    setShowRecents(true)
  }

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content')
    }, []),
  )

  useLayoutEffect(() => {
    const isInBrowser = pathname.includes('/browser')
    const isInWebviewAlready = pathname.includes('webview')
    const isInTabs = pathname.includes('tabs')

    const skipNavigation =
      isClosingWebView === 'true' ||
      !isInBrowser ||
      isInWebviewAlready ||
      isInTabs

    if (skipNavigation) {
      if (isClosingWebView === 'true') {
        deleteActiveTabId()
      }
      return
    }

    // If there is an active tab, navigate to it
    if (tabsCount > 0) {
      const activeTab = tabs.find(tab => tab.id === activeTabId)
      if (activeTab) {
        router.replace({
          pathname: '/browser/browser-webview',
          params: {
            url: activeTab.url,
          },
        })
      }
    }
  }, [pathname])

  return (
    <BrowserScreen
      tabsCount={tabsCount}
      recommendations={appsInfo}
      recents={recentApps}
      isEnabled={isBrowserEnabled}
      showRecents={showRecents}
      setShowRecents={setShowRecents}
      onAppPress={onAppPress}
      handleSearchSubmit={handleSearchSubmit}
      onGoToSettings={onGoToSettings}
      onOpenTabs={onOpenTabs}
    />
  )
}

export default BrowserRoute
