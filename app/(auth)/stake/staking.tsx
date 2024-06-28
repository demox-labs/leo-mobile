import React from 'react'

import StakingScreen from '@src/screens/stake/staking'
import { useLocalSearchParams } from 'expo-router'

const StakingRoute = () => {
  const { tokenName, stakeAmount } = useLocalSearchParams<{
    tokenName?: string
    stakeAmount?: string
  }>()

  return (
    <StakingScreen tokenName={tokenName!} stakeAmount={Number(stakeAmount)!} />
  )
}

export default StakingRoute
