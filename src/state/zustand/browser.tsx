import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { TabType } from '@src/types/browser'

export interface BrowserState {
  tabs: TabType[]
  activeTabId?: string
  deleteActiveTabId: () => void
  tabsCount: number
  recents: string[]
  addTab: ({ tab, isActive }: { tab: TabType; isActive?: boolean }) => void
  addTabUrl: (url: string) => void
  deleteTab: (tabId: string) => void
  deleteAllTabs: () => void
  updateActiveTabData: (data: Partial<TabType>) => void
  setActiveTab: (tabId?: string) => void
  setRecents: (recents: string[]) => void
}

const useBrowserStore = create<BrowserState>()(
  persist(
    (set, get) => ({
      tabs: [],
      tabsCount: 0,
      activeTabId: undefined,
      deleteActiveTabId: () => set({ activeTabId: undefined }),
      recents: [],
      addTabUrl: (url: string) => {
        const origin = new URL(url).origin
        const tabExists = get().tabs.some(
          tab => new URL(tab.url).origin === origin,
        )

        if (tabExists) {
          return
        }

        return set(state => {
          const newTabs = [
            ...state.tabs,
            {
              id: origin,
              name: new URL(url).hostname,
              url,
            },
          ]
          return {
            tabs: newTabs,
            activeTabId: state.activeTabId,
            tabsCount: newTabs.length,
          }
        })
      },
      addTab: ({ tab, isActive }) =>
        set(state => {
          const newTabs = [...state.tabs, tab]
          return {
            tabs: newTabs,
            activeTabId: isActive ? tab.id : state.activeTabId,
            tabsCount: newTabs.length,
          }
        }),
      deleteTab: tabId =>
        set(state => ({
          tabs: state.tabs.filter(tab => tab.id !== tabId),
          activeTabId:
            state.activeTabId === tabId ? undefined : state.activeTabId,
          tabsCount: state.tabsCount - 1,
        })),
      deleteAllTabs: () =>
        set({ tabs: [], activeTabId: undefined, tabsCount: 0 }),
      updateActiveTabData: data =>
        set(state => {
          if (!state.activeTabId) return state
          const activeTab = state.tabs.find(tab => tab.id === state.activeTabId)
          if (!activeTab) return state
          const updatedTab = { ...activeTab, ...data }
          return {
            tabs: state.tabs.map(tab =>
              tab.id === state.activeTabId ? updatedTab : tab,
            ),
          }
        }),
      setActiveTab: activeTabId => set({ activeTabId }),
      setRecents: recents => set({ recents: Array.from(new Set(recents)) }),
    }),
    {
      name: 'browser',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)

export default useBrowserStore
