/* eslint-disable @typescript-eslint/no-explicit-any */
import 'react-native-get-random-values' // polyfill for crypto.getRandomValues for bip39
import * as Bip39 from 'bip39'

import { Buffer } from '@craftzdog/react-native-buffer'
import { sha256 } from 'react-native-sha256'
import {
  encryptAndSaveMany,
  fetchAndDecryptOne,
  isStored,
  removeMany,
} from './safe-storage'
import { AleoAccount, AleoAccountType, AleoSettings } from './types'
import { derivePath } from '../../utils/cryptoUtil'
import { getData, setData } from '@src/utils/storage'
import {
  authorizeTransaction,
  decryptCiphertext,
  decryptRecord,
  fromSeedUnchecked,
  privateKeyIsValid,
  privateKeyToAddress,
  privateKeyToViewKey,
  sign,
  verify,
} from 'modules/leo-sdk-module'
import { TextEncoder } from 'text-encoding'

const STORAGE_KEY_PREFIX = 'vault'
const DEFAULT_SETTINGS: AleoSettings = {}

enum StorageEntity {
  Check = 'check',
  MigrationLevel = 'migration',
  Mnemonic = 'mnemonic',
  AccPrivKey = 'accprivkey',
  AccPubKey = 'accpubkey',
  AccViewKey = 'accviewkey',
  CurrentAccPubKey = 'curraccpubkey',
  Accounts = 'accounts',
  Settings = 'settings',
  OwnMnemonic = 'ownmnemonic',
  LegacyMigrationLevel = 'mgrnlvl',
  Password = 'password',
}

const checkStrgKey = createStorageKey(StorageEntity.Check)
const mnemonicStrgKey = createStorageKey(StorageEntity.Mnemonic)
const accPrivKeyStrgKey = createDynamicStorageKey(StorageEntity.AccPrivKey)
const accPubKeyStrgKey = createDynamicStorageKey(StorageEntity.AccPubKey)
const accViewKeyStrgKey = createDynamicStorageKey(StorageEntity.AccViewKey)
const currentAccPubKeyStrgKey = createStorageKey(StorageEntity.CurrentAccPubKey)
const accountsStrgKey = createStorageKey(StorageEntity.Accounts)
const settingsStrgKey = createStorageKey(StorageEntity.Settings)
const ownMnemonicStrgKey = createStorageKey(StorageEntity.OwnMnemonic)

export class Vault {
  constructor(private hashedPassword: string) {}

  // Check if vault exists by checking if check key is stored
  static async isExist() {
    const stored = await isStored(checkStrgKey)
    return stored
  }

  // Setup vault by checking to see if the check key can be decrypted with the password
  // TODO add withError
  static async setup(password: string) {
    const hashedPassword = await Vault.toValidPassKey(password)
    return new Vault(hashedPassword)
  }

  // TODO add withError
  static async spawn(
    password: string,
    mnemonic?: string,
    ownMnemonic?: boolean,
  ) {
    if (!mnemonic) {
      mnemonic = Bip39.generateMnemonic(128)
    }
    // Need to convert the Buffer returned from Bip39 to a buffer that the
    // react-native-quick-crypto library can use
    const seed = Bip39.mnemonicToSeedSync(mnemonic)
    const seedAsReactNativeBuffer = Buffer.from(seed)

    const hdAccIndex = 0
    const accPrivateKey = await seedToHDPrivateKey(
      seedAsReactNativeBuffer,
      hdAccIndex,
    )
    const [accPublicKey, accViewKey] =
      await getPublicKeyAndViewKey(accPrivateKey)

    const initialAccount: AleoAccount = {
      type: AleoAccountType.HD,
      name: 'Account 1',
      publicKey: accPublicKey,
      viewKey: accViewKey,
      privateKey: accPrivateKey,
      hdIndex: hdAccIndex,
    }
    const newAccounts = [initialAccount]
    const hashedPassword = await sha256(password)

    await encryptAndSaveMany(
      [
        [checkStrgKey, generateCheck()],
        [mnemonicStrgKey, mnemonic],
        [accPrivKeyStrgKey(accPublicKey), accPrivateKey],
        [accPubKeyStrgKey(accPublicKey), accPublicKey],
        [accViewKeyStrgKey(accPublicKey), accViewKey],
        [accountsStrgKey, JSON.stringify(newAccounts)],
      ],
      hashedPassword,
    )
    await setData(currentAccPubKeyStrgKey, accPublicKey)
    await setData(ownMnemonicStrgKey, ownMnemonic ?? false)
  }

  // Decrypts the check key with the password to check if the password is valid.
  private static async toValidPassKey(password: string) {
    // TODO add withError
    const hashedPassword = await sha256(password)
    try {
      await fetchAndDecryptOne<any>(checkStrgKey, hashedPassword)
    } catch (err: any) {
      throw new Error('Invalid password')
    }
    return hashedPassword
  }

