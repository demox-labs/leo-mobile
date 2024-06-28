import React, { useMemo, useState } from 'react'
import CreateAccountScreen from '@src/screens/create-account'
import { useAleoClient } from '@src/lib/aleo/client'
import { useAllAccounts } from '@src/lib/aleo/ready'
import { AleoAccountType } from '@src/lib/aleo/types'
import { useRouter } from 'expo-router'

const CreateAccountRoute = () => {
  const { createHDAccount, updateCurrentAccount, loading } = useAleoClient()
  const router = useRouter()
  const allAccounts = useAllAccounts()
  const [isLoading, setIsLoading] = useState(loading)

  const allAccountNames = allAccounts.map(acc => acc.name)

  // Filters out all accounts that are not HD or Imported
  const allHDOrImported = useMemo(
    () =>
      allAccounts.filter(acc =>
        [AleoAccountType.HD, AleoAccountType.Imported].includes(acc.type),
      ),
    [allAccounts],
  )

  // Default name for the new account to be created
  const defaultName = useMemo(
    () => `Account ${allHDOrImported.length + 1}`,
    [allHDOrImported.length],
  )

  const [accountName, setAccountName] = useState(defaultName)
  const isAccountNameInUse = useMemo(
    () => allAccountNames.includes(accountName),
    [allAccountNames, accountName],
  )

  const isAccountNameEmpty = accountName.length === 0
  const isButtonDisabled = isAccountNameEmpty || isAccountNameInUse

  const onNameChange = (name: string) => {
    setAccountName(name)
  }

  const onCreateAccountPress = async () => {
    try {
      setIsLoading(true)

      const newAccount = await createHDAccount(accountName)
      await updateCurrentAccount(newAccount.publicKey)

      router.replace('/home')
    } catch (err) {
      console.log(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CreateAccountScreen
      accountName={accountName}
      isLoading={isLoading}
      isButtonDisabled={isButtonDisabled}
      onNameChange={onNameChange}
      onCreateAccountPress={onCreateAccountPress}
    />
  )
}

export default CreateAccountRoute
