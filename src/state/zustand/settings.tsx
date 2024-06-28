import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface SettingsState {
  isWalletLockUpEnabled: boolean
  setIsWalletLockUpEnabled: (value: boolean) => void
  isAnonymousAnalyticsEnabled: boolean
  setIsAnonymousAnalyticsEnabled: (value: boolean) => void
  isDelegateTransactionsByDefaultEnabled: boolean
  setIsDelegateTransactionsByDefaultEnabled: (value: boolean) => void
  isBrowserEnabled: boolean
  setIsBrowserEnabled: (value: boolean) => void
}

const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      isWalletLockUpEnabled: true,
      setIsWalletLockUpEnabled: (value: boolean) =>
        set({ isWalletLockUpEnabled: value }),

      isAnonymousAnalyticsEnabled: true,
      setIsAnonymousAnalyticsEnabled: (value: boolean) =>
        set({ isAnonymousAnalyticsEnabled: value }),

      isDelegateTransactionsByDefaultEnabled: false,
      setIsDelegateTransactionsByDefaultEnabled: (value: boolean) =>
        set({ isDelegateTransactionsByDefaultEnabled: value }),

      isBrowserEnabled: true,
      setIsBrowserEnabled: (value: boolean) => set({ isBrowserEnabled: value }),
    }),
    {
      name: 'settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)

export default useSettingsStore
