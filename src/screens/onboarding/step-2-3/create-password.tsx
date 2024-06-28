import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native'
import Checkbox from 'expo-checkbox'
import LeoButton from '@src/components/leo-button'
import LeoPasswordInput, {
  PasswordStrength,
} from '@src/components/leo-password-input'
import { SafeAreaView } from 'react-native-safe-area-context'
import useBottomMargin from '@src/hooks/useBottomMargin'

type CreatePasswordScreenProps = {
  password: string
  confirmPassword: string
  isCreateSecureEntry: boolean
  isVerifySecureEntry: boolean
  isPasswordMatch: boolean
  isPassInputRedHighlighted: boolean
  isHelpUsChecked: boolean
  isContinueButtonDisabled: boolean
  isContinueLoading: boolean
  onPasswordChange: (password: string) => void
  onPasswordConfirmChange: (password: string) => void
  onStrengthChange: (strength: PasswordStrength) => void
  onCreateSecureEntryChange: (isSecureEntry: boolean) => void
  onVerifySecureEntryChange: (isSecureEntry: boolean) => void
  onHelpUsCheck: (isChecked: boolean) => void
  onContinuePress: (password: string) => void
}

const CreatePasswordScreen: React.FC<CreatePasswordScreenProps> = ({
  password,
  confirmPassword,
  isCreateSecureEntry,
  isVerifySecureEntry,
  isPasswordMatch,
  isPassInputRedHighlighted,
  isHelpUsChecked,
  isContinueButtonDisabled,
  isContinueLoading,
  onPasswordChange,
  onPasswordConfirmChange,
  onStrengthChange,
  onCreateSecureEntryChange,
  onVerifySecureEntryChange,
  onContinuePress,
  onHelpUsCheck,
}: CreatePasswordScreenProps) => {
  const bottomMargin = useBottomMargin()

  return (
    <KeyboardAvoidingView className="flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <SafeAreaView edges={['bottom']} className="flex-1 px-5 bg-white">
          <Text className="text-2xl font-bold mt-5 mb-2.5">
            Create password
          </Text>
          <Text className="text-base mb-5">
            {
              "Set a password to unlock your wallet each time you use your device. It can't be used to recover your wallet."
            }
          </Text>

          <LeoPasswordInput
            value={password}
            onChangeText={onPasswordChange}
            onStrengthChange={onStrengthChange}
            customStyles={{
              wrapper: 'mb-8',
              input: isPassInputRedHighlighted ? 'border-red-500' : '',
            }}
            isSecureEntry={isCreateSecureEntry}
            setIsSecureEntry={onCreateSecureEntryChange}
          />

          <LeoPasswordInput
            value={confirmPassword}
            onChangeText={text => {
              onPasswordConfirmChange(text)
            }}
            onStrengthChange={() => {}}
            type="verify"
            match={Boolean(isPasswordMatch)}
            customStyles={{
              input: isPassInputRedHighlighted ? 'border-red-500' : '',
            }}
            isSecureEntry={isVerifySecureEntry}
            setIsSecureEntry={onVerifySecureEntryChange}
          />

          {/* This view is used to prevent the button moving up when the keyboard renders */}
          <View className="flex-row justify-center items-center mt-auto mb-10">
            <Checkbox
              className="self-center mr-4"
              value={isHelpUsChecked}
              onValueChange={onHelpUsCheck}
              color={isHelpUsChecked ? '#4630EB' : undefined}
            />
            <Text>Help us to improve Leo Wallet</Text>
            {/* Uncomment and update link when the web page is ready */}
            {/* <TouchableOpacity
            className="ml-1"
            onPress={() => Linking.openURL('https://example.com')}
          >
            <Text className="text-blue-600">(Read more)</Text>
          </TouchableOpacity> */}
          </View>

          <View className="flex-row justify-center items-center w-100 text-center">
            <Text className="text-sm text-gray-600">
              By proceeding, you agree to the
            </Text>
            <TouchableOpacity
              className="mx-1"
              onPress={() => Linking.openURL('https://www.leo.app/terms')}
            >
              <Text className="text-blue-600">Terms of usage</Text>
            </TouchableOpacity>
            <Text className="text-sm text-gray-600">and</Text>
          </View>

          <TouchableOpacity
            className="flex-row justify-center items-center mb-2.5"
            onPress={() => Linking.openURL('https://www.leo.app/privacy')}
          >
            <Text className="text-blue-600">Privacy Policy</Text>
            <Text className="text-sm text-gray-600">.</Text>
          </TouchableOpacity>

          <LeoButton
            label="Continue"
            onPress={() => {
              onContinuePress(password)
            }}
            disabled={isContinueButtonDisabled}
            isLoading={isContinueLoading}
            className={`${bottomMargin}`}
          />
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default CreatePasswordScreen
