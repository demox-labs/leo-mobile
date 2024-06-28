import EllipsizedAddress from '@src/components/ellipsized-address'
import Header from '@src/components/header'
import Icon from '@src/components/icons'
import LeoButton from '@src/components/leo-button'
import OptionSwitchItem from '@src/components/settings/option-item'

import { DAppInfo } from '@src/types/settings'

import React, { useMemo } from 'react'

import {
  View,
  Text,
  ScrollView,
  Image,
  ImageSourcePropType,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface AuthorizedDappsState {
  dapps: DAppInfo[]
  handleDisconnect: (origin: string) => void
  handleInteractionToggle: (isEnabled: boolean) => void
  allowInteraction: boolean
}

const SettingsAuthorizedDapps: React.FC<AuthorizedDappsState> = ({
  dapps,
  handleDisconnect,
  allowInteraction,
  handleInteractionToggle,
}) => {
  const toggleOption = useMemo(
    () => ({
      title: 'DApps Interaction',
      description: `Click on the checkmark to ${
        allowInteraction ? 'disable' : 'enable'
      } DApps interaction feature`,
      isEnabled: allowInteraction,
    }),
    [allowInteraction],
  )

  return (
    <SafeAreaView className={'flex-1 px-5 bg-white'}>
      <Header title="Authorized DApps" />
      <ScrollView className="flex-1 ">
        <View>
          <OptionSwitchItem
            {...toggleOption}
            handleToggle={handleInteractionToggle}
          />
        </View>

        <View>
          <View className={'flex-row items-center py-2 mt-4'}>
            <View className={'flex-1 pr-5'}>
              <Text className={'text-lg font-semibold '}>
                Connected Apps ({dapps.length})
              </Text>
              <Text className={'text-sm mt-2'}>
                Apps you connect to through the Leo wallet in this browser will
                show up here.
              </Text>
            </View>
          </View>
          {dapps.map((app, i) => (
            <AppItem
              key={i}
              appInfo={app}
              handleDisconnect={() => handleDisconnect(app.origin)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

interface AppItemProps {
  appInfo: DAppInfo
  handleDisconnect: () => void
}

const AppItem: React.FC<AppItemProps> = ({ appInfo, handleDisconnect }) => {
  return (
    <View className={'p-5 mt-4 border border-gray-200 rounded-lg'}>
      <View className={'flex-row items-center'}>
        {appInfo.image ? (
          <Image
            source={appInfo.image as ImageSourcePropType}
            height={10}
            width={10}
            className="w-[50px] h-[50px] rounded-lg"
          />
        ) : (
          <Icon name="demo-aleo" size={40} />
        )}

        <View className="ml-3">
          <Text className={'text-lg font-semibold'}>{appInfo.name}</Text>
          <Text className={'text-lg color-blue-600'} onPress={handleDisconnect}>
            Disconnect
          </Text>
        </View>
      </View>

      <View className="mt-3">
        <View className="flex-row w-full">
          <Text className={'text-base color-gray-600 w-1/2'}>Origin</Text>
          <Text className={'text-base'}>{appInfo.origin}</Text>
        </View>
        <View className="flex-row w-full">
          <Text className={'text-base color-gray-600 w-1/2'}>Network</Text>
          <Text className={'text-base'}>{appInfo.network}</Text>
        </View>
        <View className="flex-row w-full">
          <Text className={'text-base color-gray-600 w-1/2'}>Account</Text>
          <EllipsizedAddress
            address={appInfo.account}
            className="text-base w-[150px]"
          />
        </View>
        <View className="flex-row w-full">
          <Text className={'text-base color-gray-600 w-1/2'}>
            Decrypt Permission
          </Text>
          <Text className={'text-base'}>{appInfo.decryptPermission}</Text>
        </View>
      </View>

      <LeoButton
        type="secondary"
        label="Disconnect"
        className="mt-5"
        onPress={handleDisconnect}
      />
    </View>
  )
}

export default SettingsAuthorizedDapps
