import Icon from '@src/components/icons'
import LeoButton from '@src/components/leo-button'
import LeoInput from '@src/components/leo-input'
import React, { useState } from 'react'
import {
  View,
  Text,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native'

type LoginScreenProps = {
  onUnlockPress: (password: string) => void
  onForgotPasswordPress: () => void
  isLoading: boolean
  isError: boolean
}

const LoginScreen: React.FC<LoginScreenProps> = ({
  onUnlockPress,
  onForgotPasswordPress,
  isLoading,
  isError,
}) => {
  const [password, setPassword] = useState('')

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView className="flex-1 px-5 bg-white" behavior="padding">
        <View className="h-1/2 px-3 justify-center">
          <Icon name="leo-logo-and-name" />
        </View>
        <View className="w-full h-1/2 pb-4">
          <LeoInput
            label="Password"
            onChangeText={setPassword}
            value={password}
            secureTextEntry={true}
          />
          {isError ? (
            <Text className="mb-5 text-red-500">Incorrect password</Text>
          ) : null}
          <LeoButton
            label="Unlock"
            className="mt-3"
            isLoading={isLoading}
            disabled={!password}
            onPress={() => onUnlockPress(password)}
          />
          <LeoButton
            label="Forgot Password?"
            className="mt-3"
            disabled={isLoading}
            type="link"
            onPress={() => onForgotPasswordPress()}
          />
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  )
}

export default LoginScreen
