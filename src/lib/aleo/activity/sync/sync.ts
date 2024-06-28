import {
  ALEO_API_BASE_URLS,
  getIsOwnerCheckRecordInfos,
  getProgram,
  getRecordsByTransitionAndIndex,
  getSerialNumbers,
} from '@src/lib/aleo-chain/client'
import { AleoChainId, Keys } from '../../types'
import {
  RecordSyncStep,
  createRecordSyncPlan,
  updateRecordSync,
  getInProgressSyncs,
  combineAdjacentCompleteRecordSyncs,
} from '@src/lib/aleo/activity/sync/sync-plan'
import {
  OwnedRecordsTable,
  PublicSyncsTable,
  RecordSyncsTable,
  RecordsTable,
  SerialNumberSyncTimesTable,
  TransactionsTable,
  TransitionsTable,
} from '@src/lib/aleo/db/repo'
import { scanRecordsDirect } from './scan-records-direct'
import { createAddressToKeysMap } from './aleo-sdk-utils'
import { IRecord, OwnedRecord } from '../../db/types'
import {
  ProgramMap,
  extractMicrocredits,
  parseAleoProgram,
} from '@src/lib/aleo-chain/helpers'
import { decryptRecord, serialNumberString } from 'modules/leo-sdk-module'

export const isSyncSupported = (chainId: string) =>
  ALEO_API_BASE_URLS.has(chainId as any)

export async function finishInProgressSyncs(
  chainId: AleoChainId,
  keys: Keys[],
) {
  const totalAddressToKeyMap = await createAddressToKeysMap(keys)
  // Get all partially completed record syncs
  const inProgressRecordSyncs = await getInProgressSyncs(chainId)

  // First, finish all in progress syncs to not waste previous paginations
  await Promise.all(
    inProgressRecordSyncs.map(async sync => {
      const matchingKeyMap = getSubsetByValues(totalAddressToKeyMap, [
        sync.address,
      ])
      doOwnedSync(
        chainId,
        sync.startBlock,
        sync.endBlock,
        sync.page,
        matchingKeyMap,
      )
    }),
  )
}

export async function syncOwnedRecords(
  currentBlock: number,
  chainId: AleoChainId,
  keys: Keys[],
  syncBatch: number,
  batchSize: number,
) {
  if (!isSyncSupported(chainId)) {
    throw new Error('Not supported for this chainId')
  }

  const addressToKeysMap = await createAddressToKeysMap(keys)
  const addresses = Array.from(addressToKeysMap.keys())

  const allRecordSyncSteps = await createRecordSyncPlan(
    chainId,
    addresses,
    currentBlock,
    batchSize,
  )
  // sort reverse order -- the more recent blocks should be synced first
  allRecordSyncSteps.sort((rss1, rss2) => rss2.end - rss1.end)

  const stepsToSync =
    allRecordSyncSteps.length > syncBatch
      ? allRecordSyncSteps.slice(0, syncBatch)
      : allRecordSyncSteps

  for (const syncStep of stepsToSync) {
    const matchingPKMap = getSubsetByValues(
      addressToKeysMap,
      syncStep.addressesToCheck,
    )
    await doOwnedSync(chainId, syncStep.start, syncStep.end, -1, matchingPKMap)
  }
}

export async function doOwnedSync(
  chainId: AleoChainId,
  startBlock: number,
  endBlock: number,
  prevPage: number,
  addressToKeysMap: Map<string, Keys>,
) {
  let currentPage = prevPage + 1
  let recordInfos = await getIsOwnerCheckRecordInfos(
    chainId,
    startBlock,
    endBlock,
    currentPage,
  )
  const addresses = Array.from(addressToKeysMap.keys())

  while (recordInfos.length > 0) {
    try {
      const ownedRecords = await scanRecordsDirect(
        chainId,
        addressToKeysMap,
        recordInfos,
      )
      await saveOwnedRecords(ownedRecords)
    } catch (e) {
      console.error('Failed to scan records', e)
      throw e
    }
    // Update syncTime in db for all addresses
    const pageJustSynced = currentPage
    const updateRecordSyncTasks = addresses.map(address =>
      updateRecordSync(
        chainId,
        address,
        new RecordSyncStep(startBlock, endBlock, [address]),
        pageJustSynced,
        false,
      ),
    )
    await Promise.all(updateRecordSyncTasks)

    currentPage += 1

    // Request more records from same block range
    recordInfos = await getIsOwnerCheckRecordInfos(
      chainId,
      startBlock,
      endBlock,
      currentPage,
    )
  }

  await completeRecordSyncStep(
    chainId,
    addresses,
    startBlock,
    endBlock,
    currentPage,
  )
}

