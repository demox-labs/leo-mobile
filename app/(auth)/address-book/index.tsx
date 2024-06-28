import React, { useCallback } from 'react'
import { useAleoClient } from '@src/lib/aleo/client'
import { useFilteredContacts } from '@src/lib/aleo/ready'
import SettingsAddressBookScreen from '@src/screens/settings/address-book'
import { useFocusEffect } from 'expo-router'
import { StatusBar } from 'react-native'

const SettingsAddressBookRoute = () => {
  const { updateSettings } = useAleoClient()
  const { contacts, allContacts } = useFilteredContacts()

  const handleDeleteContact = useCallback(
    async (address: string) =>
      await updateSettings({
        contacts: contacts.filter(c => c.address !== address),
      }),
    [contacts, updateSettings],
  )

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content')
    }, []),
  )

  return (
    <SettingsAddressBookScreen
      allContacts={allContacts}
      handleDeleteContact={handleDeleteContact}
    />
  )
}

export default SettingsAddressBookRoute
