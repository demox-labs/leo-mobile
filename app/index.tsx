import React, { useCallback, useEffect, useState } from 'react'
import { useFocusEffect, useRouter } from 'expo-router'
import { AleoStatus, useAleoClient } from '@src/lib/aleo'
import {
  fetchBiometricAuthEnabled,
  fetchUserPassword,
} from '@src/lib/aleo/safe-storage'
import * as LocalAuthentication from 'expo-local-authentication'
import RootScreen from '@src/screens'

export const App = () => {
  const router = useRouter()
  const { unlock, data } = useAleoClient()

  const [isBiometricAuthEnabled, setBiometricAuthEnabled] = useState<
    boolean | null
  >(null)
  const [hasBiometricAuth, setHasBiometricAuth] = useState(false)

  useFocusEffect(
    useCallback(() => {
      loadSecureSettings()
    }, []),
  )
  const loadSecureSettings = useCallback(async () => {
    const isEnabled = await fetchBiometricAuthEnabled()
    const hasBiometricAuth = await LocalAuthentication.hasHardwareAsync()

    setHasBiometricAuth(hasBiometricAuth)
    setBiometricAuthEnabled(isEnabled && hasBiometricAuth)
  }, [])

  const performBiometricUnlock = useCallback(async () => {
    if (!isBiometricAuthEnabled || !hasBiometricAuth) {
      return
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock your wallet',
      disableDeviceFallback: true,
      cancelLabel: 'Use password',
    })

    if (result.success) {
      const password = await fetchUserPassword()
      await unlock(password)
      router.replace('/home')
    } else {
      router.replace('/auth/login')
    }
  }, [isBiometricAuthEnabled, hasBiometricAuth])

  useEffect(() => {
    if (isBiometricAuthEnabled === null) {
      return
    }

    // If the wallet is ready, go to the home screen
    if (data.status === AleoStatus.Ready) {
      router.replace('/home')
      return
    }

    // If the wallet is idle and biometric auth is disabled, go to the login screen
    if (!isBiometricAuthEnabled && data.status === AleoStatus.Idle) {
      router.replace('/auth/welcome')
      return
    }

    if (data.status === AleoStatus.Locked) {
      if (isBiometricAuthEnabled) {
        // If biometric auth is enabled, try to unlock with biometrics
        performBiometricUnlock()
      } else {
        // If biometric auth is disabled, go to the login screen
        setTimeout(() => {
          router.replace('/auth/login')
        }, 1500)
      }
    }
  }, [isBiometricAuthEnabled, data.status])

  return <RootScreen />
}

export default App
