import Icon from '@src/components/icons'
import LeoButton from '@src/components/leo-button'
import { accountAddress } from '@src/api/mockedData'

import { router } from 'expo-router'

import React from 'react'
import { Text, View } from 'react-native'

const StakeEmptyBalance: React.FC = () => {
  return (
    <View className="flex-1 px-3 bg-white">
      <View className="flex h-1/2 justify-end items-center">
        <View className="bg-gray-25 p-10 rounded-full h-1/2 w-1/2 items-center justify-center">
          <Icon name="checkbox-circle" size={80} className="absolute" />
        </View>
      </View>
      <View className="mt-10 p-1 items-center justify-center">
        <Text className="font-bold text-2xl">Aleo Required</Text>
        <Text className="text-lg mt-3 text-center">
          To enable staking, please deposit some Public Aleo.
        </Text>
      </View>
      <View className="flex-1 justify-end mb-5">
        <LeoButton
          label="Deposit Aleo"
          onPress={() =>
            router.replace({
              pathname: '/receive/',
              params: { aleoAddress: accountAddress },
            })
          }
        />
      </View>
    </View>
  )
}

export default StakeEmptyBalance
