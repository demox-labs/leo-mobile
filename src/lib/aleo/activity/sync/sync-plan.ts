import { IDBRecordSync, IRecordSync } from '@src/lib/aleo/db/types'
import * as Repo from '@src/lib/aleo/db/repo'

import { getAccountCreationBlockHeight } from './account-creation'

/**
 * start: block height to start sync step, inclusive
 * end: block height to end sync step, exclusive
 * addressesToCheck: addresses to be included in the sync step
 */
export class RecordSyncStep {
  start: number
  end: number
  addressesToCheck: string[]

  constructor(start: number, end: number, addressesToCheck: string[]) {
    this.start = start
    this.end = end
    this.addressesToCheck = addressesToCheck
  }
}

/**
 * Takes a list of sync times and returns which block ranges need to be queried
 * and for each of those ranges which addresses need to perform ownership checks.
 * @param recordSyncs List of IRecordSync db objects, containing information about ranges already synced.
 * Assumes all recordSyncs have been completed, so just generates a plan outside of recordSyncs that are complete
 * or in-progress
 * @param currentHeight Current block height that we're syncing to
 * @returns A list of RecordSyncSteps
 */
export async function createRecordSyncPlan(
  chainId: string,
  addresses: string[],
  currentHeight: number,
  batchSize: number,
): Promise<RecordSyncStep[]> {
  const addressSyncPlanPromises = addresses.map(address =>
    createSingleSyncPlan(chainId, address, currentHeight),
  )

  const addressSyncPlans = (await Promise.all(addressSyncPlanPromises)).flat()
  const chunkedSyncPlans = addressSyncPlans
    .map(asp => chunkRecordSyncStep(asp, batchSize))
    .flat()
  const combinedSyncSteps = combineMatchingSyncSteps(chunkedSyncPlans)

  return combinedSyncSteps
}

export async function getInProgressSyncs(
  chainId: string,
): Promise<IRecordSync[]> {
  return (await Repo.RecordSyncsTable.getSyncsByCompletion(
    chainId,
    false,
  )) as IRecordSync[]
}

/**
 * Takes a list of sync times and returns which block ranges need to be queried
 * and for each of those ranges which addresses need to perform ownership checks.
 * @param syncTimes List of ISyncTime db objects
 * @param currentHeight Current block height that we're syncing to
 * @returns A list of RecordSyncSteps
 */
export async function createSingleSyncPlan(
  chainId: string,
  address: string,
  currentHeight: number,
): Promise<RecordSyncStep[]> {
  // get the minimum block height that the address was created at
  const minBlockHeight = await getAccountCreationBlockHeight(chainId, address)

  // get all completed (or partial) record syncs for a given address
  const recordSyncs = await Repo.RecordSyncsTable.getSyncsForAddress(
    chainId,
    address,
  )

  // no record syncs found, this address needs to sync the entire chain to the chain height
  if (recordSyncs.length === 0) {
    const totalSync = new RecordSyncStep(minBlockHeight, currentHeight + 1, [
      address,
    ])
    return [totalSync]
  }

  const recordSyncSteps: RecordSyncStep[] = []

  // some record syncs found, this address needs to sync any gaps between the syncs
  recordSyncs.sort((rs1, rs2) => rs1.startBlock - rs2.startBlock)
  for (let i = 0; i < recordSyncs.length - 1; i++) {
    const syncStart = recordSyncs[0].endBlock
    const syncEnd = recordSyncs[1].startBlock
    // for adjacent record syncs, there is no gap and therefore no extra sync step that needs to occur
    if (syncStart === syncEnd) {
      continue
    }
    const betweenSyncStep = new RecordSyncStep(syncStart, syncEnd, [address])
    recordSyncSteps.push(betweenSyncStep)
  }

  const earliestSync = recordSyncs[0]
  // if the earliest sync range does not include block of height 0, a sync step from 0 is necessary
  if (earliestSync.startBlock !== minBlockHeight) {
    const genesisSyncStep = new RecordSyncStep(
      minBlockHeight,
      earliestSync.startBlock,
      [address],
    )
    recordSyncSteps.push(genesisSyncStep)
  }

  const latestSync = recordSyncs[recordSyncs.length - 1]
  // if the latest sync range does not include the head of of the chain (block height @param currentHeight), a sync
  // step to the head of the chain is necessary
  if (latestSync.endBlock <= currentHeight) {
    const headSyncStep = new RecordSyncStep(
      latestSync.endBlock,
      currentHeight + 1,
      [address],
    )
    recordSyncSteps.push(headSyncStep)
  }

  return recordSyncSteps
}

export function chunkRecordSyncStep(
  recordSyncStep: RecordSyncStep,
  chunkSegmentSize: number,
) {
  if (recordSyncStep.end - recordSyncStep.start <= chunkSegmentSize) {
    return [recordSyncStep]
  }

  const chunkedSteps = []
  let endChunkIndex = recordSyncStep.start
  while (endChunkIndex < recordSyncStep.end) {
    const chunkStart = endChunkIndex
    const chunkStartSegmentIndex = Math.floor(chunkStart / chunkSegmentSize)
    endChunkIndex = Math.min(
      (chunkStartSegmentIndex + 1) * chunkSegmentSize,
      recordSyncStep.end,
    )
    chunkedSteps.push(
      new RecordSyncStep(
        chunkStart,
        endChunkIndex,
        recordSyncStep.addressesToCheck,
      ),
    )
  }

  return chunkedSteps
}

