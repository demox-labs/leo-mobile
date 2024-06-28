import React, { useCallback, useState } from 'react'
import { AleoContact } from '@src/lib/aleo/types'
import { useAleoClient } from '@src/lib/aleo/client'
import { useFilteredContacts } from '@src/lib/aleo/ready'
import AddContactScreen from '@src/screens/settings/address-book/add-contact'
import { router, useFocusEffect } from 'expo-router'
import { Platform, StatusBar } from 'react-native'

const AddContactRoute = () => {
  const { updateSettings, loading } = useAleoClient()
  const { contacts, allContacts } = useFilteredContacts()

  const [address, setAddress] = useState('')
  const [name, setName] = useState('')

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(
        Platform.OS === 'ios' ? 'light-content' : 'dark-content',
      )
    }, []),
  )

  const isButtonDisabled = !address || !name

  const handleAddContact = async () => {
    if (!address || !name) return

    const contact = {
      name: name,
      address: address,
      addedAt: Date.now(),
      accountInWallet: false,
    } as AleoContact

    if (allContacts.some(c => c.address === contact.address)) {
      throw new Error('Contact with the same address already exists')
    }

    await updateSettings({
      contacts: [contact, ...contacts],
    })

    router.back()
  }

  return (
    <AddContactScreen
      name={name}
      address={address}
      isButtonDisabled={isButtonDisabled}
      isLoading={loading}
      onChangeName={setName}
      onChangeAddress={setAddress}
      onAddContact={handleAddContact}
    />
  )
}

export default AddContactRoute