async function saveOwnedRecords(ownedRecords: OwnedRecord[]) {
  const insertTasks = ownedRecords.map(async record => {
    OwnedRecordsTable.put(record)
  })
  await Promise.all(insertTasks)
}

export async function completeRecordSyncStep(
  chainId: AleoChainId,
  addresses: string[],
  startBlock: number,
  endBlock: number,
  pageCompleted: number,
) {
  const updateRecordSyncs = addresses.map(async address => {
    return await updateRecordSync(
      chainId,
      address,
      new RecordSyncStep(startBlock, endBlock, [address]),
      pageCompleted,
      true,
    )
  })
  await Promise.all(updateRecordSyncs)
  // Add combining completed syncs back once there is a shared global lock on syncing across all instances of the wallet.
  const combineAdjacentSyncs = addresses.map(async address => {
    return await combineAdjacentCompleteRecordSyncs(chainId, address)
  })
  await Promise.all(combineAdjacentSyncs)
}

export function getSubsetByValues(
  addressesToKeys: Map<string, Keys>,
  addressesToCheck: string[],
): Map<string, Keys> {
  const subset = new Map<string, Keys>()
  for (const [key, value] of Array.from(addressesToKeys.entries())) {
    if (addressesToCheck.includes(key)) {
      subset.set(key, value)
    }
  }
  return subset
}

export async function completeOwnedRecords(chainId: AleoChainId, keys: Keys[]) {
  if (!isSyncSupported(chainId)) {
    throw new Error('Not supported for this chainId')
  }

  const addressesToKeysMap = await createAddressToKeysMap(keys)

  const ownedRecords = await OwnedRecordsTable.getUnsynced(chainId)
  const transitionIdAndIndexToAddressMap = new Map<string, string>()
  for (const ownedRecord of ownedRecords) {
    transitionIdAndIndexToAddressMap.set(
      ownedRecord.transitionId + ownedRecord.outputIndex,
      ownedRecord.address,
    )
  }

  const unsyncedOwnedRecordsLimit = 100
  let startIndex = 0

  while (startIndex < ownedRecords.length) {
    const endIndex = Math.min(
      startIndex + unsyncedOwnedRecordsLimit,
      ownedRecords.length,
    )

    try {
      const ownedRecordsSlice = ownedRecords.slice(startIndex, endIndex)
      const ownedRecordsRecordInfo: [string, number][] = ownedRecordsSlice.map(
        r => [r.transitionId, r.outputIndex],
      )

      const records = await getRecordsByTransitionAndIndex(
        chainId,
        ownedRecordsRecordInfo,
      )

      const programMap = await getProgramMap(records, chainId)

      const recordsToSave = []
      for (const record of records) {
        const address = transitionIdAndIndexToAddressMap.get(
          record.transitionId + record.outputIndex,
        )
        if (!address) {
          console.error(
            'Missing address found for transition_id',
            record.transitionId,
          )
          continue
        }
        record.address = address
        const privateKey = addressesToKeysMap.get(address)?.privateKey
        const viewKey = addressesToKeysMap.get(address)?.viewKey
        if (!viewKey || !privateKey) {
          console.error('Missing key found for address', record.address)
          continue
        }

        const programId = record.programId
        const recordName =
          programMap[programId].functions[record.functionName].outputs[
            record.outputIndex
          ].type
        const recordPlaintext = await decryptRecord(viewKey, record.ciphertext)
        const sn = await serialNumberString(
          recordPlaintext,
          privateKey,
          programId,
          recordName,
        )

        record.serialNumber = sn
        record.microcredits = extractMicrocredits(recordPlaintext.toString())

        recordsToSave.push(record)
      }

      const recordInsertTasks = recordsToSave.map(async record => {
        RecordsTable.put(record)
      })
      await Promise.all(recordInsertTasks)

      const completedOwnedRecords = ownedRecordsSlice.map(r => {
        r.synced = true
        return r
      })
      const updateOwnedRecordsTasks = completedOwnedRecords.map(
        async record => {
          OwnedRecordsTable.put(record)
        },
      )
      await Promise.all(updateOwnedRecordsTasks)
    } catch (e) {
      console.error('Failed to complete owned records', e)
    }

    startIndex = endIndex
  }
}

