import Icon from '@src/components/icons'
import AnimatedLoading from '@src/components/icons/animated/loading'
import LeoButton from '@src/components/leo-button'
import * as Storage from '@src/utils/storage'

import { router } from 'expo-router'

import React, { useEffect, useState } from 'react'
import { Text, View } from 'react-native'

interface StakingScreenProps {
  tokenName: string
  stakeAmount: number
}

const StakingScreen: React.FC<StakingScreenProps> = ({
  tokenName,
  stakeAmount,
}) => {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)

      // temporary - will be replaced for a real API call or state manager
      Storage.setData('stakedAmount', stakeAmount)
    }, 3000)
  }, [])

  return (
    <View className="flex-1 px-3 pt-10 bg-white">
      {isLoading ? (
        <>
          <View className="flex h-1/2 justify-end items-center mt-10">
            <AnimatedLoading isLoading={isLoading} />
          </View>
          <View className="mt-10 p-3 items-center justify-center">
            <Text className="font-bold text-2xl">
              Staking {stakeAmount} {tokenName}
            </Text>
            <Text className="text-lg mt-3">
              Transaction will proceed in the background
            </Text>
          </View>
        </>
      ) : null}

      {!isLoading ? (
        <>
          <View className="flex h-1/2 justify-end items-center mt-10">
            <View className="bg-gray-25 p-10 rounded-full h-1/2 w-1/2 items-center justify-center">
              <Icon name="checkbox-circle" size={80} className="absolute" />
            </View>
          </View>
          <View className="mt-10 p-1 items-center justify-center">
            <Text className="font-bold text-2xl">Staked Successfully</Text>
            <Text className="text-lg mt-3 text-center">
              Your staking request has been confirmed. It might take a minute to
              see changes in your wallet.
            </Text>
          </View>
          <View className="flex-1 justify-end mb-5">
            <LeoButton
              label="Done"
              type="secondary"
              onPress={() => router.back()}
            />
          </View>
        </>
      ) : null}
    </View>
  )
}

export default StakingScreen
