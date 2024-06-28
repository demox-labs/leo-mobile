import {
  Text,
  View,
  TouchableOpacity,
  ListRenderItem,
  FlatList,
} from 'react-native'
import React, { useCallback, useMemo } from 'react'

import { Ionicons, Octicons } from '@expo/vector-icons'
import Icon from '@src/components/icons'
import { ActionSheetRef } from 'react-native-actions-sheet'
import { AleoContact } from '@src/lib/aleo/types'
import randomColor from 'randomcolor'
import DeleteContactModal from '@src/components/settings/delete-contact-modal'
import EllipsizedAddress from '@src/components/ellipsized-address'

const NoContactsYetView = () => (
  <View className="flex-1 items-center justify-center px-4 bg-white">
    <Ionicons name="person-outline" size={40} color="black" className="mb-6" />
    <Text className="text-xl font-bold mb-2">No contacts yet</Text>
    <Text className="text-center text-gray-500 mb-6">
      You have not added any contacts yet.
    </Text>
  </View>
)

export const AccountRow: React.FC<{
  account: AleoContact
  handleDeleteContact: (accountId: string) => void
}> = ({ account, handleDeleteContact }) => {
  const deleteContactModalRef = React.useRef<ActionSheetRef>(null)

  const IconColor = useMemo(() => randomColor({ seed: account.address }), [])

  return (
    <View className="w-full pr-3 flex-row mb-2 items-center justify-center h-[60px]">
      <Icon name="leo-logo-blue" className="mr-4" size={30} color={IconColor} />
      <View className="flex-1">
        <Text
          className="text-sm font-medium max-w-[80%]"
          ellipsizeMode="tail"
          numberOfLines={1}
        >
          {account.name}
        </Text>
        <View className="flex-row items-center">
          <EllipsizedAddress
            address={account.address}
            className="text-sm w-[100px]"
          />
        </View>
      </View>
      <View>
        {account.accountInWallet ? (
          <View className="py-2 px-3 bg-gray-100 rounded-full">
            <Text className="font-semibold">Own</Text>
          </View>
        ) : (
          <TouchableOpacity
            className="pr-4"
            onPress={() => deleteContactModalRef.current?.show()}
          >
            <Octicons name="x" size={24} color="black" />
          </TouchableOpacity>
        )}
      </View>

      <DeleteContactModal
        ref={deleteContactModalRef}
        onDeleteContact={() => handleDeleteContact(account.address)}
      />
    </View>
  )
}

interface SettingsAddressBookScreenProps {
  allContacts: AleoContact[]
  handleDeleteContact: (address: string) => void
}
const SettingsAddressBookScreen: React.FC<SettingsAddressBookScreenProps> = ({
  allContacts,
  handleDeleteContact,
}) => {
  const renderItem = useCallback<ListRenderItem<AleoContact>>(
    ({ item }) => (
      <AccountRow account={item} handleDeleteContact={handleDeleteContact} />
    ),
    [handleDeleteContact],
  )

  const keyExtractor = useCallback((item: AleoContact) => item.address, [])

  return (
    <View className="flex-1 bg-white">
      {allContacts.length === 0 ? <NoContactsYetView /> : null}
      {allContacts.length > 0 ? (
        <FlatList
          className="flex-1 px-4"
          contentContainerStyle={{
            paddingBottom: 32,
          }}
          data={allContacts}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
        />
      ) : null}
    </View>
  )
}

export default SettingsAddressBookScreen
