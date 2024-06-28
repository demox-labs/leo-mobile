import React, { useState } from 'react'
import Clipboard from '@react-native-clipboard/clipboard'
import ImportAccountScreen from '@src/screens/import-account'
import { useAleoClient } from '@src/lib/aleo/client'
import { useRouter } from 'expo-router'

const ImportAccountRoute = () => {
  const router = useRouter()
  const { importAccount, updateCurrentAccount, loading } = useAleoClient()
  const [privateKey, setPrivateKey] = useState('')
  const [errorMessage, setIsErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(loading)

  const onPrivateKeyChange = (privateKey: string) => {
    setPrivateKey(privateKey)
  }

  const onImportAccountPress = async () => {
    try {
      setIsLoading(true)
      setIsErrorMessage(null)

      Clipboard.setString('')

      const account = await importAccount(privateKey.replace(/\s/g, ''))
      await updateCurrentAccount(account.publicKey)

      router.replace('/home')
    } catch (err: any) {
      setIsErrorMessage(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ImportAccountScreen
      privateKey={privateKey}
      errorMessage={errorMessage}
      isLoading={isLoading}
      onPrivateKeyChange={onPrivateKeyChange}
      onImportAccountPress={onImportAccountPress}
    />
  )
}

export default ImportAccountRoute
