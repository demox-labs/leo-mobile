import { useCallback } from 'react'

import { useRetryableSWR } from '@src/utils/swr'
import { AleoAccount, AleoChainId } from '../types'
import { useAleoClient } from '../client'
import { ALEO_METADATA } from './metadata'
import { getPublicBalance } from '@src/lib/aleo-chain'
import { fetchRecordsForProgram } from '../activity/fetch'
import { IRecord } from '../db/types'
import { CREDITS_PROGRAM_ID } from '../programs/credits-program'
import { logger } from '@src/utils/logger'
import { getData, setData } from '@src/utils/storage'

type UseBalanceOptions = {
  suspense?: boolean
  networkRpc?: string
  displayed?: boolean
  initial?: bigint
  refreshInterval?: number
}

export function useBalance(
  account: AleoAccount,
  chainId: string,
  assetSlug: string,
  opts: UseBalanceOptions = {},
  includePublic: boolean = true,
  includePrivate: boolean = true,
  unlocked: boolean = false,
) {
  const aleo = useAleoClient()
  const assetMetadata = ALEO_METADATA

  const fetchBalanceLocal = useCallback(
    () =>
      fetchBalance(
        account,
        chainId,
        assetSlug,
        includePublic,
        includePrivate,
        unlocked,
      ),
    [
      aleo,
      account,
      chainId,
      assetSlug,
      assetMetadata,
      includePublic,
      includePrivate,
      unlocked,
    ],
  )

  const displayed = opts.displayed ?? true

  return useRetryableSWR(
    displayed
      ? getBalanceSWRKey(
          assetSlug,
          account.publicKey,
          includePublic,
          includePrivate,
          unlocked,
        )
      : null,
    fetchBalanceLocal,
    {
      suspense: opts.suspense ?? false,
      revalidateOnFocus: false,
      dedupingInterval: 20_000,
      refreshInterval: opts.refreshInterval ?? 15_000,
      fallbackData: opts.initial,
    },
  )
}

export function useFee(
  account: AleoAccount,
  chainId: string,
  allowOneCreditRecord: boolean,
) {
  const fetchFeeLocal = useCallback(
    () => fetchFee(account, chainId as AleoChainId, allowOneCreditRecord),
    [account, chainId, allowOneCreditRecord],
  )

  return useRetryableSWR('maximum-fee', fetchFeeLocal, {
    suspense: false, // TODO: set to true once suspense is supported
    revalidateOnFocus: false,
    dedupingInterval: 20_000,
    refreshInterval: 5_000,
  })
}

export function getBalanceSWRKey(
  assetSlug: string,
  address: string,
  includePublic: boolean,
  includePrivate: boolean,
  unlocked: boolean,
) {
  return [
    'balance',
    assetSlug,
    address,
    includePublic,
    includePrivate,
    unlocked,
  ].join('_')
}

export async function fetchBalance(
  account: AleoAccount,
  chainId: string,
  assetSlug: string,
  includePublic: boolean = true,
  includePrivate: boolean = true,
  unlocked: boolean = false,
) {
  const asset = assetSlug

  let balance: bigint = BigInt(0)

  if (asset === 'aleo') {
    const aleoBalance = await getBalanceSafe(
      chainId,
      account,
      includePublic,
      includePrivate,
      unlocked,
    )
    if (aleoBalance) {
      balance += aleoBalance
    }
  }

  return balance
}

export async function fetchFee(
  account: AleoAccount,
  chainId: AleoChainId,
  allowOneCreditRecord: boolean,
) {
  let unspentRecords = await fetchRecordsForProgram(
    chainId,
    account.publicKey,
    CREDITS_PROGRAM_ID,
    false,
  )
  unspentRecords = unspentRecords.filter(
    rec => rec.microcredits && rec.locked === 0,
  )
  unspentRecords.sort(
    (a, b) => Number(b.microcredits!) - Number(a.microcredits!),
  )
  if (unspentRecords.length > 0 && allowOneCreditRecord) {
    return unspentRecords[0].microcredits
  } else if (unspentRecords.length > 1) {
    return unspentRecords[1].microcredits
  }
  return BigInt(0)
}

function removeSmallestFeeRecord(records: IRecord[]): IRecord[] {
  let smallestRecordIndex: number | null = null
  let smallestMicrocredits: bigint | null = null

  for (let i = 0; i < records.length; i++) {
    const { microcredits } = records[i]

    if (microcredits && microcredits > BigInt(25000)) {
      if (
        smallestMicrocredits === null ||
        microcredits < smallestMicrocredits
      ) {
        smallestRecordIndex = i
        smallestMicrocredits = microcredits
      }
    }
  }

  if (smallestRecordIndex !== null) {
    records.splice(smallestRecordIndex, 1)
  }

  return records
}

const getBalanceSafe = async (
  chainId: any,
  account: AleoAccount,
  includePublic: boolean = true,
  includePrivate: boolean = true,
  unlocked: boolean = false,
): Promise<bigint | undefined> => {
  try {
    const address = account.publicKey
    let balance: bigint = BigInt(0)
    // Get balance from public state
    if (includePublic) {
      let publicBalance = BigInt(0)
      try {
        publicBalance = await getPublicBalance(chainId, address)
        setData('publicBalance', String(publicBalance))
      } catch (err) {
        logger.error(
          'Error getting public balance. Using cached value instead',
          err,
        )
        const cachedPublicBalance = await getData('publicBalance')
        publicBalance =
          cachedPublicBalance !== null ? BigInt(cachedPublicBalance) : BigInt(0)
      }
      balance += publicBalance
    }

    if (!includePrivate) {
      return balance
    }

    // Get balance from unspent records
    let unspentRecords = await fetchRecordsForProgram(
      chainId,
      address,
      CREDITS_PROGRAM_ID,
      false,
    )

    // Filter for unlocked records
    if (unlocked) {
      unspentRecords = unspentRecords.filter(rec => rec.locked === 0)
      unspentRecords = removeSmallestFeeRecord(unspentRecords)
    }

    // Sum microcredits for records
    const unspentSum = unspentRecords
      .map(record => record.microcredits || BigInt(0))
      .reduce((acc, val) => acc + val, BigInt(0))
    return balance + unspentSum
  } catch (err) {
    console.error('Error in get balance safe', err)
  }
  return undefined
}
