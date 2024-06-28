import Icon from '@src/components/icons'
import LeoButton from '@src/components/leo-button'
import LeoToast from '@src/components/leo-toast'
import React, { useCallback, useState } from 'react'
import { View, Text, Linking, StatusBar, Platform } from 'react-native'
import Clipboard from '@react-native-clipboard/clipboard'
import { useFocusEffect } from 'expo-router'

type Step = {
  key: string
  content: React.ReactNode
}

const steps: Step[] = [
  {
    key: 'joinDiscord',
    content: (
      <Text>
        Join the{' '}
        <Text
          onPress={() => Linking.openURL('https://link.leo.app/faucet-discord')}
          className="text-blue-500"
        >
          Leo Wallet Discord server.
        </Text>
      </Text>
    ),
  },
  {
    key: 'verifyAccount',
    content: (
      <Text>
        <Text
          onPress={() => Linking.openURL('https://link.leo.app/faucet-verify')}
          className="text-blue-500"
        >
          Verify
        </Text>{' '}
        your account on the server.
      </Text>
    ),
  },
  {
    key: 'navigatToFaucetChannel',
    content: (
      <Text>
        Navigate to{' '}
        <Text
          onPress={() => Linking.openURL('https://link.leo.app/faucet-channel')}
          className="text-blue-500"
        >
          faucet channel.
        </Text>
      </Text>
    ),
  },
  {
    key: 'pressFaucetButtonAndCopyAleoAddress',
    content: "Press the 'Request Faucet' button and paste your Aleo address.",
  },
  {
    key: 'done',
    content: 'Done! 15 Testnet credits will be delivered in a few minutes.',
  },
]

interface FaucetScreenProps {
  aleoAddress: string
}
const FaucetScreen: React.FC<FaucetScreenProps> = ({ aleoAddress }) => {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopyAleoAddress = () => {
    Clipboard.setString(aleoAddress)
    setIsCopied(true)
  }

  useFocusEffect(
    useCallback(() => {
      Platform.OS === 'ios' && StatusBar.setBarStyle('light-content')
    }, []),
  )

  return (
    <View className="flex-1 bg-white px-4 pt-5">
      {steps.map((step, index) => (
        <View key={step.key} className="flex-row items-center gap-2 mb-4">
          <View className="w-[32px] h-[32px] bg-gray-50 rounded-full items-center justify-center">
            <Text>{index + 1}</Text>
          </View>
          <Text className="max-w-[90%]">{step.content}</Text>
        </View>
      ))}

      <LeoButton
        type="link"
        label="View Tutorial"
        onPress={() => Linking.openURL('https://link.leo.app/faucet-tutorial')}
        icon={<Icon name="arrow-right-up" size={24} />}
        iconPosition="right"
        className="mb-4"
      />

      <LeoToast
        type="info"
        message="If you have any questions about the faucet, please create a support
        ticket in the Leo Wallet Discord server."
      />

      <LeoButton
        label={isCopied ? 'Copied' : 'Copy ALEO Address'}
        icon={isCopied ? <Icon name="success" size={24} color="black" /> : null}
        onPress={handleCopyAleoAddress}
        type="secondary"
        className="mt-auto mb-10"
      />
    </View>
  )
}

export default FaucetScreen