  /*
    Methods for handling account creation, editing, and deletion.
  */
  async createHDAccount(
    name?: string,
    hdAccIndex?: number,
  ): Promise<AleoAccount[]> {
    return withError('Failed to create account', async () => {
      const [mnemonic, allAccounts] = await Promise.all([
        fetchAndDecryptOne<string>(mnemonicStrgKey, this.hashedPassword),
        this.fetchAccounts(),
      ])

      // Need to convert the Buffer returned from Bip39 to a buffer that the
      // react-native-quick-crypto library can use
      const seed = Bip39.mnemonicToSeedSync(mnemonic)
      const seedAsReactNativeBuffer = Buffer.from(seed)

      if (!hdAccIndex) {
        const allHDAccounts = allAccounts.filter(
          a => a.type === AleoAccountType.HD,
        )
        hdAccIndex = allHDAccounts.length
      }

      const accPrivateKey = await seedToHDPrivateKey(
        seedAsReactNativeBuffer,
        hdAccIndex,
      )
      const [accPublicKey, accViewKey] =
        await getPublicKeyAndViewKey(accPrivateKey)

      const accName = name || `Account ${allAccounts.length + 1}`

      if (allAccounts.some(a => a.publicKey === accPublicKey)) {
        // Create next account if this one already exists
        return this.createHDAccount(accName, hdAccIndex + 1)
      }

      const newAccount: AleoAccount = {
        type: AleoAccountType.HD,
        name: accName,
        publicKey: accPublicKey,
        viewKey: accViewKey,
        privateKey: accPrivateKey,
        hdIndex: hdAccIndex,
      }
      const newAllAccounts = concatAccount(allAccounts, newAccount)

      await encryptAndSaveMany(
        [
          [accPrivKeyStrgKey(accPublicKey), accPrivateKey],
          [accPubKeyStrgKey(accPublicKey), accPublicKey],
          [accViewKeyStrgKey(accPublicKey), accViewKey],
          [accountsStrgKey, JSON.stringify(newAllAccounts)],
        ],
        this.hashedPassword,
      )

      return newAllAccounts
    })
  }

  async importAccount(accPrivateKey: string) {
    const errMessage =
      'Failed to import account.\nThis may happen because provided Key is invalid'

    return withError(errMessage, async () => {
      if (!(await privateKeyIsValid(accPrivateKey))) {
        throw new Error(errMessage)
      }
      const allAccounts = await this.fetchAccounts()
      const [accPublicKey, accViewKey] =
        await getPublicKeyAndViewKey(accPrivateKey)

      const newAccount: AleoAccount = {
        type: AleoAccountType.Imported,
        name: `Account ${allAccounts.length + 1}`,
        publicKey: accPublicKey,
        viewKey: accViewKey,
        privateKey: accPrivateKey,
      }
      const newAllAcounts = concatAccount(allAccounts, newAccount)

      await encryptAndSaveMany(
        [
          [accPrivKeyStrgKey(accPublicKey), accPrivateKey],
          [accPubKeyStrgKey(accPublicKey), accPublicKey],
          [accViewKeyStrgKey(accPublicKey), accViewKey],
          [accountsStrgKey, JSON.stringify(newAllAcounts)],
        ],
        this.hashedPassword,
      )

      return newAllAcounts
    })
  }

  async editAccountName(accPublicKey: string, name: string) {
    return withError('Failed to edit account name', async () => {
      const allAccounts = await this.fetchAccounts()
      if (!allAccounts.some(acc => acc.publicKey === accPublicKey)) {
        throw new Error('Account not found')
      }

      if (
        allAccounts.some(
          acc => acc.publicKey !== accPublicKey && acc.name === name,
        )
      ) {
        throw new Error('Account with same name already exist')
      }

      const newAllAccounts = allAccounts.map(acc =>
        acc.publicKey === accPublicKey ? { ...acc, name } : acc,
      )
      await encryptAndSaveMany(
        [[accountsStrgKey, JSON.stringify(newAllAccounts)]],
        this.hashedPassword,
      )

      const currentAccount = await this.getCurrentAccount()
      return { accounts: newAllAccounts, currentAccount }
    })
  }

  async getCurrentAccount() {
    const currAccountPubkey: string = await getData(currentAccPubKeyStrgKey)
    const allAccounts = await this.fetchAccounts()
    if (allAccounts.length < 1) {
      throw new Error('No accounts created yet.')
    }
    let currentAccount = allAccounts.find(
      acc => acc.publicKey === currAccountPubkey,
    )
    if (!currentAccount) {
      currentAccount = await this.setCurrentAccount(allAccounts[0].publicKey)
    }
    return currentAccount
  }

