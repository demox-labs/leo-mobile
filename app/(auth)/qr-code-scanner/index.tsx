import React, { useCallback, useEffect, useState } from 'react'
import QRCodeScanner from '@src/components/qr-code-scanner'
import { Code, useCameraPermission } from 'react-native-vision-camera'
import { useFocusEffect, useRouter } from 'expo-router'
import { addressIsValid } from 'modules/leo-sdk-module'
import { Platform, StatusBar } from 'react-native'

const QRCodeScannerRoute = () => {
  const router = useRouter()

  const { hasPermission, requestPermission } = useCameraPermission()

  const [code, setCode] = useState<Code | null>(null)
  const [scanTimeout, setScanTimeout] = useState<NodeJS.Timeout | null>(null)
  const [isValidAddress, setIsValidAddress] = useState<boolean | null>(null)

  useEffect(() => {
    checkAddress()
  }, [code?.value])

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(
        Platform.OS === 'ios' ? 'light-content' : 'dark-content',
      )
      if (!hasPermission) {
        requestPermission()
      }
    }, []),
  )

  const checkAddress = async () => {
    if (!code?.value) return

    const isValid = await addressIsValid(code.value)
    setIsValidAddress(isValid)
  }

  const onSendPress = () => {
    if (!code?.value) return

    router.navigate({
      pathname: '/send-tokens/',
      params: { aleoAddress: code.value },
    })
  }

  const onCancelCode = () => {
    if (scanTimeout) clearTimeout(scanTimeout)

    setCode(null)
    setScanTimeout(null)
    setIsValidAddress(null)
  }

  const onScannedBarcode = (code: Code) => {
    setCode(code)

    if (scanTimeout) clearTimeout(scanTimeout)

    setScanTimeout(
      setTimeout(() => {
        if (!isValidAddress) {
          onCancelCode()
        }
      }, 500),
    )
  }

  return (
    <QRCodeScanner
      code={code}
      isValidAddress={isValidAddress}
      hasCameraPermission={hasPermission}
      onScannedBarcode={onScannedBarcode}
      onSendPress={onSendPress}
    />
  )
}

export default QRCodeScannerRoute
