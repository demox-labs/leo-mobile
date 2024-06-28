import LeoButton from '@src/components/leo-button'
import React, { Ref } from 'react'
import { View, Text } from 'react-native'
import ActionSheet, {
  ActionSheetProps,
  ActionSheetRef,
} from 'react-native-actions-sheet'

interface DeleteContactModalProps extends ActionSheetProps {
  onDeleteContact: () => void
}

const DeleteContactModal = React.forwardRef(
  (props: DeleteContactModalProps, ref: Ref<ActionSheetRef>) => {
    return (
      <ActionSheet
        {...props}
        ref={ref}
        useBottomSafeAreaPadding
        snapPoints={[120]}
        drawUnderStatusBar={false}
        gestureEnabled
      >
        <View className="mt-5 px-5">
          <View className="">
            <Text className="text-xl font-semibold">Delete contact?</Text>

            <Text className="mt-3 text-base">
              Are you sure you want to delete this contact? Confirming this
              action will permanently remove the contact from your crypto
              wallet&apos;s address book.
            </Text>
          </View>

          <View className="mt-5">
            <LeoButton
              label="Delete"
              type="danger"
              onPress={props.onDeleteContact}
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

DeleteContactModal.displayName = 'DeleteContactModal'

export default DeleteContactModal
