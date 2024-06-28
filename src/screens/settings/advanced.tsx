import { View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useMemo, useState } from 'react'
import { useAccount } from '@src/lib/aleo/ready'
import { resyncAccount } from '@src/lib/aleo/activity/sync/sync'
// import LeoDivider from '@src/components/leo-divider'
// import Icon from '@src/components/icons'
// import { router } from 'expo-router'
import EllipsizedAddress from '@src/components/ellipsized-address'
// import LeoPressable from '@src/components/leo-pressable'

// TODO: Uncomment Network selection here (all of the commented code above and below) when backend is ready.

const SettingsAdvancedScreen = () => {
  const account = useAccount()
  const [isSubmitting, setSubmitting] = useState(false)

  const accountAddress = account?.publicKey

  const resync = useMemo(
    () => async () => {
      if (!isSubmitting && account.publicKey) {
        setSubmitting(true)
        await resyncAccount(account.publicKey)
        setSubmitting(false)
      }
    },
    [account.publicKey, isSubmitting],
  )

  // const onNetworkSelectPress = () => {
  //   router.push('/networks')
  // }

  return (
    <SafeAreaView className={'flex-1 bg-white p-4'} edges={['bottom']}>
      <View className={'flex-1'}>
        {/* <LeoPressable
          onPress={onNetworkSelectPress}
          className="flex-row justify-between py-4"
        >
          <Text className={'text-lg'}>Networks</Text>
          <View className="flex-row gap-4 items-center">
            <Text className={'text-lg text-gray-600'}>Aleo Devnet</Text>
            <Icon name="chevron-right" size={24} color={'#000'} />
          </View>
        </LeoPressable>
        <LeoDivider className="mb-[24px] mt-2" /> */}
        <View className="flex-row gap-1">
          <Text className={'text-lg font-semibold'}>Resync</Text>
          <EllipsizedAddress
            address={accountAddress}
            className="text-lg font-semibold"
          />
        </View>
        <Text className={'text-sm text-gray-600'}>
          Reset all of your history for this account and resync with the
          network.
        </Text>
        <TouchableOpacity
          className="p-3 items-center justify-center rounded-lg bg-primary-500 mt-5"
          onPress={() => resync()}
        >
          <Text className="text-white text-center text-lg font-semibold">
            Resync
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default SettingsAdvancedScreen
