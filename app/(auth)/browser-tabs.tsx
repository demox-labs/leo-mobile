import React, { useEffect, useLayoutEffect } from 'react'
import useBrowserStore from '@src/state/zustand/browser'
import { router, useNavigation } from 'expo-router'
import { TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import TabsControlsModal from '@src/components/browser/tabs/tabs-controls-modal'
import { ActionSheetRef } from 'react-native-actions-sheet'
import BrowserTabsScreen from '@src/screens/browser/browser-tabs'
import { BackButton } from '@src/components/navigation/back-button'

const BrowserTabsRoute = () => {
  const navigation = useNavigation()
  const {
    activeTabId,
    setActiveTab,
    tabs,
    deleteTab,
    deleteAllTabs,
    tabsCount,
  } = useBrowserStore()

  const controlsModalRef: React.RefObject<ActionSheetRef> =
    React.useRef<ActionSheetRef>(null)

  const onTabPress = (tabId: string) => {
    setActiveTab(tabId)
    const url = tabs.find(tab => tab.id === tabId)?.url
    if (url === undefined) {
      router.replace('/browser/')
    } else {
      router.navigate({
        pathname: '/browser/browser-webview',
        params: {
          url: url,
        },
      })
    }
  }

  const onTabClosePress = (tabId: string) => {
    deleteTab(tabId)
    if (activeTabId === tabId) {
      setActiveTab(undefined)
    }
  }

  const onCreateNewTabPress = () => {
    setActiveTab(undefined)
    router.replace({
      pathname: '/browser/',
      params: {
        showRecentsOnMount: 'true',
      },
    })
  }

  const onOpenTabsMenuPress = () => {
    controlsModalRef.current?.show()
  }

  const onCloseAllTabsPress = () => {
    deleteAllTabs()
    controlsModalRef.current?.hide()
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={onOpenTabsMenuPress}>
          <Ionicons name="ellipsis-horizontal" size={24} color="black" />
        </TouchableOpacity>
      ),
    })
  }, [])

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <BackButton
          onPress={
            tabsCount > 0 ? router.back : () => router.replace('/browser/')
          }
        />
      ),
    })
  }, [tabsCount])

  return (
    <>
      <BrowserTabsScreen
        activeTabId={activeTabId}
        tabs={tabs}
        onTabPress={onTabPress}
        onCreateNewTabPress={onCreateNewTabPress}
        onTabClosePress={onTabClosePress}
      />
      <TabsControlsModal
        ref={controlsModalRef}
        onCloseAllTabsPress={onCloseAllTabsPress}
      />
    </>
  )
}

export default BrowserTabsRoute
