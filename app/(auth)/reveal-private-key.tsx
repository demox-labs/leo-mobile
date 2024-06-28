import React from 'react'
import SettingsRevealKey from '@src/screens/settings/reveal-key'
import { useAleoClient } from '@src/lib/aleo/client'
import { useAccount } from '@src/lib/aleo/ready'

const RevealPrivateKey = () => {
  const { revealPrivateKey } = useAleoClient()
  const account = useAccount()

  return (
    <SettingsRevealKey
      accountName={account.name}
      accountAddress={account.publicKey}
      keyType="private"
      handleRevealSecretInfo={revealPrivateKey}
    />
  )
}

export default RevealPrivateKey
