import React, { useEffect, useState } from 'react'

import { useAleoClient } from '@src/lib/aleo/client'
import { useAccount } from '@src/lib/aleo/ready'
import SettingsAccountNameScreen from '@src/screens/settings/account-name'

const SettingsAccountNameRoute = () => {
  const { editAccountName } = useAleoClient()
  const account = useAccount()

  const [accountName, setAccountName] = useState(account.name)
  const [isSuccess, setIsSuccess] = useState<boolean>()
  const [helpMessage, setHelpMessage] = useState<string>()
  const isButtonDisabled = accountName === account.name || accountName === ''

  const onChangeAccountName = (name: string) => {
    setAccountName(name)
  }

  const handleEditAccountNamePress = async () => {
    try {
      await editAccountName(account.publicKey, accountName)
      setIsSuccess(true)
      setHelpMessage('Account name updated')
    } catch (error: any) {
      setIsSuccess(false)
      setHelpMessage(error?.message as string)
    }
  }

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        setIsSuccess(undefined)
        setHelpMessage(undefined)
      }, 2000)
    }
  }, [isSuccess])

  return (
    <SettingsAccountNameScreen
      accountName={accountName}
      onChangeAccountName={onChangeAccountName}
      isSaveButtonDisabeld={isButtonDisabled}
      onSavePress={handleEditAccountNamePress}
      isSuccess={isSuccess}
      helpMessage={helpMessage}
    />
  )
}

export default SettingsAccountNameRoute
