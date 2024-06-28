import React, { useEffect, useRef } from 'react'
import { FlatList } from 'react-native'
import Tab from '@src/components/browser/tabs/tab'
import { TabType } from '@src/types/browser'

interface BrowserTabsScreenInterface {
  activeTabId?: string
  tabs: TabType[]
  onTabPress: (tabId: string) => void
  onTabClosePress: (tabId: string) => void
  onCreateNewTabPress: () => void
}

const BrowserTabsScreen: React.FC<BrowserTabsScreenInterface> = ({
  activeTabId,
  tabs,
  onTabPress,
  onTabClosePress,
  onCreateNewTabPress,
}) => {
  const flatListRef = useRef<FlatList>(null)
  const tabsWithPlaceholder = [{ id: 'new-tab' } as TabType, ...tabs]

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: false })
    }
  }, [])

  const renderTab = ({ item }: { item: TabType }) => (
    <Tab
      key={item.id}
      isActive={activeTabId === item.id}
      defaultSiteName={item.name}
      isNewTab={item.id === 'new-tab'}
      isLastTab={
        item.id === tabsWithPlaceholder[tabsWithPlaceholder.length - 1].id
      }
      url={item.url}
      onTabPress={() =>
        item.id === 'new-tab' ? onCreateNewTabPress() : onTabPress(item.id)
      }
      onTabClose={() => onTabClosePress(item.id)}
    />
  )

  return (
    <FlatList
      ref={flatListRef}
      data={tabsWithPlaceholder}
      renderItem={renderTab}
      keyExtractor={item => `tab-id-${item.id}`}
      className="flex-1 bg-white w-full p-[16px]"
      contentContainerStyle={{
        gap: 16,
      }}
    />
  )
}

export default BrowserTabsScreen
