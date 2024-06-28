import React, { useCallback } from 'react'
import { Stack, useFocusEffect, useNavigation, useRouter } from 'expo-router'
import { AleoStatus, useAleoClient } from '@src/lib/aleo'

import customHeaderOptions from '@src/components/navigation/custom-header-options'
import { BackButton } from '@src/components/navigation/back-button'
import { DismissButton } from '@src/components/navigation/dismiss-button'
import { useDeepLinking } from '@src/hooks/useDeepLinking'
import { parse } from 'expo-linking'
import { sanitizeDeepLink } from '@src/utils/strings'

export default function Root() {
  const navigation = useNavigation()
  const { data } = useAleoClient()
  const router = useRouter()
  const { deepLink } = useDeepLinking()

  useFocusEffect(
    useCallback(() => {
      if (data.status !== AleoStatus.Ready) {
        router.replace('/')
      }

      if (deepLink) {
        try {
          const parsedUrl = parse(sanitizeDeepLink(deepLink))

          setTimeout(() => {
            if (!parsedUrl.path || !parsedUrl.queryParams) {
              return
            }

            router.navigate({
              pathname: parsedUrl.path,
              params: parsedUrl.queryParams,
            })
          }, 1000)
        } catch (error) {
          console.error(error)
        }
      }
    }, [data, deepLink]),
  )

  // This layout can be deferred because it's not the root layout.
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        headerTitleStyle: {
          fontSize: 20,
        },
      }}
    >
      <Stack.Screen
        name="accounts"
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="receive"
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="select-transaction-type"
        options={{
          ...customHeaderOptions({
            navigation,
          }),
          headerBackVisible: false,
          headerLeft: () => null,
          // Uncomment when the info screen is ready
          // headerRight: () => (
          //   <TouchableOpacity onPress={() => {}}>
          //     <Ionicons
          //       name="information-circle-outline"
          //       size={30}
          //       color="black"
          //     />
          //   </TouchableOpacity>
          // ),
        }}
      />
      <Stack.Screen
        name="biometric-auth-enroll"
        options={{
          presentation: 'formSheet',
        }}
      />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="buy-tokens" options={{ presentation: 'modal' }} />
      <Stack.Screen name="send-tokens" options={{}} />

      <Stack.Screen name="stake" />
      <Stack.Screen
        name="faucet"
        options={{
          presentation: 'modal',
          headerShown: true,
          title: 'Faucet',
          headerBackVisible: false,
          headerRight: () => <DismissButton onPress={router.back} />,
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="general"
        options={{
          title: 'General',
          headerLeft: () => <BackButton onPress={router.back} />,
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="address-book"
        options={{
          title: 'Address Book',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="account-name"
        options={{
          title: 'Account Name',
          headerLeft: () => <BackButton onPress={router.back} />,
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="account-settings"
        options={{
          title: 'Account Settings',
          headerLeft: () => <BackButton onPress={router.back} />,
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="reveal-view-key"
        options={{
          title: 'Reveal View Key',
          headerLeft: () => <BackButton onPress={router.back} />,
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="reveal-private-key"
        options={{
          title: 'Reveal Private Key',
          headerLeft: () => <BackButton onPress={router.back} />,
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="reveal-seed-phrase"
        options={{
          title: 'Reveal Seed Phrase',
          headerLeft: () => <BackButton onPress={router.back} />,
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="advanced"
        options={{
          title: 'Advanced',
          headerLeft: () => <BackButton onPress={router.back} />,
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="networks"
        options={{
          title: 'Networks',
          headerLeft: () => <BackButton onPress={router.back} />,
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="about"
        options={{
          title: 'About',
          headerLeft: () => <BackButton onPress={router.back} />,
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="remove-account"
        options={{
          title: 'Remove Account',
          headerLeft: () => <BackButton onPress={router.back} />,
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="browser-tabs"
        options={{
          title: 'Tabs',
          headerLeft: () => <BackButton onPress={router.back} />,
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="transaction-initiated"
        options={{
          title: ' ',
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="activity-details"
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="qr-code-scanner"
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </Stack>
  )
}
