import React, { forwardRef } from 'react'
import { View, Text } from 'react-native'
import BottomSheet, {
  BottomSheetBackdrop,
  useBottomSheet,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet'
import LeoButton from './leo-button'

export type LeoBottomSheetRef = BottomSheet

const CloseBtn: React.FC<{ label?: string }> = ({ label }) => {
  const { close } = useBottomSheet()

  return (
    <LeoButton
      label={label ?? 'Close'}
      onPress={() => close()}
      type="secondary"
      className="mt-auto mb-14"
    />
  )
}

interface LeoBottomSheetProps {
  title: string
  content: React.ReactNode
  snapPoints?: Array<string>
  closeButtonLabel?: string
}
const LeoBottomSheet = forwardRef<LeoBottomSheetRef, LeoBottomSheetProps>(
  (props, ref) => {
    const { title, content, snapPoints, closeButtonLabel } = props

    // variables to control the snap points of the bottom sheet
    const _snapPoints = React.useMemo(() => snapPoints ?? ['50%'], [snapPoints])

    // Custom backdrop to darken the background
    const renderBackdrop = React.useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          opacity={0.2}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      ),
      [],
    )

    return (
      <BottomSheet
        ref={ref}
        index={-1} // initial snap point (-1 for closed)
        snapPoints={_snapPoints}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: 'white' }}
      >
        <View className="p-4 pb-0 flex-1">
          <Text className="text-base font-semibold mb-5">{title}</Text>
          {content}
          <CloseBtn label={closeButtonLabel} />
        </View>
      </BottomSheet>
    )
  },
)

LeoBottomSheet.displayName = 'LeoBottomSheet'

export default LeoBottomSheet
