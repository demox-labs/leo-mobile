import React, { useCallback } from 'react'

import { useFocusEffect, useRouter } from 'expo-router'
import TokenDetailsScreen from '@src/screens/stake/token-details'
import { accountAddress } from '@src/api/mockedData'
import { ACTIVITY_SUMMARY_SIZE } from 'app/(auth)/(tabs)/home'
import { TokenInfoData } from '@src/types/home'
import { useActivities } from '@src/hooks/useActivities'
import { useAccount, useChainId } from '@src/lib/aleo/ready'
import { useBalance } from '@src/lib/aleo/assets/balance'
import { StatusBar } from 'react-native'

const TokenDetailsRoute = () => {
  const router = useRouter()
  const account = useAccount()
  const chainId = useChainId()
  const activities = useActivities()
  const maxIndex = Math.min(ACTIVITY_SUMMARY_SIZE, activities.length)
  const activitySummary = activities.slice(0, maxIndex)

  // TODO Fetch data in useEffect so correct balance is displayed on load
  const { data: fetchPublicBalance } = useBalance(
    account,
    chainId,
    'aleo',
    { displayed: true, suspense: false, initial: BigInt(0) },
    true,
    false,
    false,
  )
  const publicBalance = fetchPublicBalance ? fetchPublicBalance : BigInt(0)
  const { data: fetchedPrivateBalance } = useBalance(
    account,
    chainId,
    'aleo',
    { displayed: true, suspense: false, initial: BigInt(0) },
    false,
    true,
    false,
  )
  const privateBalance = fetchedPrivateBalance
    ? fetchedPrivateBalance
    : BigInt(0)

  const onSendPress = () => {
    // Navigate to Send screen
    router.push('/send-tokens/')
  }

  const onReceivePress = () => {
    router.push({
      pathname: '/receive/',
      params: { aleoAddress: accountAddress },
    })
  }

  const onConvertPress = () => {
    // TODO: Navigate to Convert screen
    router.push('/convert-token/')
  }

  const onStakePress = (hasStaked: boolean) => {
    if (hasStaked) return router.push('/stake/active-stake')

    router.push('/stake/')
  }

  const tokenInfo: TokenInfoData = {
    name: 'ALEO',
    balance: {
      total: privateBalance + publicBalance,
      private: privateBalance,
      public: publicBalance,
    },
  }

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content')
    }, []),
  )

  return (
    <TokenDetailsScreen
      tokenInfo={tokenInfo}
      handlers={{ onSendPress, onReceivePress, onConvertPress, onStakePress }}
      activities={activitySummary}
    />
  )
}

export default TokenDetailsRoute
