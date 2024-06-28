import SettingsAuthorizedDapps from '@src/screens/settings/authorized-dapps'
import React, { useCallback, useEffect, useState } from 'react'
import { useAccount } from '@src/lib/aleo/ready'
import { DAppInfo } from '@src/types/settings'
import { processDApp } from '@src/lib/aleo/dapp/client'
import { AleoDAppMessageType } from 'leo-wallet-window/src'
import { getDecryptLabel } from '@src/utils/strings'
import { AleoDAppSession } from '@src/lib/aleo'
import { cleanDApps, getAllDApps } from '@src/lib/aleo/dapp/dapp'
import { getData, setData } from '@src/utils/storage'
import { appsInfo } from '@src/constants/apps'

const getDAppImage = (origin: string) => {
  const appInfo = appsInfo.find(app => app.url?.includes(origin))

  return appInfo?.image || ''
}

const AuthorizedDapps = () => {
  const account = useAccount()
  const [dapps, setDapps] = useState<DAppInfo[]>([])
  const [allowInteraction, setAllowInteraction] = useState(true)

  const getDapps = useCallback(() => {
    getAllDApps().then(dapps => {
      const allDAppSessions = Object.entries(dapps!)
      const dAppSessions: Record<string, AleoDAppSession> = {}

      allDAppSessions.forEach(([origin, sessions]) => {
        const session = sessions.find(
          sess => sess.publicKey === account.publicKey,
        )
        if (session) dAppSessions[origin] = session
      })

      // Serialize dAppSessions to DAppInfo format
      const appInfos: DAppInfo[] = Object.entries(dAppSessions).map(
        ([origin, session]) => ({
          name: session.appMeta.name,
          origin,
          account: account.publicKey,
          network: session.network,
          decryptPermission: getDecryptLabel(session.decryptPermission),
          image: getDAppImage(origin),
        }),
      )

      setDapps(appInfos)

      if (appInfos.length > 0) setAllowInteraction(true)
    })
  }, [])

  const handleDisconnect = (origin: string) => {
    processDApp(origin, { type: AleoDAppMessageType.DisconnectRequest }).then(
      () => getDapps(),
    )
  }

  const handleInteractionToggle = (isEnabled: boolean) => {
    setAllowInteraction(isEnabled)

    if (!isEnabled) {
      cleanDApps().then(() => getDapps())
    }
  }

  useEffect(() => {
    getData('allowDAppsInteraction').then(value => {
      if (value !== null) setAllowInteraction(!!value)
    })
    getDapps()
  }, [])

  useEffect(() => {
    setData('allowDAppsInteraction', allowInteraction)
  }, [allowInteraction])

  return (
    <SettingsAuthorizedDapps
      dapps={dapps}
      allowInteraction={allowInteraction}
      handleDisconnect={handleDisconnect}
      handleInteractionToggle={handleInteractionToggle}
    />
  )
}

export default AuthorizedDapps
