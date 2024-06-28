import React, { useCallback, useMemo, useState } from 'react'
import SettingsGeneralScreen, { Option } from '@src/screens/settings/general'
import useSettingsStore from '@src/state/zustand/settings'
import {
  fetchBiometricAuthEnabled,
  setBiometricAuthEnabled as secureSetBiometricAuthEnabled,
} from '@src/lib/aleo/safe-storage'
import * as LocalAuthentication from 'expo-local-authentication'
import { useFocusEffect, useRouter } from 'expo-router'
import { biometricTypeName } from '@src/utils/strings'

export default function SettingsGeneral() {
  const store = useSettingsStore()
  const router = useRouter()
  const [hasBiometricAuth, setHasBiometricAuth] = useState(false)
  const [isBiometricAuthEnabled, setIsBiometricAuthEnabled] = useState(false)

  useFocusEffect(
    useCallback(() => {
      loadSecureSettings()
    }, []),
  )

  const loadSecureSettings = async () => {
    const hasBiometricAuth = await LocalAuthentication.hasHardwareAsync()
    const cachedIsBiometricAuthEnabled = await fetchBiometricAuthEnabled()
    setIsBiometricAuthEnabled(cachedIsBiometricAuthEnabled)
    setHasBiometricAuth(hasBiometricAuth)
  }

  const onBiometricAuthEnabledChange = async (value: boolean) => {
    if (!hasBiometricAuth) {
      return
    }

    if (!isBiometricAuthEnabled) {
      router.push('/biometric-auth-enroll')
    } else {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirm your identity',
      })

      if (result.success) {
        setIsBiometricAuthEnabled(value)
        secureSetBiometricAuthEnabled(value)
      }
    }
  }

  const options: Option[] = useMemo(() => {
    const options = [
      {
        id: 'wallet-lock-up',
        title: 'Wallet lock-up',
        description:
          'The app will automatically lock after 10 minutes of inactivity.',
        value: store.isWalletLockUpEnabled,
      },
      {
        id: 'anonymous-analytics',
        title: 'Anonymous Analytics',
        description:
          'Here you can configure sending of anonymous analytics that helps us to improve the product.',
        value: store.isAnonymousAnalyticsEnabled,
      },
      {
        id: 'delegate-transactions',
        title: 'Delegate transactions by default',
        description:
          'Here you can configure delegation of proof generation to a remote server. This will speed up proof generation but disclose the transaction details to a trusted server.',

        value: store.isDelegateTransactionsByDefaultEnabled,
      },
      {
        id: 'enable-browser',
        title: 'Enable Browser',
        description: 'Here you can toggle the browser functionality.',
        value: store.isBrowserEnabled,
      },
    ]

    if (hasBiometricAuth) {
      options.push({
        id: 'enable-biometric-auth',
        title: `Enable ${biometricTypeName} Authentication`,
        description:
          'Here you can toggle the biometric authentication functionality.',
        value: isBiometricAuthEnabled,
      })
    }
    return options
  }, [store, isBiometricAuthEnabled, hasBiometricAuth])

  const onOptionToggle = (optionId: string, value: boolean) => {
    switch (optionId) {
      case 'wallet-lock-up':
        store.setIsWalletLockUpEnabled(value)
        break
      case 'anonymous-analytics':
        store.setIsAnonymousAnalyticsEnabled(value)
        break
      case 'delegate-transactions':
        store.setIsDelegateTransactionsByDefaultEnabled(value)
        break
      case 'enable-browser':
        store.setIsBrowserEnabled(value)
        break
      case 'enable-biometric-auth':
        onBiometricAuthEnabledChange(value)
        break
      default:
        throw new Error(`Unknown option ID: ${optionId}`)
    }
  }

  return (
    <SettingsGeneralScreen options={options} onOptionChange={onOptionToggle} />
  )
}