const getProgramMap = async (
  records: IRecord[],
  chainId: AleoChainId,
): Promise<ProgramMap> => {
  const programSet = new Set(records.map(record => record.programId))
  const programArray = Array.from(programSet)
  const programTasks = programArray.map(async programId => {
    const program = await getProgram(programId, chainId)

    return { [programId]: parseAleoProgram(program) }
  })
  const parsedPrograms = await Promise.all(programTasks)
  return Object.assign({}, ...parsedPrograms)
}

export async function syncAllSpentRecords(chainId: AleoChainId) {
  if (!isSyncSupported(chainId)) {
    throw new Error('Not supported for this chainId')
  }

  let serialNumbersSync = await SerialNumberSyncTimesTable.getByChainId(chainId)
  if (!serialNumbersSync) {
    serialNumbersSync = {
      id: -1, // sync doesn't yet exist
      chainId,
      page: -1,
    }
    await SerialNumberSyncTimesTable.insertNew(serialNumbersSync)
  }

  // Sync the next 100 unspent records numbers
  let page = serialNumbersSync.page + 1
  const unspentRecordsLimit = 100
  const unspentRecords = await RecordsTable.getUnspent(chainId)

  const serialNumbers = unspentRecords.map(record => record.serialNumber)
  let startRecordIndex = 0

  while (startRecordIndex < unspentRecords.length) {
    const endSlice = Math.min(
      startRecordIndex + unspentRecordsLimit,
      unspentRecords.length,
    )

    try {
      // The slice has an inclusive start, exclusive end.
      const serialNumberSlice = serialNumbers.slice(startRecordIndex, endSlice)
      const serialNumbersSpent = await getSerialNumbers(
        chainId,
        serialNumberSlice,
      )
      const updatedRecords: IRecord[] = []
      // eslint-disable-next-line no-loop-func
      // The serial numbers returned by the RPC are guaranteed to be spent.
      serialNumbersSpent.forEach(sn => {
        const recordToUpdate = unspentRecords.filter(
          record => record.serialNumber === sn.serial_number,
        )[0]
        const updatedRecord: IRecord = {
          ...recordToUpdate,
          blockHeightSpent: sn.height,
          blockIdSpent: sn.block_id,
          timestampSpent: Number(sn.timestamp_spent),
          transactionIdSpent: sn.transaction_id,
          transitionIdSpent: sn.transition_id,
          spent: 1,
        }
        updatedRecords.push(updatedRecord)
      })
      const updateRecordTasks = updatedRecords.map(async record => {
        RecordsTable.put(record)
      })
      await Promise.all(updateRecordTasks)
    } catch (e: any) {
      console.error('Failed to sync spent records', e)
    }

    // Update or create new syncTime in Dexie
    const newPage = page
    if (serialNumbersSync.id === -1) {
      await SerialNumberSyncTimesTable.insertNew({ chainId, page: newPage })
    } else {
      await SerialNumberSyncTimesTable.update(serialNumbersSync.id, {
        ...serialNumbersSync,
        page: newPage,
      })
    }

    // Increment page
    page++

    startRecordIndex = endSlice
  }

  // reset the saved sync time so that the serial numbers are re-iterated over in the next sync
  await SerialNumberSyncTimesTable.updatePageByChainId(chainId, -1)
}

export async function resyncAccount(
  address: string,
  chainId: string = 'testnetbeta',
) {
  console.log('RESYNCING ACCOUNT', address, chainId)
  // Delete the data
  await RecordsTable.deleteByAddressAndChainId(address, chainId)
  await TransitionsTable.deleteByAddressAndChainId(address, chainId)
  await TransactionsTable.deleteByAddressAndChainId(address, chainId)
  await OwnedRecordsTable.deleteByAddressAndChainId(address, chainId)

  // Delete the key files
  // await Repo.keyFiles.clear();

  // Delete the sync times, triggering a full resync
  await RecordSyncsTable.deleteByAddressAndChainId(address, chainId)
  await PublicSyncsTable.deleteByAddressAndChainId(address, chainId)
}

export async function resetTables() {
  await RecordsTable.deleteAll()
  await TransitionsTable.deleteAll()
  await TransactionsTable.deleteAll()
  await OwnedRecordsTable.deleteAll()

  await RecordSyncsTable.deleteAll()
  await PublicSyncsTable.deleteAll()
}
