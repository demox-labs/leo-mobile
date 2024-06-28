import React, { useCallback } from 'react'
import { Platform, View, Text } from 'react-native'
import Icon from '@src/components/icons'
import LeoButton from '@src/components/leo-button'
import { SafeAreaView } from 'react-native-safe-area-context'
import useBottomMargin from '@src/hooks/useBottomMargin'

export type Props = {
  onAction: (action: 'confirm' | 'skip') => void
}

const BiometricAuthEnroll = ({ onAction }: Props) => {
  const biometricType = Platform.select({
    ios: 'Touch ID / Face ID',
    android: 'Fingerprint / Face Recognition',
    default: 'Biometric Authentication',
  })

  const onConfirmCallback = useCallback(() => onAction('confirm'), [onAction])
  const onSkipCallback = useCallback(() => onAction('skip'), [onAction])

  const copy = `Use ${biometricType} for faster and easier access to your account. You can turn this feature on or off at any time under Settings.`

  const bottomMargin = useBottomMargin()

  return (
    <SafeAreaView
      edges={['bottom']}
      className="flex flex-1 p-4 pb-0 gap-y-8 bg-white"
    >
      <View className="flex-1 items-center justify-center gap-8">
        <View className="items-center justify-center">
          <Icon name="background-circle" />
          <Icon name="face-id" className="absolute" size={80} />
        </View>
        <View className="flex items-center gap-y-2">
          <Text className="text-2xl font-bold">
            Use Biometric Authentication
          </Text>

          <Text className="text-center text-base">{copy}</Text>
        </View>
      </View>

      <View>
        <LeoButton
          label={`Enable ${biometricType}`}
          type="primary"
          onPress={onConfirmCallback}
        />
        <LeoButton
          label="I'll do this later"
          type="secondary"
          className={`mt-4 ${bottomMargin}`}
          onPress={onSkipCallback}
        />
      </View>
    </SafeAreaView>
  )
}

export default BiometricAuthEnroll
