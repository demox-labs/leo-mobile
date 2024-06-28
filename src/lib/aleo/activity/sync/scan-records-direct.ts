import { IIsOwnerRecordInfo } from '@src/lib/aleo-chain/rpc-types'
import { IOwnedRecord, OwnedRecord } from '@src/lib/aleo/db/types'
import { Keys } from '@src/lib/aleo/types'
import { AleoChainId } from '@src/lib/aleo/types'
import { addressToXCoordinate, isRecordOwner } from 'modules/leo-sdk-module'

export const scanRecordsDirect = async (
  chainId: AleoChainId,
  addressToKeysMap: Map<string, Keys>,
  recordInfos: IIsOwnerRecordInfo[],
): Promise<IOwnedRecord[]> => {
  // Split records into roughly equal segments
  const splitRecordInfos = divideRecordInfos(
    recordInfos,
    navigator.hardwareConcurrency,
  )
  // Schedule tasks in parallel
  const tasks = splitRecordInfos.map(recs =>
    scanRecords(chainId, addressToKeysMap, recs),
  )
  // Wait for tasks to finish and get results
  const ownedRecords: IOwnedRecord[] = (await Promise.all(tasks)).flat()
  return ownedRecords
}

function divideRecordInfos(
  recordInfos: IIsOwnerRecordInfo[],
  numberOfThreads: number,
): IIsOwnerRecordInfo[][] {
  const splitRecords: IIsOwnerRecordInfo[][] = []
  // If the number of records is low enough, just use one task
  if (numberOfThreads * 10 > recordInfos.length) {
    return [recordInfos]
  }

  // Get the average chunk size
  const chunkSize = Math.floor(recordInfos.length / numberOfThreads)

  // Split work into n - 1 sub-arrays
  let startIndex = 0
  for (let i = 0; i < numberOfThreads - 1; i++) {
    const endIndex = startIndex + chunkSize
    splitRecords.push(recordInfos.slice(startIndex, endIndex))
    startIndex = endIndex
  }

  // Add remaining elements as last sub-array
  splitRecords.push(recordInfos.slice(startIndex))

  return splitRecords
}

async function scanRecords(
  chainId: AleoChainId,
  addressToKeysMap: Map<string, Keys>,
  recordInfos: IIsOwnerRecordInfo[],
): Promise<OwnedRecord[]> {
  try {
    const addresses = Array.from(addressToKeysMap.keys())

    const ownedRecords: IOwnedRecord[] = []
    for (const address of addresses) {
      const key = addressToKeysMap.get(address)
      if (!key) {
        console.error('No keys found for address', address)
        throw new Error('No keys found for address')
      }

      const addressX = await addressToXCoordinate(address)

      const ownedRecordInfos: IIsOwnerRecordInfo[] = []
      for (const recordInfo of recordInfos) {
        const isOwner = await isRecordOwner(
          key.viewKey,
          addressX,
          recordInfo.nonce_x + 'group',
          recordInfo.owner_x + 'field',
        )
        if (isOwner) {
          ownedRecordInfos.push(recordInfo)
        }
      }

      const records: OwnedRecord[] = ownedRecordInfos.map(
        recordInfo =>
          new OwnedRecord(
            address,
            chainId,
            recordInfo.transition_id,
            +recordInfo.output_index,
            false,
          ),
      )

      ownedRecords.push(...records)
    }

    return ownedRecords
  } catch (err: any) {
    console.error(err)
    return []
  }
}
