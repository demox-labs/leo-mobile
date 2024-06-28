import React, { useCallback } from 'react'
import { useRouter } from 'expo-router'
import BiometricAuthEnrollScreen from '@src/screens/biometric-auth-enroll'
import * as LocalAuthentication from 'expo-local-authentication'
import { setBiometricAuthEnabled } from '@src/lib/aleo/safe-storage'
import { StorageKeys, setData } from '@src/utils/storage'

const BiometricAuthEnrollRoute = () => {
  const router = useRouter()

  const onAction = useCallback(async (action: 'confirm' | 'skip') => {
    switch (action) {
      case 'confirm': {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Confirm your biometric authentication',
        })

        if (result.success) {
          setBiometricAuthEnabled(true)
          router.back()
        }
        break
      }
      case 'skip':
        router.back()
        break
    }

    setData(StorageKeys.HAS_ASKED_FOR_BIOMETRIC_AUTH, 'true')
  }, [])

  return <BiometricAuthEnrollScreen onAction={onAction} />
}

export default BiometricAuthEnrollRoute
