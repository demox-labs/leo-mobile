import React, { useCallback } from 'react'
import { useFocusEffect, useRouter } from 'expo-router'
import { Account } from '@src/types/accounts'
import AddressBookScreen from '@src/screens/send-tokens/recipient/address-book'
import useSendStateContext from '@src/hooks/context/useSendStateContext'
import { useAccount, useFilteredContacts } from '@src/lib/aleo/ready'
import { Platform, StatusBar } from 'react-native'

const AddressBookRoute = () => {
  const router = useRouter()
  const aleoAccount = useAccount()
  const { allContacts } = useFilteredContacts()
  const accounts: Account[] = allContacts
    .filter(c => c.address !== aleoAccount.publicKey)
    .map(contact => ({
      id: contact.address,
      name: contact.name,
      address: contact.address,
      isOwn: contact.accountInWallet || false,
    }))

  const { setRecipientAddress } = useSendStateContext()

  const handleAddressPress = useCallback((account: Account) => {
    setRecipientAddress(account.address)
    router.back()
  }, [])

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(
        Platform.OS === 'ios' ? 'light-content' : 'dark-content',
      )
    }, []),
  )

  return (
    <AddressBookScreen
      accounts={accounts}
      onAddressPress={handleAddressPress}
    />
  )
}

export default AddressBookRoute
