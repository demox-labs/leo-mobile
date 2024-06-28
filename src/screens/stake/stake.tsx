import StakeInput from '@src/components/stake/stake-input'
import LeoButton from '@src/components/leo-button'

import { TokenInfoData } from '@src/types/home'
import { router } from 'expo-router'

import React, { useState } from 'react'
import { Text, View } from 'react-native'

interface StakeScreenProps {
  tokenInfo: TokenInfoData
}

const StakeScreen: React.FC<StakeScreenProps> = ({ tokenInfo }) => {
  const [stakeAmount, setStakeAmount] = useState(50)

  const handleStake = () => {
    router.replace({
      pathname: '/stake/staking',
      params: {
        stakeAmount: String(stakeAmount),
        tokenName: tokenInfo.name,
      },
    })
  }

  return (
    <View className="flex-1 px-3 pt-10 bg-white">
      <StakeInput
        tokenName={tokenInfo.name}
        onChangeText={text => setStakeAmount(Number(text))}
        value={String(stakeAmount)}
        availableAmount={tokenInfo.balance.total}
      />

      <Text className="font-bold text-lg mt-10">Validator</Text>
      <View className="border border-gray-200 rounded-lg mt-3 p-3">
        <View className="flex-row justify-baseline items-center">
          <View className="w-[20px] h-[20px] bg-blue-500 rounded-2xl" />
          <Text className="ml-1 text-lg font-semibold">Aleo Validator</Text>
        </View>

        <View className="mb-1 mt-5">
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

      <View className="flex-1 justify-end items-end flex-row gap-2 mb-5">
        <LeoButton
          fullWidth={false}
          label="Cancel"
          type="secondary"
          onPress={() => router.back()}
        />

        <LeoButton fullWidth={false} label="Stake" onPress={handleStake} />
      </View>
    </View>
  )
}

export default StakeScreen