  async setCurrentAccount(accPublicKey: string) {
    // TODO: add withError
    const allAccounts = await this.fetchAccounts()
    const newCurrentAccount = allAccounts.find(
      acc => acc.publicKey === accPublicKey,
    )
    if (!newCurrentAccount) {
      throw new Error('Account not found')
    }
    await setData(currentAccPubKeyStrgKey, accPublicKey)

    return newCurrentAccount
  }

  static async removeAccount(accPublicKey: string, password: string) {
    const hashedPassword = await Vault.toValidPassKey(password)
    return withError('Failed to remove account', async doThrow => {
      const allAccounts = await fetchAndDecryptOne<AleoAccount[]>(
        accountsStrgKey,
        hashedPassword,
      )
      const acc = allAccounts.find(a => a.publicKey === accPublicKey)
      if (!acc || acc.hdIndex === 0) {
        doThrow()
      }

      const newAllAccounts = allAccounts.filter(
        currentAccount => currentAccount.publicKey !== accPublicKey,
      )
      await encryptAndSaveMany(
        [[accountsStrgKey, JSON.stringify(newAllAccounts)]],
        hashedPassword,
      )

      await removeMany([
        accPrivKeyStrgKey(accPublicKey),
        accViewKeyStrgKey(accPublicKey),
        accPubKeyStrgKey(accPublicKey),
      ])

      return newAllAccounts
    })
  }

  async fetchAccounts() {
    const accounts = await fetchAndDecryptOne<AleoAccount[]>(
      accountsStrgKey,
      this.hashedPassword,
    )
    if (!Array.isArray(accounts)) {
      throw new Error('Accounts not found')
    }
    return accounts
  }

  /*
    Mehods for revealing sensitive data from the vault in the user interface.
  */
  static async revealPrivateKey(accountPublicKey: string, password: string) {
    const hashedPassword = await Vault.toValidPassKey(password)
    return withError('Failed to reveal private key', async () => {
      const privateKey = await fetchAndDecryptOne<string>(
        accPrivKeyStrgKey(accountPublicKey),
        hashedPassword,
      )
      const privateKeyPattern = /APrivateKey[\w\d]{48}/g
      if (!privateKeyPattern.test(privateKey)) {
        throw new Error('Private key does not match the expected pattern')
      }
      return privateKey
    })
  }

  static async revealViewKey(accPublicKey: string, password: string) {
    const hashedPassword = await Vault.toValidPassKey(password)
    return withError('Failed to reveal view key', async () => {
      const viewKey = await fetchAndDecryptOne<string>(
        accViewKeyStrgKey(accPublicKey),
        hashedPassword,
      )
      const viewKeyPattern = /AViewKey[\w\d]{45}/g
      if (!viewKeyPattern.test(viewKey)) {
        throw new Error('View key does not match the expected pattern')
      }
      return viewKey
    })
  }

  static async revealMnemonic(password: string) {
    const hashedPassword = await Vault.toValidPassKey(password)
    return withError('Failed to reveal seed phrase', async () => {
      const mnemonic = await fetchAndDecryptOne<string>(
        mnemonicStrgKey,
        hashedPassword,
      )
      const mnemonicPattern = /^(\b\w+\b\s?){12}$/
      if (!mnemonicPattern.test(mnemonic)) {
        throw new Error('Mnemonic does not match the expected pattern')
      }
      return mnemonic
    })
  }

  /*
    Methods for handling settings.
  */
  async fetchSettings() {
    let saved
    try {
      saved = await fetchAndDecryptOne<AleoSettings>(
        settingsStrgKey,
        this.hashedPassword,
      )
      if (typeof saved !== 'object') {
        return DEFAULT_SETTINGS
      }
    } catch {
      /* empty */
    }
    return saved ? { ...DEFAULT_SETTINGS, ...saved } : DEFAULT_SETTINGS
  }

  async updateSettings(settings: Partial<AleoSettings>) {
    return withError('Failed to update settings', async () => {
      const current = await this.fetchSettings()
      const newSettings = { ...current, ...settings }
      await encryptAndSaveMany(
        [[settingsStrgKey, JSON.stringify(newSettings)]],
        this.hashedPassword,
      )
      return newSettings
    })
  }

  async isOwnMnemonic() {
    const result = await getData(ownMnemonicStrgKey)
    return result
  }

  async authorize(
    accPublicKey: string,
    program: string,
    functionName: string,
    inputs: string[],
    feeCredits: number,
    feeRecord?: string,
    imports?: { [key: string]: string },
  ): Promise<{
    authorization: string
    feeAuthorization: string
  }> {
    return withError('Failed to authorize transaction', async () => {
      const privateKey = await fetchAndDecryptOne<string>(
        accPrivKeyStrgKey(accPublicKey),
        this.hashedPassword,
      )

      const authJson = await authorizeTransaction(
        privateKey,
        program,
        functionName,
        inputs,
        feeCredits,
        feeRecord ?? null,
        imports ? JSON.stringify(imports) : null,
      )
      const auth = JSON.parse(authJson)
      return {
        authorization: auth.authorization,
        feeAuthorization: auth.fee_authorization,
      }
    })
  }

