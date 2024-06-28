import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import Icon from '../icons'
import { useFocusEffect } from 'expo-router'
import * as Storage from '@src/utils/storage'

export interface StakingButtonProps {
  name: string
  onPress: (hasStaked: boolean) => void
}

const StakingButton: React.FC<StakingButtonProps> = ({ name, onPress }) => {
  const [stakedAmount, setStakedAmount] = React.useState(false)

  useFocusEffect(() => {
    // Check if user has staked tokens
    Storage.getData('stakedAmount').then(setStakedAmount)
  })

  const btnBackground = stakedAmount ? 'bg-primary-50' : 'bg-blue-50'
  const btnTitle = stakedAmount ? `Staked ${name}` : `Staking earning ${name}`
  const rightText = stakedAmount ? `${stakedAmount} ${name}` : '17.48%'

  return (
    <TouchableOpacity
      className={`flex-row justify-between ${btnBackground} mx-3 py-5 px-4 rounded-xl`}
      onPress={() => onPress(!!stakedAmount)}
    >
      <View className="flex-row items-center gap-2">
        <View className="flex justify-center items-center w-[40] h-[40] border border-gray-100 rounded-3xl">
          <Icon name="stake-black-button" size={40} />
        </View>
        <View>
          <Text className="text-lg">{btnTitle}</Text>
          <Text className="color-gray-600">Stake tokens and earn rewards</Text>
        </View>
      </View>
      <View className="items-end">
        <Text className="text-base font-semibold">{rightText}</Text>
        {stakedAmount ? <Text>+0.01 {name}</Text> : null}
      </View>
    </TouchableOpacity>
  )
}

export default StakingButton
