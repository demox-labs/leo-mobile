import React, { useCallback, useEffect, useState } from 'react'
import HomeScreen from '@src/screens/home'
import Clipboard from '@react-native-clipboard/clipboard'
import { Token } from '@src/types/tokens'
import { useFocusEffect, usePathname, useRouter } from 'expo-router'
import { useAccount, useChainId } from '@src/lib/aleo/ready'
import { getEstimatedSyncPercentage } from '@src/lib/aleo/activity/sync/sync-plan'
import { useBalance } from '@src/lib/aleo/assets/balance'
import { useActivities } from '@src/hooks/useActivities'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Linking, StatusBar } from 'react-native'
import { StorageKeys, getData } from '@src/utils/storage'
import { useAleoClient } from '@src/lib/aleo'

export const ACTIVITY_SUMMARY_SIZE = 3

const HOME_TOOLTIP_SHOWN_KEY = 'HomeTooltipShown'

const HomeRoute = () => {
  const router = useRouter()
  const pathname = usePathname()
  const account = useAccount()
  const chainId = useChainId()
  const { chainStatus } = useAleoClient()
  const [syncPercentage, setSyncPercentage] = useState<number>()
  const [tokens, setTokens] = useState<Token[]>([])
  const [isTooltipVisible, setIsTooltipVisible] = useState(false)
  const [copyAddressClicked, setCopyAddressClicked] = useState(false)

  let { data: balance } = useBalance(
    account,
    chainId,
    'aleo',
    { displayed: true, suspense: false, initial: BigInt(0) },
    true,
    true,
    false,
  )
  balance = balance ?? BigInt(0)

  // TODO: Add useAssetMetadata hook as defined in extension
  const activities = useActivities()
  const maxIndex = Math.min(ACTIVITY_SUMMARY_SIZE, activities.length)
  const activitySummary = activities.slice(0, maxIndex)

  const walletName = account?.name
  const accountAddress = account?.publicKey
  const isBalanceSyncBannerVisible =
    syncPercentage !== undefined && syncPercentage >= 0 && syncPercentage < 98

  const onWalletNamePress = useCallback(() => {
    router.push({
      pathname: '/accounts/',
    })
  }, [])

  const onCopyWalletToClipboardPress = () => {
    Clipboard.setString(accountAddress || '')
    setCopyAddressClicked(true)
  }

  const onSendPress = () =>
    router.push({
      pathname: '/send-tokens/',
      // params: { aleoAddress: accountAddress },
    })

  const onReceivePress = () =>
    router.push({
      pathname: '/receive/',
      params: { aleoAddress: accountAddress },
    })

  const onBuyTokensPress = () =>
    router.push({
      pathname: '/buy-tokens/',
    })

  const onFaucetPress = () =>
    router.push({
      pathname: '/faucet',
      params: { aleoAddress: accountAddress },
    })

  const onStakePress = () => {
    const hasAleoBalance = tokens.find(
      token => token.symbol === 'ALEO',
    )?.balance

    if (!hasAleoBalance) return router.push('/stake/empty-balance')

    router.push('/stake/token-details')
  }

  const onScanPress = () => router.push('/qr-code-scanner/')

  const handleTooltipClose = async () => {
    await AsyncStorage.setItem(HOME_TOOLTIP_SHOWN_KEY, 'true')
    setIsTooltipVisible(false)
  }

  const onLearnMorePress = () => {
    // Could close the tooltip here if needed:
    // handleTooltipClose()
    // Do any other actions needed here
    Linking.openURL('https://link.leo.app/scanning')
  }

  const onCheckStatusPress = () => {
    Linking.openURL('https://status.leo.app/')
  }

  useEffect(() => {
    const aleoToken: Token = {
      id: '1',
      name: 'Aleo',
      symbol: 'ALEO',
      balance: balance ?? BigInt(0),
    }
    setTokens([aleoToken])
  }, [balance])

  useFocusEffect(
    useCallback(() => {
      // Reset copy icon on focus
      setCopyAddressClicked(false)
      StatusBar.setBarStyle(
        isBalanceSyncBannerVisible && pathname === '/home'
          ? 'light-content'
          : 'dark-content',
      )
    }, [isBalanceSyncBannerVisible, pathname]),
  )

  useEffect(() => {
    if (!account?.publicKey) return

    const updateSyncPercentage = async (): Promise<number> => {
      const syncFraction = await getEstimatedSyncPercentage(
        'testnetbeta',
        account.publicKey,
        0,
      )
      setSyncPercentage(syncFraction * 100)
      return syncFraction
    }
    // Call once on mount and then set interval to update every 10 seconds
    updateSyncPercentage()
    const intervalId = setInterval(async () => {
      try {
        const syncFraction = await updateSyncPercentage()

        // If sync is complete, clear the interval
        if (syncFraction >= 1) {
          clearInterval(intervalId)
        }
      } catch (error) {
        console.error('Failed to get sync percentage:', error)
        clearInterval(intervalId)
      }
    }, 1000)

    // Clear the interval when the component unmounts or the effect re-runs
    return () => clearInterval(intervalId)
  }, [account?.publicKey])

  useEffect(() => {
    const checkTooltipShown = async () => {
      const tooltipShown = (await getData(
        StorageKeys.HOME_TOOLTIP_SHOWN_KEY,
      )) as boolean
      if (!tooltipShown) {
        setTimeout(() => {
          setIsTooltipVisible(true)
        }, 150)
      }
    }

    checkTooltipShown()
  }, [])

  // Uncomment the useEffect below to manually change the sync progress
  // every 2 seconds so that the balance sync banner toggles on and off
  // to see how the status bar adapts to the banner.
  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     setSyncPercentage(isBalanceSyncBannerVisible ? 100 : 0)
  //   }, 2000)
  //   return () => clearInterval(intervalId)
  // }, [syncPercentage])

  return (
    <HomeScreen
      walletInfo={{
        walletName,
        balance,
        accountAddress,
        copyAddressClicked,
        chainStatus,
        onWalletNamePress,
        onCopyWalletToClipboardPress,
        onSendPress,
        onReceivePress,
        onBuyTokensPress,
        onFaucetPress,
        onStakePress,
        onScanPress,
      }}
      syncProgress={syncPercentage}
      tokens={tokens}
      activities={activitySummary}
      isBalanceSyncBannerVisible={isBalanceSyncBannerVisible}
      isTooltipVisible={isBalanceSyncBannerVisible && isTooltipVisible}
      closeTooltip={handleTooltipClose}
      onLearnMorePress={onLearnMorePress}
      onCheckStatusPress={onCheckStatusPress}
    />
  )
}

export default HomeRoute
