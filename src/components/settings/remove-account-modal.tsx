import LeoButton from '@src/components/leo-button'
import React, { Ref } from 'react'
import { View, Text } from 'react-native'
import ActionSheet, {
  ActionSheetProps,
  ActionSheetRef,
} from 'react-native-actions-sheet'

interface RemoveAccountModalProps extends ActionSheetProps {
  onRemoveAccount: () => void
}

const RemoveAccountModal = React.forwardRef(
  (props: RemoveAccountModalProps, ref: Ref<ActionSheetRef>) => {
    return (
      <ActionSheet
        {...props}
        ref={ref}
        drawUnderStatusBar={false}
        gestureEnabled
      >
        <View className="mt-5 px-5 pb-8">
          <View className="">
            <Text className="text-xl font-semibold">Remove Account</Text>

            <Text className="mt-3 text-base">
              Once proceed, Account will be removed and the account information
              will be deleted. Please make sure you have saved the Private
              Key/View Key for these wallets before continuing.
            </Text>
          </View>

          <View className="mt-5">
            <LeoButton
              label="Remove"
              type="danger"
              onPress={props.onRemoveAccount}
            />

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

RemoveAccountModal.displayName = 'RemoveAccountModal'

export default RemoveAccountModal
