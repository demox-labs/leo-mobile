import { privateKeyToAddress } from 'modules/leo-sdk-module'

import { Keys } from '@src/lib/aleo/autosync'

export async function createAddressToKeysMap(
  keys: Keys[],
): Promise<Map<string, Keys>> {
  const addressToKeysMap: Map<string, Keys> = new Map()
  for (const key of keys) {
    if (!key.privateKey) {
      continue
    }
    const address = await privateKeyToAddress(key.privateKey)
    addressToKeysMap.set(address, key)
  }
  return addressToKeysMap
}
