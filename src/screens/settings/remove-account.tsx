import React, { useMemo, useRef } from 'react'
import { View, Text, Keyboard, TouchableWithoutFeedback } from 'react-native'
import { ActionSheetRef } from 'react-native-actions-sheet'
import { SafeAreaView } from 'react-native-safe-area-context'

import Icon from '@src/components/icons'
import LeoButton from '@src/components/leo-button'
import LeoInput from '@src/components/leo-input'
import RemoveAccountModal from '@src/components/settings/remove-account-modal'
import LeoToast from '@src/components/leo-toast'

import randomColor from 'randomcolor'
import EllipsizedAddress from '@src/components/ellipsized-address'

type Props = {
  name: string
  publicKey: string
  isLoading: boolean
  password: string
  error: string
  isBaseHdAccount: boolean
  onRemoveAccount: () => void
  onPasswordChange: (text: string) => void
}

const SettingsRemoveAccount = ({
  name,
  publicKey,
  isLoading,
  isBaseHdAccount,
  password,
  error,
  onPasswordChange,
  ...props
}: Props) => {
  const removeAccountModalRef = useRef<ActionSheetRef>(null)
  const color = useMemo(() => randomColor({ seed: publicKey }), [publicKey])

  const onRemoveAccount = () => {
    removeAccountModalRef.current?.hide()
    props.onRemoveAccount()
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} className="">
      <SafeAreaView className={'flex-1 bg-white p-4'} edges={['bottom']}>
        <View className={'flex-1'}>
          <Text className={'text-lg font-semibold'}>Account</Text>
          <Text className={'text-sm'}>
            Account to be removed. If you want to remove another account -
            select it from the home menu.
          </Text>

          <View className="flex-row p-3 mt-5 justify-baseline items-center border rounded-lg border-gray-300">
            <Icon name="leo-logo-blue" size={24} color={color} />
            <View className="ml-3">
              <Text className="ml-1 text-lg font-semibold">{name}</Text>
              <EllipsizedAddress
                address={publicKey}
                className="ml-1 w-[80px]"
              />
            </View>
          </View>

          {isBaseHdAccount ? (
            <View className={'mt-5'}>
              <LeoToast
                type="info"
                message="Deletion of this account is not possible, as it is the primary account established by your seed phrase."
              />
            </View>
          ) : null}

          {isBaseHdAccount ? null : (
            <View className="mt-10">
              <LeoInput
                label="Password"
                onChangeText={onPasswordChange}
                value={password}
                help="Enter password to remove the account"
                secureTextEntry={true}
                errorMessage={error}
              />
            </View>
          )}
        </View>
        {isBaseHdAccount ? null : (
          <LeoButton
            label="Remove"
            disabled={!password}
            isLoading={isLoading}
            onPress={() => removeAccountModalRef.current?.show()}
          />
        )}

        <RemoveAccountModal
          ref={removeAccountModalRef}
          onRemoveAccount={onRemoveAccount}
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

export default SettingsRemoveAccount
