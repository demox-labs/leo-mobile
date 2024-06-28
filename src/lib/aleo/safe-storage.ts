/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Keychain from 'react-native-keychain'
import { sha256 } from 'react-native-sha256'
import { EncryptedData, encryptString, decryptString } from './passworder'

const APP_IDENTIFIER = 'com.demoxlabs.leowallet'

/*
  Checks if a value is stored for the given storage key.
*/
export async function isStored(key: string) {
  const hashedKey = await sha256(key)
  const credentials = await Keychain.getGenericPassword({
    service: `${APP_IDENTIFIER}/${hashedKey}`,
  })

  return credentials !== false
}

/*
  Encrypts multiple items and saves them to keychain storage.
*/
export async function encryptAndSaveMany(
  items: [string, any][],
  hashedPassword: string,
) {
  await Promise.all(
    items.map(async ([key, value]) => {
      const hashedKey = await sha256(key)
      const encryptedStuff = await encryptString(value, hashedPassword)

      const result = await Keychain.setGenericPassword(
        hashedKey,
        JSON.stringify(encryptedStuff),
        {
          service: `${APP_IDENTIFIER}/${hashedKey}`,
        },
      )

      if (result === false) {
        throw new Error('Failed to save sensitive data')
      }
    }),
  )
}

/*
  Fetches and decrypts a single item from keychain storage.
*/
export async function fetchAndDecryptOne<T>(
  key: string,
  hashedPassword: string,
) {
  const hashedKey = await sha256(key)
  const credentials = await Keychain.getGenericPassword({
    service: `${APP_IDENTIFIER}/${hashedKey}`,
  })

  if (credentials === false) {
    throw new Error('Failed to fetch sensitive data')
  }

  // Remove all possible control bytes from the credentals.password
  // Patch fix for pixel devices
  const encryptedValue = JSON.parse(
    // eslint-disable-next-line no-control-regex
    credentials.password.replace(/[\u0000-\u001F\u007F-\u009F]/g, ''),
  ) as EncryptedData
  const decryptedValue = await decryptString(encryptedValue, hashedPassword)

  if (decryptedValue === undefined) {
    throw new Error('Failed to decrypt sensitive data')
  }

  try {
    const parsed = JSON.parse(decryptedValue) as T
    return parsed
  } catch (error) {
    return decryptedValue as T
  }
}

export async function removeMany(keys: string[]) {
  await Promise.all(
    keys.map(async key => {
      const hashedKey = await sha256(key)
      const result = await Keychain.resetGenericPassword({
        service: `${APP_IDENTIFIER}/${hashedKey}`,
      })

      if (result === false) {
        throw new Error('Failed to remove sensitive data')
      }
    }),
  )
}

/*
  Removes all existing items from keychain storage.
*/
export async function clearKeychainStorage() {
  const keysToDelete = await Keychain.getAllGenericPasswordServices()
  try {
    for (const key of keysToDelete) {
      await Keychain.resetGenericPassword({ service: key })
    }
  } catch (error) {
    console.error('Error clearing keychain items:', error)
  }
}

export async function storeUserPassword(password: string) {
  await Keychain.setGenericPassword('userPassword', password, {
    service: `${APP_IDENTIFIER}/userPassword`,
  })
}

export async function fetchUserPassword() {
  const credentials = await Keychain.getGenericPassword({
    service: `${APP_IDENTIFIER}/userPassword`,
  })

  if (credentials === false) {
    throw new Error('Failed to fetch user password')
  }

  return credentials.password
}

export async function setBiometricAuthEnabled(enabled: boolean) {
  await Keychain.setGenericPassword('biometricAuthEnabled', `${enabled}`, {
    service: `${APP_IDENTIFIER}/biometricAuthEnabled`,
  })
}

export async function fetchBiometricAuthEnabled() {
  const credentials = await Keychain.getGenericPassword({
    service: `${APP_IDENTIFIER}/biometricAuthEnabled`,
  })

  return credentials && credentials.password === 'true'
}