  async sign(accPublicKey: string, bytes: string) {
    const currentAccount = await this.getCurrentAccount()
    if (currentAccount.publicKey !== accPublicKey) {
      throw new Error('Account not found')
    }
    const privateKey = currentAccount.privateKey
    const bytesArr = new TextEncoder().encode(bytes)
    const bytes64 = Buffer.from(bytesArr).toString('base64')
    const signature = await sign(privateKey!, bytes64)
    const verifiedSignature = await verify(
      signature,
      bytes64,
      currentAccount.publicKey,
    )
    if (!verifiedSignature) {
      throw new Error('Invalid signature generated')
    }
    return signature
  }

  async decryptRecord(
    accPublicKey: string,
    cipherText: string,
  ): Promise<{ ciphertext: string; plaintext: string }> {
    const account = (await this.fetchAccounts()).find(
      a => a.publicKey === accPublicKey,
    )
    if (!account) {
      throw new Error('Account not found')
    }

    try {
      const plainText = await decryptRecord(account.viewKey, cipherText)
      return { ciphertext: cipherText, plaintext: plainText }
    } catch (err) {
      throw new Error('Failed to decrypt record')
    }
  }

  async decryptCipherText(
    accPublicKey: string,
    cipherText: string,
    tpk: string,
    programId: string,
    functionName: string,
    index: number,
  ) {
    const account = (await this.fetchAccounts()).find(
      a => a.publicKey === accPublicKey,
    )
    if (!account) {
      throw new Error('Account not found')
    }
    const plainText = await decryptCiphertext(
      account.viewKey,
      cipherText,
      tpk,
      programId,
      functionName,
      index,
    )
    return plainText
  }

  async decryptCipherTextOrRecord(
    accPublicKey: string,
    cipherText: string,
    tpk?: string,
    programId?: string,
    functionName?: string,
    index?: number,
  ) {
    if (cipherText.startsWith('ciphertext')) {
      if (!tpk || !programId || !functionName || index === undefined) {
        throw new Error(
          'Must include tpk, programId, functionName, and index for ciphertext',
        )
      }

      return await this.decryptCipherText(
        accPublicKey,
        cipherText,
        tpk,
        programId,
        functionName,
        index,
      )
    } else if (cipherText.startsWith('record')) {
      const texts = await this.decryptRecord(accPublicKey, cipherText)
      return texts.plaintext
    } else {
      throw new Error('Invalid ciphertext or record')
    }
  }
}

function generateCheck() {
  return Bip39.generateMnemonic(128)
}

// Adds new account to the current list of accounts if it doesn't already exist
function concatAccount(
  currentAccountList: AleoAccount[],
  newAccount: AleoAccount,
) {
  if (currentAccountList.every(a => a.publicKey !== newAccount.publicKey)) {
    return [...currentAccountList, newAccount]
  }

  throw new Error('Account already exists')
}

async function getPublicKeyAndViewKey(privateKey: string) {
  const address = await privateKeyToAddress(privateKey)
  const viewKey = await privateKeyToViewKey(privateKey)
  return [address, viewKey]
}

async function seedToHDPrivateKey(seed: Buffer, hdAccIndex: number) {
  const { seed: childSeed } = derivePath(
    getMainDerivationPath(hdAccIndex),
    seed.toString('hex'),
  )
  return seedToPrivateKey(childSeed)
}

function getMainDerivationPath(accIndex: number) {
  return `m/44'/0'/${accIndex}'/0'`
}

async function seedToPrivateKey(seed: Buffer) {
  seed = seed.slice(0, 32)
  const seedAsBase64 = seed.toString('base64')
  const privateKey = await fromSeedUnchecked(seedAsBase64)
  return privateKey
}

function createStorageKey(id: StorageEntity) {
  return combineStorageKey(STORAGE_KEY_PREFIX, id)
}

function createDynamicStorageKey(id: StorageEntity) {
  const keyBase = combineStorageKey(STORAGE_KEY_PREFIX, id)
  return (...subKeys: (number | string)[]) =>
    combineStorageKey(keyBase, ...subKeys)
}

function combineStorageKey(...parts: (string | number)[]) {
  return parts.join('_')
}

async function withError<T>(
  errMessage: string,
  factory: (doThrow: () => void) => Promise<T>,
) {
  try {
    return await factory(() => {
      throw new Error('<stub>')
    })
  } catch (err: any) {
    throw new Error(errMessage)
  }
}
