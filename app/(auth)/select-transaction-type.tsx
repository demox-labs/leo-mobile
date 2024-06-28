import React, { useState } from 'react'
import { router } from 'expo-router'
import SelectTransactionTypeScreen from '@src/screens/onboarding/select-transaction-type'
import useSettingsStore from '@src/state/zustand/settings'

const SelectTransactionTypeRoute = () => {
  const { setIsDelegateTransactionsByDefaultEnabled } = useSettingsStore()
  const [selectedTransactionType, setSelectedTransactionType] = useState<
    'delegate' | 'local'
  >('delegate')

  const onContinuePress = () => {
    setIsDelegateTransactionsByDefaultEnabled(
      selectedTransactionType === 'delegate',
    )
    router.replace('/auth/get-started')
  }

  const onSelectTransactionType = (transactionType: 'delegate' | 'local') => {
    setSelectedTransactionType(transactionType)
  }

  return (
    <SelectTransactionTypeScreen
      selectedTransaction={selectedTransactionType}
      onContinuePress={onContinuePress}
      onSelectTransactionType={onSelectTransactionType}
    />
  )
}

export default SelectTransactionTypeRoute
