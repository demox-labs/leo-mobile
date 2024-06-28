import React from 'react'

import { Stack, router } from 'expo-router'
import { TouchableOpacity } from 'react-native'
import Icon from '@src/components/icons'
import { Ionicons } from '@expo/vector-icons'

const AddressBookLayout = () => {
  const navigateToAddContactScreen = () => {
    router.push('/address-book/add-contact')
  }

  const addressBookHeaderLeft = () => (
    <TouchableOpacity onPress={() => router.back()}>
      <Icon name="arrow-left" size={24} />
    </TouchableOpacity>
  )

  const addressBookHeaderRight = () => (
    <TouchableOpacity onPress={navigateToAddContactScreen}>
      <Ionicons name="add-circle-outline" size={24} color="black" />
    </TouchableOpacity>
  )

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerTitleStyle: {
          fontSize: 20,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Address Book',
          headerTitleAlign: 'center',
          headerLeft: addressBookHeaderLeft,
          headerRight: addressBookHeaderRight,
        }}
      />
      <Stack.Screen
        name="add-contact"
        options={{
          presentation: 'formSheet',
          title: 'Add Contact',
        }}
      />
    </Stack>
  )
}

export default AddressBookLayout
