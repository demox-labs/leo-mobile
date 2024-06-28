import React, { Ref } from 'react'
import { View, Text } from 'react-native'
import ActionSheet, {
  ActionSheetProps,
  ActionSheetRef,
} from 'react-native-actions-sheet'
import Icon from '../icons'
import LeoPressable from '../leo-pressable'

interface WebviewControlsModalProps extends ActionSheetProps {
  applyBottomMargin?: boolean
  onRefresh: () => void
  onBookmark: () => void
  onShare: () => void
}

export const WebviewControlsModal = React.forwardRef(
  (props: WebviewControlsModalProps, ref: Ref<ActionSheetRef>) => {
    return (
      <ActionSheet {...props} ref={ref} snapPoints={[90]} gestureEnabled>
        <View className={`p-2 ${props.applyBottomMargin ? 'mb-10' : ''}`}>
          <LeoPressable onPress={props.onRefresh}>
            <View className="flex-row gap-2 py-2 mb-1">
              <Icon name="refresh" size={24} />
              <Text className="text-base">Refresh</Text>
            </View>
          </LeoPressable>
          {/* <TouchableOpacity onPress={props.onBookmark}>
            <View className="flex-row gap-2 py-2 mb-1">
              <Icon name="bookmark" size={24} />
              <Text className="text-base">Bookmark</Text>
            </View>
          </TouchableOpacity> */}
          <LeoPressable onPress={props.onShare}>
            <View className="flex-row gap-2 py-2 mb-1">
              <Icon name="share-fordward" size={24} />
              <Text className="text-base">Share</Text>
            </View>
          </LeoPressable>
        </View>
      </ActionSheet>
    )
  },
)

WebviewControlsModal.displayName = 'WebviewControlsModal'

export default WebviewControlsModal
