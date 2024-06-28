// this is an actionsheet controls modal that appears when a user press the menu button in the webview
import Icon from '@src/components/icons'
import LeoPressable from '@src/components/leo-pressable'
import React, { Ref } from 'react'
import { View, Text } from 'react-native'
import ActionSheet, {
  ActionSheetProps,
  ActionSheetRef,
} from 'react-native-actions-sheet'

interface TabsControlsModalProps extends ActionSheetProps {
  onCloseAllTabsPress: () => void
}

export const TabsControlsModal = React.forwardRef(
  (props: TabsControlsModalProps, ref: Ref<ActionSheetRef>) => {
    return (
      <ActionSheet {...props} ref={ref} snapPoints={[90]} gestureEnabled>
        <View className="p-[28px] h-[90px] mb-10">
          <LeoPressable onPress={props.onCloseAllTabsPress}>
            <View className="flex-row items-center">
              <Icon name="close-circle" size={24} />
              <Text className="text-lg ml-[16px]">Close all tabs</Text>
            </View>
          </LeoPressable>
        </View>
      </ActionSheet>
    )
  },
)

TabsControlsModal.displayName = 'TabsControlsModal'

export default TabsControlsModal
