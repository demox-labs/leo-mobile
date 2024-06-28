import LeoButton from '@src/components/leo-button'

import { TokenInfoData } from '@src/types/home'
import * as Storage from '@src/utils/storage'
import { router } from 'expo-router'

import React, { useEffect, useState } from 'react'
import { Text, View } from 'react-native'

interface ActiveStakeScreenProps {
  tokenInfo: TokenInfoData
}

const ActiveStakeScreen: React.FC<ActiveStakeScreenProps> = ({ tokenInfo }) => {
  const [stakeAmount, setStakeAmount] = useState(50)

  const handleUnstake = () => {
    Storage.setData('stakedAmount', 0).then(() => {
      router.back()
    })
  }

  useEffect(() => {
    Storage.getData('stakedAmount').then(setStakeAmount)
  }, [])

  return (
    <View className="flex-1 px-3 pt-5 bg-white">
      <View className="rounded-lg mt-3 p-3">
        <View className="flex-row justify-baseline items-center">
          <View className="w-[40px] h-[40px] bg-blue-500 rounded-full" />
          <Text className="ml-3 text-lg font-semibold">Aleo Validator</Text>
          <Text className="w-1/2 ml-3 text-right color-green-500">Active</Text>
        </View>

        <View className="mb-1 mt-10">
          <View className="flex-row justify-between mb-2">
            <Text className="text-lg text-gray-600">Stake Account</Text>
            <Text className="text-lg">aleo1fgh...5qf9</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-lg text-gray-600">Balance</Text>
            <Text className="text-lg">
              {stakeAmount} {tokenInfo.name}
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-lg text-gray-600">Rewards</Text>
            <Text className="text-lg">+0.01 {tokenInfo.name}</Text>
          </View>
        </View>

        <View className="w-full border border-gray-50 my-5" />

        <View className="mb-1">
          <View className="flex-row justify-between mb-2">
            <Text className="text-lg text-gray-600">Estimated APY</Text>
            <Text className="text-lg">17.48%</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-lg text-gray-600">Comission</Text>
            <Text className="text-lg">4%</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-lg text-gray-600">Total Stake</Text>
            <Text className="text-lg">150,300 {tokenInfo.name}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-lg text-gray-600"># of Delegators</Text>
            <Text className="text-lg">540</Text>
          </View>
        </View>
      </View>

      <View className="flex-1 justify-end mb-5">
        <LeoButton
          label={`Unstake ${tokenInfo.name}`}
          type="secondary"
          onPress={handleUnstake}
          className="mb-3"
        />
        <LeoButton label="Stake" onPress={() => router.replace('/stake/')} />
      </View>
    </View>
  )
}

export default ActiveStakeScreen
