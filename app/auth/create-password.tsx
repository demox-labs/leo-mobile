import React, { useLayoutEffect, useState } from 'react'
import CreatePasswordScreen from '@src/screens/onboarding/step-2-3/create-password'
import { useNavigation, useLocalSearchParams, useRouter } from 'expo-router'
import customHeaderOptions from '@src/components/navigation/custom-header-options'
import { useAleoClient } from '@src/lib/aleo'
import useSettingsStore from '@src/state/zustand/settings'
import { PasswordStrength } from '@src/components/leo-password-input'

const CreatePasswordRoute = () => {
  const navigation = useNavigation()
  const router = useRouter()
  const { registerWallet } = useAleoClient()
  const { setIsAnonymousAnalyticsEnabled } = useSettingsStore()
  const { isImportWalletFlow, mnemonicWords } = useLocalSearchParams<{
    isImportWalletFlow?: string
    mnemonicWords: string
  }>()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isHelpUsChecked, setIsHelpUsChecked] = useState(true)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>(
    PasswordStrength.None,
  )

  const [isCreateSecureEntry, setIsCreateSecureEntry] = useState(true)
  const [isVerifySecureEntry, setIsVerifySecureEntry] = useState(true)
  const [isContinueLoading, setIsContinueLoading] = useState(false)

  const hasVerifyPassword = !!confirmPassword
  const isPasswordMatch = password === confirmPassword && hasVerifyPassword
  const shouldHaveRedOutline = hasVerifyPassword && !isPasswordMatch

  const isContinueButtonDisabled =
    !isPasswordMatch ||
    passwordStrength === PasswordStrength.None ||
    passwordStrength === PasswordStrength.Low

  useLayoutEffect(() => {
    const dotsLength = isImportWalletFlow === 'true' ? 2 : 3
    const activeDotIndex = isImportWalletFlow === 'true' ? 1 : 2

    navigation.setOptions({
      ...customHeaderOptions({
        navigation,
        dotsIndicatorConfig: { activeDotIndex, dotsLength },
      }),
      headerLeft: () => null,
    })
  }, [])

  const onContinuePress = async (password: string) => {
    try {
      setIsContinueLoading(true)
      setIsAnonymousAnalyticsEnabled(isHelpUsChecked)

      await registerWallet(
        password,
        mnemonicWords,
        isImportWalletFlow === 'true',
      )

      router.replace('/select-transaction-type')
    } catch (error) {
      console.error('Error registering wallet', error)
    } finally {
      setIsContinueLoading(false)
    }
  }

  return (
    <CreatePasswordScreen
      password={password}
      confirmPassword={confirmPassword}
      isCreateSecureEntry={isCreateSecureEntry}
      isVerifySecureEntry={isVerifySecureEntry}
      isPasswordMatch={isPasswordMatch}
      isPassInputRedHighlighted={shouldHaveRedOutline}
      isHelpUsChecked={isHelpUsChecked}
      isContinueButtonDisabled={isContinueButtonDisabled}
      isContinueLoading={isContinueLoading}
      onPasswordChange={setPassword}
      onPasswordConfirmChange={setConfirmPassword}
      onStrengthChange={setPasswordStrength}
      onCreateSecureEntryChange={setIsCreateSecureEntry}
      onVerifySecureEntryChange={setIsVerifySecureEntry}
      onHelpUsCheck={setIsHelpUsChecked}
      onContinuePress={onContinuePress}
    />
  )
}

export default CreatePasswordRoute
