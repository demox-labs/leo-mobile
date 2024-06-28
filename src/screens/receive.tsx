import React, { useCallback } from 'react'
import { View, Text, TouchableOpacity, StatusBar } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import LeoButton from '@src/components/leo-button'
import Icon from '@src/components/icons'
import { useFocusEffect } from 'expo-router'
import useIsSmallScreen from '@src/hooks/useIsSmallScreen'

interface ReceiveScreenProps {
  aleoAddress: string
  copyPressed: boolean
  onSharePress: () => void
  onCopyPress: () => void
}

const ReceiveScreen: React.FC<ReceiveScreenProps> = ({
  aleoAddress,
  copyPressed,
  onSharePress,
  onCopyPress,
}) => {
  const copyIcon = copyPressed ? 'success' : 'file-copy'

  const QRCodeTopMarginPercentage = useIsSmallScreen() ? 20 : 40

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content')
    }, []),
  )

  return (
    <View className="flex-1">
      <View className="flex-1 items-center justify-center p-5 bg-white">
        <View className={`mt-[${QRCodeTopMarginPercentage}%]`}>
          <QRCode
            value={aleoAddress}
            size={200}
            color="black"
            backgroundColor="white"
          />
        </View>
        <TouchableOpacity onPress={onCopyPress}>
          <Text className="font-base color-black mb-5 mt-6 text-center max-w-xs">
            {aleoAddress}
            <Icon className="ml-2" name={copyIcon} color="black" size={12} />
          </Text>
        </TouchableOpacity>
        <View className="mb-5 mt-auto w-full">
          <LeoButton
            label="Share"
            type="link"
            onPress={onSharePress}
            className="mb-[16px]"
          />
          <LeoButton
            label="Copy ALEO Address"
            type="secondary"
            onPress={onCopyPress}
          />
        </View>
      </View>
    </View>
  )
}

export default ReceiveScreen
