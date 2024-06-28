import { useEffect } from 'react'
import { initializeDatabase, databaseExists } from '@src/lib/aleo/db/setup'
import { DowngradeError } from '@src/lib/aleo/db/SQLiteClient'
import { init } from '@src/lib/aleo/client'
import { clearKeychainStorage } from '@src/lib/aleo/safe-storage'
import useConditionalBackNavigation from './useConditionalBackNavigation'

const useAppInitialization = () => {
  useConditionalBackNavigation(['/home'])

  const performDBInitialization = async () => {
    try {
      await initializeDatabase()
    } catch (err) {
      if (err instanceof DowngradeError) {
        console.error('Downgrade error')
      } else {
        console.error(`Unexpected error: ${err}`)
      }
    }
  }

  const performClientInitialization = async () => init()

  const performAppInstallationChecks = async () => {
    const isFreshAppInstall = (await databaseExists()) === false

    if (isFreshAppInstall) {
      clearKeychainStorage()
    }
  }

  const initializeApp = async () => {
    await performAppInstallationChecks()
    await performDBInitialization()
    await performClientInitialization()
  }

  useEffect(() => {
    initializeApp()
  }, [])
}

export default useAppInitialization