export function combineMatchingSyncSteps(
  recordSyncSteps: RecordSyncStep[],
): RecordSyncStep[] {
  const uniqueRanges: Map<string, RecordSyncStep> = new Map()
  recordSyncSteps.forEach(rss => {
    const range = `${rss.start}-${rss.end}`
    if (uniqueRanges.has(range)) {
      const prevRSS = uniqueRanges.get(range)!
      prevRSS.addressesToCheck = prevRSS.addressesToCheck.concat(
        rss.addressesToCheck,
      )
      uniqueRanges.set(range, prevRSS)
    } else {
      uniqueRanges.set(range, rss)
    }
  })
  return [...uniqueRanges.values()]
}

export async function updateRecordSync(
  chainId: string,
  address: string,
  recordSyncStep: RecordSyncStep,
  page: number,
  complete: boolean,
): Promise<void> {
  const syncs = await Repo.RecordSyncsTable.getSyncsForAddress(chainId, address)
  const syncsToUpdate = syncs.filter(
    rs =>
      rs.startBlock === recordSyncStep.start &&
      rs.endBlock === recordSyncStep.end,
  )
  for (let i = 0; i < syncsToUpdate.length; i++) {
    const syncToUpdate = syncsToUpdate[i]
    syncToUpdate.page = page
    syncToUpdate.rangeComplete = complete
    await Repo.RecordSyncsTable.update(syncToUpdate.id, syncToUpdate)
  }

  if (syncsToUpdate.length === 0) {
    await Repo.RecordSyncsTable.insertNew({
      chainId: chainId,
      address: address,
      startBlock: recordSyncStep.start,
      endBlock: recordSyncStep.end,
      page: page,
      rangeComplete: complete,
    })
  }
}

export async function getEstimatedSyncPercentage(
  chainId: string,
  address: string,
  defaultSyncFraction: number,
): Promise<number> {
  const savedSyncs = await Repo.RecordSyncsTable.getSyncsForAddress(
    chainId,
    address,
  )
  savedSyncs.sort((a, b) => b.endBlock - a.endBlock)
  if (savedSyncs.length === 0) {
    return defaultSyncFraction
  }
  const latestSyncedBlock = savedSyncs[0].endBlock
  const minBlockHeight = await getAccountCreationBlockHeight(chainId, address)
  const totalBlocksSynced = savedSyncs.reduce(
    (accumulator: number, currentValue: IDBRecordSync) => {
      if (!!currentValue.rangeComplete == true) {
        // Note: this should be a double equals, not a triple equals
        return accumulator + (currentValue.endBlock - currentValue.startBlock)
      }
      return accumulator
    },
    0,
  )

  return (1.0 * totalBlocksSynced) / (latestSyncedBlock - minBlockHeight)
}

export async function getEstimatedSyncPercentages(
  chainId: string,
  addresses: string[],
): Promise<Map<string, number>> {
  const syncPercentages = new Map<string, number>()
  for (let i = 0; i < addresses.length; i++) {
    const address = addresses[i]
    const syncPercentage = await getEstimatedSyncPercentage(
      chainId,
      address,
      0.0,
    )
    syncPercentages.set(address, syncPercentage)
  }

  return syncPercentages
}

export async function combineAdjacentCompleteRecordSyncs(
  chainId: string,
  address: string,
): Promise<void> {
  const allCompletedSyncs =
    await Repo.RecordSyncsTable.getSyncsByAddressAndCompletion(
      chainId,
      address,
      true,
    )

  allCompletedSyncs.sort((a, b) => a.startBlock - b.startBlock)

  const combinedSyncs: IRecordSync[] = []

  for (let i = 0; i < allCompletedSyncs.length; i++) {
    const currentSync = allCompletedSyncs[i]

    // If there are no more syncs to check, add the current sync to the list of combined syncs.
    if (i === allCompletedSyncs.length - 1) {
      combinedSyncs.push(currentSync)
      break
    }

    for (let j = i + 1; j < allCompletedSyncs.length; j++) {
      const nextSync = allCompletedSyncs[j]

      // If the end of the current range sync the start of the next sync, combine them into a single sync.
      if (currentSync.endBlock === nextSync.startBlock) {
        currentSync.endBlock = nextSync.endBlock
        currentSync.page += nextSync.page

        // Skip the next sync since it has been merged with the current sync.
        j++
        i++
      } else {
        break
      }

      combinedSyncs.push(currentSync)
    }
  }

  await Repo.RecordSyncsTable.deleteByAddressAndChainId(address, chainId)
  await Promise.all(
    combinedSyncs.map(async sync => {
      await Repo.RecordSyncsTable.insertNew(sync)
    }),
  )
}
