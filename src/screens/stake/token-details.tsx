import ActivityList from '@src/components/activity-list'
import Icon from '@src/components/icons'
import LeoToast from '@src/components/leo-toast'
// import StakingButton from '@src/components/stake/staking-button'
import TokenInfo from '@src/components/stake/token-info'

import { IActivity } from '@src/types/activities'
import { TokenInfoData } from '@src/types/home'

import React from 'react'
import { View, Text } from 'react-native'

export type TokenScreenHandlers = {
  onSendPress: () => void
  onReceivePress: () => void
  onConvertPress: () => void
  onStakePress: (hasStaked: boolean) => void
}

interface TokenDetailsScreenProps {
  tokenInfo: TokenInfoData
  activities: IActivity[]
  handlers: TokenScreenHandlers
}

const TokenDetailsScreen: React.FC<TokenDetailsScreenProps> = ({
  tokenInfo,
  activities,
  handlers,
}) => {
  return (
    <View className="flex-1 ">
      <ActivityList
        activities={activities}
        display="list"
        topBackgroundColor="bg-primary-50"
        bottomBackgroundColor="bg-white"
        ListHeaderComponent={
          <>
            <View className="bg-white">
              <TokenInfo
                tokenInfo={tokenInfo}
                useSafeAreaView={true}
                handlers={handlers}
              />
            </View>
            {/* <StakingButton
              name={tokenInfo.name}
              onPress={handlers.onStakePress}
            /> */}
            <View className=" bg-white pt-5">
              <LeoToast
                type="info"
                message="Staking is not available on this network"
                containerStyle="mx-4 items-center"
                icon={
                  <View className="bg-black rounded-full p-2 w-[32px] h-[32px]">
                    <Icon name="coins" />
                  </View>
                }
              >
                <View className="ml-2">
                  <View className="flex-row items-center w-full">
                    <Text className="text-base">Stake earning ALEO</Text>
                    <Text className="text-base ml-auto mr-[48px]">17.48%</Text>
                  </View>
                  <Text className="text-gray-700">
                    Stake tokens and earn rewards
                  </Text>
                </View>
              </LeoToast>
              <View>
                <Text className="ml-4 mt-5 mb-2 font-bold text-lg">
                  About Leo
                </Text>
                <View className="flex-row justify-between mx-4">
                  <Text className="text-lg text-gray-600">Token Name</Text>
                  <Text className="text-lg">Aleo (ALEO)</Text>
                </View>
              </View>
              <Text className="ml-4 mt-5 mb-2 font-bold text-lg">
                Activities
              </Text>
            </View>
          </>
        }
      />
    </View>
  )
}

export default TokenDetailsScreen
