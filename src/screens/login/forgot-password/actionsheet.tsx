import LeoButton from '@src/components/leo-button'
import { init } from '@src/lib/aleo/client'
import { removeAllData } from '@src/utils/storage'
import { clearKeychainStorage } from '@src/lib/aleo/safe-storage'
import { useRouter } from 'expo-router'
import React, { Ref } from 'react'
import { View, Text } from 'react-native'
import ActionSheet, {
  ActionSheetProps,
  ActionSheetRef,
} from 'react-native-actions-sheet'
import { resetTables } from '@src/lib/aleo/activity/sync/sync'
const ForgotPasswordModal = React.forwardRef(
  (props: ActionSheetProps, ref: Ref<ActionSheetRef>) => {
    const router = useRouter()

    const handleSignOut = async () => {
      try {
        await resetTables()
        await clearKeychainStorage()
        await removeAllData()
        await init()

        const refObject = ref as React.RefObject<ActionSheetRef>
        refObject.current?.hide()
        router.navigate('/welcome')
      } catch (error) {
        console.log('Error signing out', error)
      }
    }

    return (
      <ActionSheet
        {...props}
        ref={ref}
        useBottomSafeAreaPadding
        drawUnderStatusBar={false}
        gestureEnabled
      >
        <View className="mt-5 px-5">
          <View>
            <Text className="text-xl font-semibold  ">Forgot password?</Text>

            <Text className="mt-3 text-base">
              If you&apos;ve forgotten your password, you need to sign out and
              re-enter your recovery phrase. After that, you can create a new
              password. Do not sign out unless you know your 12-word recovery
              phrase.
            </Text>
          </View>

          <View className="mt-5">
            <LeoButton label="Sign out" onPress={handleSignOut} type="danger" />

            <LeoButton
              label="Cancel"
              className="mt-3"
              type="secondary"
              onPress={() =>
                (ref as React.RefObject<ActionSheetRef>)?.current?.hide()
              }
            />
          </View>
        </View>
      </ActionSheet>
    )
  },
)

ForgotPasswordModal.displayName = 'ForgotPasswordModal'

export default ForgotPasswordModal
