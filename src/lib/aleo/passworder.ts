import {
  secureCellSealWithPassphraseDecrypt64,
  secureCellSealWithPassphraseEncrypt64,
  symmetricKey64,
} from 'react-native-themis'

export interface EncryptedData {
  encrypted64: string
  salt64: string
}

export const encryptString = async (
  value: string,
  password: string,
): Promise<EncryptedData> => {
  try {
    const salt64 = await symmetricKey64()
    const encrypted64 = await secureCellSealWithPassphraseEncrypt64(
      password,
      value,
      salt64,
    )
    return { encrypted64, salt64 }
  } catch (e) {
    console.log('Error encrypting string', e)
    throw e
  }
}

export const decryptString = async (
  data: EncryptedData,
  password: string,
): Promise<string | undefined> => {
  try {
    return await secureCellSealWithPassphraseDecrypt64(
      password,
      data.encrypted64,
      data.salt64,
    )
  } catch (e) {
    console.log('Error decrypting string', e)
    return undefined
  }
}
