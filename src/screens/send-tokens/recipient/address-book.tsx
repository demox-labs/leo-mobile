import React, { useCallback, useMemo } from 'react'
import {
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  StatusBar,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Account } from '@src/types/accounts'
import Icon from '@src/components/icons'
import { Ionicons } from '@expo/vector-icons'
import randomColor from 'randomcolor'
import { useFocusEffect } from 'expo-router'
import EllipsizedAddress from '@src/components/ellipsized-address'

interface AddressBookProps {
  accounts: Account[]
  onAddressPress: (address: Account) => void
}

export const AccountRow: React.FC<{
  account: Account
}> = ({ account }) => {
  const { name, address } = account

  const IconColor = useMemo(() => randomColor({ seed: address }), [])

  return (
    <View className="flex-row mb-2 items-center h-[60px]">
      <Icon name="leo-logo-blue" className="mr-4" size={24} color={IconColor} />
      <View className="w-full">
        <Text
          className="text-sm font-medium max-w-[80%]"
          ellipsizeMode="tail"
          numberOfLines={1}
        >
          {name}
        </Text>
        <View className="flex-row items-center mt-1">
          <EllipsizedAddress address={address} className="text-sm w-[100px]" />
        </View>
      </View>
    </View>
  )
}

const NoContactsYetView = () => (
  <View className="flex-1 items-center justify-center px-4 bg-white">
    <Ionicons name="person-outline" size={40} color="black" className="mb-6" />
    <Text className="text-xl font-bold mb-2">No contacts yet</Text>
    <Text className="text-center text-gray-500 mb-6">
      You have not added any contacts yet.
    </Text>
  </View>
)

const AddressBookScreen: React.FC<AddressBookProps> = ({
  accounts,
  onAddressPress,
}) => {
  // accounts = [] // Uncomment this line to see the no contacts view
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content')
    }, []),
  )

  return (
    <SafeAreaView className="flex-1 bg-white">
      {accounts.length === 0 ? <NoContactsYetView /> : null}
      {accounts.length > 0 ? (
        <ScrollView className="px-4">
          {accounts.map(account => (
            <TouchableOpacity
              key={account.id}
              className="flex-row mb-2 items-center h-[60px]"
              onPress={() => onAddressPress(account)}
            >
              <AccountRow account={account} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : null}
    </SafeAreaView>
  )
}

export default AddressBookScreen
