import React, { useCallback, useMemo } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ListRenderItem,
} from 'react-native'
import Icon from '@src/components/icons'
import LeoButton from '@src/components/leo-button'
import { AleoAccount } from '@src/lib/aleo/types'
import randomColor from 'randomcolor'

interface AccountsScreenProps {
  currentAccountAddress: string
  accounts: AleoAccount[]
  onImportAccountPress: () => void
  onCreateAccountPress: () => void
  onAccountPress: (accountAddress: string) => void
}

export type AccountRowProps = {
  account: AleoAccount
  isCurrentAccount: boolean
  handleAccountPress?: (accountAddress: string) => void
}

export const AccountRow: React.FC<AccountRowProps> = ({
  account,
  isCurrentAccount,
  handleAccountPress,
}: AccountRowProps) => {
  const iconColor = useMemo(
    () => randomColor({ seed: account.publicKey }),
    [account.publicKey],
  )

  return (
    <TouchableOpacity
      className="flex-row mb-2 items-center h-[60px]"
      onPress={() => handleAccountPress?.(account.publicKey)}
    >
      <Icon name="leo-logo-blue" className="mr-4" color={iconColor} />
      <View className="w-full">
        <Text
          className="text-sm font-medium max-w-[80%]"
          ellipsizeMode="tail"
          numberOfLines={1}
        >
          {account.name}
        </Text>
      </View>
      {isCurrentAccount ? (
        <Icon name="checkbox-circle-fill" className="ml-auto" />
      ) : null}
    </TouchableOpacity>
  )
}

const AccountsScreen: React.FC<AccountsScreenProps> = ({
  currentAccountAddress,
  accounts,
  onImportAccountPress,
  onCreateAccountPress,
  onAccountPress,
}: AccountsScreenProps) => {
  const renderItem = useCallback<ListRenderItem<AleoAccount>>(
    ({ item }) => (
      <AccountRow
        account={item}
        isCurrentAccount={item.publicKey === currentAccountAddress}
        handleAccountPress={onAccountPress}
      />
    ),
    [currentAccountAddress, onAccountPress],
  )

  const keyExtractor = useCallback((item: AleoAccount) => item.publicKey, [])

  return (
    <View className="flex-1 justify-center p-5 bg-white">
      <FlatList
        className="flex-1 px-2 mb-auto"
        data={accounts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
      />
      <View className="flex-row gap-2 mb-5">
        <LeoButton
          fullWidth={false}
          label="Import"
          type="secondary"
          onPress={onImportAccountPress}
        />
        <LeoButton
          fullWidth={false}
          label="Create"
          type="secondary"
          onPress={onCreateAccountPress}
        />
      </View>
    </View>
  )
}

export default AccountsScreen
