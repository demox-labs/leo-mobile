import { View, Text, Modal } from 'react-native'
import React, { useEffect } from 'react'
import LeoButton from '../leo-button'
import Constants from 'expo-constants'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated'

const StatusBarHeight = Constants.statusBarHeight
const BannerHeight = 150

const formatSyncFraction = (syncFraction: number) => {
  return `${syncFraction.toFixed(1)}%`
}

const ModalWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={true}
      statusBarTranslucent={true}
      collapsable={false}
    >
      {children}
    </Modal>
  )
}

export interface BalancePendingBannerProps {
  syncProgress?: number
  isVisible: boolean
  isTooltipVisible: boolean
  closeTooltip: () => void
  onLearnMorePress?: () => void
}
const BalancePendingBanner: React.FC<BalancePendingBannerProps> = ({
  syncProgress,
  isVisible,
  isTooltipVisible,
  closeTooltip,
  onLearnMorePress,
}) => {
  const WrapperView = isTooltipVisible ? ModalWrapper : React.Fragment

  const bannerTop = useSharedValue(-BannerHeight * 1.1)
  const bannerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: bannerTop.value }],
    }
  })

  const tooltipOpacity = useSharedValue(0)
  const tooltipStyle = useAnimatedStyle(() => {
    return {
      opacity: tooltipOpacity.value,
    }
  })

  const onTooltipClose = () => {
    tooltipOpacity.value = withTiming(0, {}, finished => {
      if (finished) {
        runOnJS(closeTooltip)()
      }
    })
  }

  useEffect(() => {
    if (!isVisible) {
      bannerTop.value = withTiming(-BannerHeight * 1.1) // Slide out the banner

      tooltipOpacity.value = withTiming(0) // Fade out the tooltip
    } else {
      bannerTop.value = withTiming(0) // Slide in the banner

      if (isTooltipVisible) {
        tooltipOpacity.value = withTiming(1) // Fade in the tooltip
      }
    }
  }, [isVisible, isTooltipVisible])

  if (!isVisible && bannerTop.value === -BannerHeight) return null

  return (
    <WrapperView>
      <Animated.View
        style={[
          bannerStyle,
          {
            zIndex: 2,
            paddingTop: StatusBarHeight + 15,
          },
        ]}
        className={`w-full bg-black h-[${BannerHeight}px] justify-center p-5 absolute`}
      >
        <View>
          <View className="flex-row justify-between items-center">
            <Text className="text-white text-base font-bold">
              Balance pending Sync
            </Text>
            {syncProgress !== undefined ? (
              <Text className="text-white text-base font-bold">
                {formatSyncFraction(syncProgress)}
              </Text>
            ) : (
              <View className="w-14 h-5 bg-gray-800 rounded-full" />
            )}
          </View>
          <Text className="text-white text-sm">
            This may take a few minutes.
          </Text>
        </View>

        {/* Progress bar container */}
        <View className="w-full h-[4px] bg-gray-800 rounded-full overflow-hidden mb-2 mt-2">
          {/* Progress bar */}
          {syncProgress !== undefined ? (
            <View
              className="h-full bg-white"
              style={{ width: `${syncProgress}%` }}
            />
          ) : (
            <View className="h-full bg-gray-800" />
          )}
        </View>
      </Animated.View>

      {isTooltipVisible ? (
        <Animated.View
          className="px-5 flex-1 top-0 left-0 right-0 bottom-0 absolute"
          style={[
            {
              backgroundColor: 'rgba(0,0,0,0.5)',
              paddingTop: StatusBarHeight + BannerHeight / 2 + 15,
            },
            tooltipStyle,
          ]}
        >
          <View className="ml-[10%] w-6 h-6 bg-white rotate-45 transform translate-y-5 rounded" />
          <View className="bg-white rounded-lg p-8">
            <Text className="text-lg font-bold mb-2">Syncing with chain</Text>
            <Text className="text-sm">
              The wallet is locally decrypting the private blockchain to find
              your assets and balance. ETA depends on your computing power.
            </Text>
            <View className="flex-row mt-5 items-center justify-start">
              <LeoButton
                label="Ok"
                onPress={onTooltipClose}
                fullWidth={false}
                className="max-w-[54px] mr-[16px]"
              />
              <LeoButton
                label="Learn more"
                type="link"
                onPress={onLearnMorePress}
                fullWidth={false}
                className="max-w-[120px]"
              />
            </View>
          </View>
        </Animated.View>
      ) : null}
    </WrapperView>
  )
}

export default BalancePendingBanner
