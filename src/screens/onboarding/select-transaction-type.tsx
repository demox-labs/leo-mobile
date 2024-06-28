import React from 'react'
import { View, Text, ScrollView } from 'react-native'

import LeoButton from '@src/components/leo-button'

import LeoDivider from '@src/components/leo-divider'
import Icon from '@src/components/icons'
import colors from '@src/utils/colors'
import { SafeAreaView } from 'react-native-safe-area-context'
import useBottomMargin from '@src/hooks/useBottomMargin'

type SelectTransactionTypeScreenProps = {
  selectedTransaction: string
  onContinuePress: () => void
  onSelectTransactionType: (transactionType: 'delegate' | 'local') => void
}

const transactionTypes = [
  {
    title: 'Delegate Transactions',
    isPopular: true,
    privacyLevel: 'VPN level Privacy',
    transactionSpeed: '~2 seconds',
    additionalDownloads: '0 MB',
    proofDelegation: 'Delegates proofs to secure servers',
    keyPrivacy: 'Your keys stay private',
    name: 'delegate',
  },
  {
    title: 'Generate Transactions Locally',
    isPopular: false,
    privacyLevel: 'Maximum privacy',
    transactionSpeed: '~1-10 minutes',
    additionalDownloads: '600+ Megabytes',
    proofDelegation: 'Creates proofs on your device',
    keyPrivacy: 'Your keys stay private',
    name: 'local',
  },
]

const SelectTransactionTypeScreen: React.FC<
  SelectTransactionTypeScreenProps
> = ({ onContinuePress, onSelectTransactionType, selectedTransaction }) => {
  const bottomMargin = useBottomMargin()

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 pt-5 bg-white">
      <Text className="font-semibold pl-5 text-2xl">
        Default Transaction Type
      </Text>

      <ScrollView className="px-5">
        {transactionTypes.map((transactionType, index) => {
          const isSelected = selectedTransaction === transactionType.name

          return (
            <View
              key={index}
              className={`mt-5 p-5 border-2 rounded-xl ${
                isSelected ? 'border-black' : 'border-gray-100'
              }`}
            >
              <View className="flex-row justify-between pb-3">
                <Text className="text-lg">{transactionType.title}</Text>
                {transactionType.isPopular && (
                  <View className="items-center justify-center bg-black rounded-xl px-2">
                    <Text className="text-white font-semibold">Popular</Text>
                  </View>
                )}
              </View>

              <LeoDivider />

              <View className="mt-3">
                <View className="flex-row w-full justify-between my-1">
                  <Text className={' color-gray-600 w-1/2'}>Privacy Level</Text>
                  <Text>{transactionType.privacyLevel}</Text>
                </View>
                <View className="flex-row w-full justify-between my-1">
                  <Text className={' color-gray-600 w-1/2'}>
                    Transaction Speed
                  </Text>
                  <Text>{transactionType.transactionSpeed}</Text>
                </View>
                <View className="flex-row w-full justify-between my-1">
                  <Text className={'color-gray-600 w-1/2'}>
                    Additional Downloads
                  </Text>
                  <Text>{transactionType.additionalDownloads}</Text>
                </View>
                <View className="flex-row w-full justify-between my-1">
                  <Text className={' color-gray-600 w-1/2'}>
                    Proof Delegation
                  </Text>
                  <Text className={'w-[150px] text-right'} numberOfLines={2}>
                    {transactionType.proofDelegation}
                  </Text>
                </View>
                <View className="flex-row w-full justify-between my-1">
                  <Text className={'color-gray-600 w-1/2'}>Key Privacy</Text>
                  <Text>{transactionType.keyPrivacy}</Text>
                </View>
              </View>

              {isSelected ? (
                <View className="flex-row items-center justify-center mt-5 h-12">
                  <Icon
                    name="checkbox-circle-fill"
                    size={20}
                    color={colors.primary[500]}
                  />
                  <Text className="font-medium ml-3 text-base text-primary-500">
                    Selected
                  </Text>
                </View>
              ) : (
                <LeoButton
                  label="Select"
                  type="secondary"
                  className="mt-5"
                  onPress={() =>
                    onSelectTransactionType(
                      transactionType.name as 'delegate' | 'local',
                    )
                  }
                />
              )}
            </View>
          )
        })}
      </ScrollView>

      <View className={`px-5 mt-5 ${bottomMargin}`}>
        <LeoButton label="Continue" onPress={onContinuePress} />
      </View>
    </SafeAreaView>
  )
}

export default SelectTransactionTypeScreen
