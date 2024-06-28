import React, { useCallback } from 'react'
import { View, Text, StatusBar } from 'react-native'
import LeoButton from '@src/components/leo-button'
import LeoToast from '@src/components/leo-toast'
import { SendConfig } from '@src/types/send'
import { capitalize } from '@src/utils/strings'
import { useFocusEffect } from 'expo-router'
import TogglePrivacy from '@src/components/send/toggle-privacy'
import LeoDivider from '@src/components/leo-divider'
import Icon from '@src/components/icons'
import colors from 'tailwind.config.colors'
import { SafeAreaView } from 'react-native-safe-area-context'
import useBottomMargin from '@src/hooks/useBottomMargin'

interface AdvancedSendScreenProps {
  sendType: SendConfig
  receivedType: SendConfig
  hasNoPrivateTokens: boolean
  hasNoPublicTokens: boolean
  toggleSentType: () => void
  toggleReceivedType: () => void
  tokenFee: bigint
  tokenName: string
  onConfirm: () => void
  handleConvert: () => void
}
const AdvancedSendScreen: React.FC<AdvancedSendScreenProps> = ({
  sendType,
  receivedType,
  hasNoPrivateTokens,
  hasNoPublicTokens,
  toggleSentType,
  toggleReceivedType,
  onConfirm,
  handleConvert,
}) => {
  const bottomMargin = useBottomMargin()

  const noTokensToastMessage = (() => {
    if (hasNoPrivateTokens && hasNoPublicTokens) {
      return 'You have no Private or Public tokens. Add funds to your account.'
    }
    if (hasNoPrivateTokens) {
      return 'You have no Private tokens. Convert Public tokens to Private to send.'
    }
    if (hasNoPublicTokens) {
      return 'You have no Public tokens. Convert Private tokens to Public to send'
    }
  })()

  const configTitle = `${capitalize(sendType)} to ${capitalize(receivedType)}`
  const configDescription = (() => {
    if (sendType === 'private' && receivedType === 'private') {
      return 'All transaction details remain confidential.'
    } else if (sendType === 'private' && receivedType === 'public') {
      return "The recipient will receive credits publicly, but the sender's identity remains anonymous."
    } else if (sendType === 'public' && receivedType === 'private') {
      return "The recipient will know the sende's identity and will receive Private credits."
    } else {
      return 'All transaction details are publicly accessible on the blockchain.'
    }
  })()

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content')
    }, []),
  )

  return (
    <SafeAreaView className="flex-1 bg-white p-4 pb-0" edges={['bottom']}>
      <LeoToast show type="warning" className="mb-[46px]">
        <Text className={'flex-1 text-sm ml-3 max-w-[283px]'}>
          {noTokensToastMessage}
          {!(hasNoPrivateTokens && hasNoPublicTokens) ? (
            <Text className={'text-blue-600'} onPress={handleConvert}>
              {' '}
              Convert now.
            </Text>
          ) : null}
        </Text>
      </LeoToast>

      <View className="flex-row items-center">
        <Text className="">You send</Text>
        <TogglePrivacy
          publicSelected={sendType === 'public'}
          onPressPrivate={toggleSentType}
          onPressPublic={toggleSentType}
          className="ml-auto"
        />
      </View>
      <LeoDivider className="my-4" />
      <View className="flex-row items-center w-full justify-between mb-[45px]">
        <Text>Recipient receives</Text>
        <TogglePrivacy
          publicSelected={receivedType === 'public'}
          onPressPrivate={toggleReceivedType}
          onPressPublic={toggleReceivedType}
        />
      </View>

      <View className="flex mb-12 border border-gray-100 py-8 px-4 rounded-2xl mb-2">
        <View className="flex-row justify-center mb-2 gap-1">
          <Icon
            name={sendType === 'public' ? 'globe' : 'lock'}
            color="black"
            size={24}
          />
          <Icon name="arrow-right" color={colors.gray['300']} size={24} />
          <Icon
            name={receivedType === 'public' ? 'globe' : 'lock'}
            color="black"
            size={24}
          />
        </View>
        <Text className="text-base font-medium text-center">{configTitle}</Text>
        <View className="flex-row items-center justify-center">
          <Text className="mt-1 text-center">{configDescription}</Text>
        </View>
      </View>

      <LeoButton
        label="Confirm"
        type="secondary"
        onPress={onConfirm}
        className={`mt-auto ${bottomMargin}`}
      />
    </SafeAreaView>
  )
}

export default AdvancedSendScreen
