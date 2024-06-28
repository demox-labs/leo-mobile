import React, { useRef } from 'react'
import { View, Text, Dimensions, TouchableOpacity } from 'react-native'
import LeoButton from '@src/components/leo-button'

import { capitalize } from 'lodash'
import Header from '@src/components/header'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { convertStringToBigInt, formatBigInt } from '@src/utils/money'
import { Ionicons } from '@expo/vector-icons'
import LeoSwitch from '@src/components/leo-switch'
import LeoBottomSheet, {
  LeoBottomSheetRef,
} from '@src/components/leo-bottom-sheet'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import LeoDivider from '@src/components/leo-divider'

interface ReviewScreenProps {
  isLoading: boolean
  amount: string
  tokenSymbol: string
  convertType: string
  fee: {
    amount: string
    type: 'public' | 'private'
  }
  onConvertPress: () => void
  delegateTransaction: boolean
  onDelegateTransactionChange: (value: boolean) => void
}

const ReviewScreen: React.FC<ReviewScreenProps> = ({
  isLoading,
  amount,
  fee,
  tokenSymbol,
  convertType,
  onConvertPress,
  delegateTransaction,
  onDelegateTransactionChange,
}) => {
  const bottomSheetRef = useRef<LeoBottomSheetRef>(null)
  const handlePresentModal = () => bottomSheetRef.current?.expand()

  const bottomSheetSnapPoints =
    Dimensions.get('window').width < 450 ? ['50%'] : ['36%']

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-white p-4 pb-0">
        <Header title="Review" />
        <View className="flex-row justify-center my-8">
          <View className="flex-row items-end">
            <Text className="text-3xl font-bold">
              {formatBigInt(convertStringToBigInt(amount))}
            </Text>

            <Text className="text-xl ml-1">{tokenSymbol}</Text>
          </View>
        </View>
        <LeoDivider className="mt-10" />
        <View className="flex-row justify-between items-center mb-1 pt-4">
          <Text className="text-gray-600">Convert</Text>
          <Text>{convertType}</Text>
        </View>

        <View className="flex-row justify-between items-start my-1 pb-4">
          <Text className="text-gray-600">Fee type</Text>
          <View className="flex-col items-end">
            <Text>{capitalize(fee.type)}</Text>
            <Text className="text-gray-500 text-sm">
              {formatBigInt(convertStringToBigInt(fee.amount))} {tokenSymbol}
            </Text>
          </View>
        </View>
        <LeoDivider />

        <View className="flex-row justify-between items-center py-4">
          <View className="flex-row items-center">
            <Text className="mr-1">Delegate this transaction</Text>
            <TouchableOpacity onPress={handlePresentModal}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color="black"
                className="ml-2"
              />
            </TouchableOpacity>
          </View>

          <LeoSwitch
            value={delegateTransaction}
            onValueChange={value => onDelegateTransactionChange(value)}
          />
        </View>
        <LeoDivider />

        <View className="flex-row gap-2 mt-auto mb-5">
          <LeoButton
            fullWidth={false}
            label="Cancel"
            type="secondary"
            disabled={isLoading}
            onPress={() => router.back()}
          />
          <LeoButton
            isLoading={isLoading}
            fullWidth={false}
            label="Convert"
            onPress={() => onConvertPress()}
          />
        </View>
      </SafeAreaView>

      <LeoBottomSheet
        ref={bottomSheetRef}
        title="Delegate this transaction"
        snapPoints={bottomSheetSnapPoints}
        content={
          <Text className="text-base">
            Here you can configure delegation of proof generation to a remote
            server. This will speed up proof generation but disclose the
            transaction details to a trusted server.
          </Text>
        }
      />
    </GestureHandlerRootView>
  )
}

export default ReviewScreen
