import ActivityList from '@src/components/activity-list'
import BalancePendingBanner from '@src/components/home/balance-pending-banner'
import WalletInfo from '@src/components/home/wallet-info'
import LeoToast from '@src/components/leo-toast'
import TokenList from '@src/components/token-list'
import useIsSmallScreen from '@src/hooks/useIsSmallScreen'
import { IActivity } from '@src/types/activities'
import { WalletInfoViewProps } from '@src/types/home'
import { Token } from '@src/types/tokens'
import Constants from 'expo-constants'
import React, { useEffect } from 'react'
import { Pressable, Text, View } from 'react-native'
import Animated, {
  FadeInUp,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

interface HomeScreenProps {
  syncProgress?: number
  walletInfo: WalletInfoViewProps
  tokens: Token[]
  activities: IActivity[]
  isBalanceSyncBannerVisible: boolean
  isTooltipVisible: boolean
  closeTooltip: () => void
  onLearnMorePress: () => void
  onCheckStatusPress: () => void
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  syncProgress,
  walletInfo,
  tokens,
  activities,
  isBalanceSyncBannerVisible,
  isTooltipVisible,
  closeTooltip,
  onLearnMorePress,
  onCheckStatusPress,
}) => {
  const isSmallScreen = useIsSmallScreen()
  const StatusBarHeight = Constants.statusBarHeight
  const BannerHeight = 150
  const BannerPadding = StatusBarHeight + 15
  const diff = BannerHeight - (!isSmallScreen ? 0 : BannerPadding)

  const listHeaderComponentTopMargin = useSharedValue(
    isBalanceSyncBannerVisible ? diff : 0,
  )
  const listHeaderComponentStyle = useAnimatedStyle(() => {
    return {
      marginTop: listHeaderComponentTopMargin.value,
    }
  })

  useEffect(() => {
    listHeaderComponentTopMargin.value = isBalanceSyncBannerVisible
      ? withTiming(diff)
      : withTiming(0)
  }, [isBalanceSyncBannerVisible])

  return (
    <>
      <BalancePendingBanner
        syncProgress={syncProgress}
        isVisible={isBalanceSyncBannerVisible}
        isTooltipVisible={isTooltipVisible}
        closeTooltip={closeTooltip}
        onLearnMorePress={onLearnMorePress}
      />
      <Animated.View
        style={[
          listHeaderComponentStyle,
          {
            flex: 1,
            backgroundColor: 'white',
          },
        ]}
      >
        <ActivityList
          activities={activities}
          className="bg-white"
          display="list"
          ListHeaderComponent={
            <>
              <WalletInfo
                walletInfo={walletInfo}
                isBalanceSyncBannerVisible={isBalanceSyncBannerVisible}
              />
              {walletInfo.chainStatus === 'down' ? (
                <Animated.View
                  className="mx-4 mt-4"
                  entering={FadeInUp}
                  exiting={FadeOutUp}
                >
                  <LeoToast
                    type="danger"
                    message="Due to instability of Aleo Testnet Beta, transactions may fail"
                  >
                    <Text className="text-sm ml-3">
                      Aleo Testnet Beta is down.
                    </Text>
                    <Pressable>
                      <Text
                        className="text-sm text-blue-500 ml-1"
                        onPress={onCheckStatusPress}
                      >
                        Check status
                      </Text>
                    </Pressable>
                  </LeoToast>
                </Animated.View>
              ) : (
                <Animated.View
                  className="mx-4 mt-4"
                  entering={FadeInUp}
                  exiting={FadeOutUp}
                >
                  <LeoToast type="info">
                    <View className="ml-1 flex flex-row items-center">
                      <Text className="flex-shrink text-sm">
                        <Text className="font-semibold">Data Reset. </Text>
                        We want to inform you that all transaction history has
                        been lost due to a recent reset of the Aleo Testnet
                        Beta.{' '}
                        <Text
                          className="text-blue-500"
                          onPress={onLearnMorePress}
                        >
                          Learn more
                        </Text>
                      </Text>
                    </View>
                  </LeoToast>
                </Animated.View>
              )}
              <TokenList tokens={tokens} />
              <Text className="font-bold pl-5 mt-5 text-lg">Activities</Text>
            </>
          }
        />
      </Animated.View>
    </>
  )
}

export default HomeScreen
