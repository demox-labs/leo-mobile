import React, { useEffect, useMemo, useState } from 'react'
import { View, Text } from 'react-native'
import {
  Camera,
  Code,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import LeoButton from './leo-button'
import Animated, {
  SlideInDown,
  SlideOutDown,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated'

const NoCameraDeviceError: React.FC = () => (
  <View className="flex-1 items-center justify-center bg-black">
    <Text className="text-2xl text-white">No camera available</Text>
  </View>
)

const NoPermissionLoadingIndicator: React.FC = () => (
  <View className="flex-1 items-center justify-center bg-black">
    <Text className="text-2xl text-white">Requesting camera permission...</Text>
  </View>
)

interface QRCodeScannerProps {
  code: Code | null
  isValidAddress: boolean | null
  hasCameraPermission: boolean

  onSendPress: () => void
  onScannedBarcode: (code: Code) => void
}

const QRCodeScannerScreen: React.FC<QRCodeScannerProps> = ({
  code,
  isValidAddress,
  hasCameraPermission,
  onSendPress,
  onScannedBarcode,
}) => {
  const insets = useSafeAreaInsets()
  const device = useCameraDevice('back')
  const [isScanning, setIsScanning] = useState(false)
  const [scanTimeout, setScanTimeout] = useState<NodeJS.Timeout | null>(null)

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: codes => {
      setIsScanning(true)

      if (codes.length > 0) {
        onScannedBarcode(codes[0])
      }

      if (scanTimeout) clearTimeout(scanTimeout)

      setScanTimeout(
        setTimeout(() => {
          setIsScanning(false)
        }, 500),
      )
    },
  })

  useEffect(() => {
    return () => {
      if (scanTimeout) clearTimeout(scanTimeout)
    }
  }, [])

  const borderAnimationProgress = useDerivedValue(() => {
    return withTiming(isScanning ? 1 : 0, {
      duration: 150,
    })
  })

  const borderAnimationStyle = useAnimatedStyle(() => {
    const scale = interpolate(borderAnimationProgress.value, [0, 1], [1, 0.5])

    return {
      transform: [{ scale }],
    }
  })

  const uiBorderItems = useMemo(() => {
    const baseClassName = 'absolute h-12 w-12'
    let borderColor = 'border-white'

    if (isScanning && isValidAddress) {
      borderColor = 'border-green-500'
    } else if (isScanning && !isValidAddress) {
      borderColor = 'border-red-500'
    }

    const borders = [
      '-top-6 -left-6 border-l-4 border-t-4 rounded-tl-xl',
      '-top-6 -right-6 border-r-4 border-t-4 rounded-tr-xl',
      '-bottom-6 -right-6 border-r-4 border-b-4 rounded-br-xl',
      '-bottom-6 -left-6 border-l-4 border-b-4 rounded-bl-xl',
    ]

    return borders.map(border => [baseClassName, border, borderColor].join(' '))
  }, [code, isValidAddress, isScanning])

  if (!device) {
    return <NoCameraDeviceError />
  }

  if (!hasCameraPermission) {
    return <NoPermissionLoadingIndicator />
  }

  return (
    <View className="flex-1 bg-black">
      <Camera
        className="absolute top-0 left-0 right-0 bottom-0"
        codeScanner={codeScanner}
        device={device}
        isActive={true}
      />
      <View className="flex-1">
        <View className={'bg-black/60 flex-1'} />
        <View className=" flex-row z-10 ">
          <View className="flex-1 bg-black/60 " />
          <View className="w-[65%] aspect-square z-20">
            {uiBorderItems.map((item, index) => (
              <Animated.View
                key={index}
                className={item}
                style={[borderAnimationStyle]}
              />
            ))}
          </View>
          <View className="flex-1 bg-black/60" />
        </View>
        <View
          className="bg-black/60 flex-1 justify-center"
          style={{
            paddingBottom: Math.round(insets.bottom),
          }}
        >
          {code && isValidAddress ? (
            <Animated.View
              className={'flex-row  px-8 space-x-4 '}
              entering={SlideInDown}
              exiting={SlideOutDown}
            >
              <LeoButton
                label={`Send to ${code.value?.slice(0, 8) + '...' + code.value?.slice(-8)}`}
                type="primary"
                className="flex-1"
                onPress={onSendPress}
              />
            </Animated.View>
          ) : null}
        </View>
      </View>
    </View>
  )
}

export default QRCodeScannerScreen
