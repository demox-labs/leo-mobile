import {
  getNFTProgramInfo,
  getProgram,
  getProgramTypes,
  getPublicNfts,
} from '@src/lib/aleo-chain/client'
import { IDappRecord, IRecord } from '../db/types'
import { AleoChainId } from '../types'
import { RecordsTable } from '../db/repo'
import { withUnlocked } from '../store'
import { AleoProgram, parseAleoProgram } from '@src/lib/aleo-chain/helpers'
import { decryptRecord } from 'modules/leo-sdk-module'
import { INFT, INFTProgramInfo, INFTRecordData } from '@src/types/nfts'
import { bigIntToString } from '@src/lib/util'

export async function fetchDAppRecordsForProgram(
  chainId: string,
  address: string,
  programName: string,
  includeSensitive: boolean = false,
): Promise<IDappRecord[]> {
  const records = (
    await RecordsTable.getByChainIdAndAddress(chainId, address)
  ).filter(record => record.programId === programName)

  const program = await getProgram(programName, chainId as AleoChainId)
  const parsedProgram = parseAleoProgram(program)

  const dappRecords = await Promise.all(
    records.map(async (record: IRecord) => {
      // This should be fixed in the Aleo SDK which currently produces an invalid JSON string
      const invalidJSON = await withUnlocked(async ({ vault }) => {
        const decrypted = await vault.decryptRecord(address, record.ciphertext)
        return decrypted.plaintext
      })
      const validJSON = formatJsonString(invalidJSON)
      const plainText = JSON.parse(validJSON)
      delete plainText._nonce
      delete plainText.owner

      const sensitiveInfo = includeSensitive
        ? {
            ciphertext: record.ciphertext,
            plaintext: invalidJSON,
            serialNumber: record.serialNumber,
            transactionIdCreated: record.transactionId,
            transactionIdSpent: record.transactionIdSpent,
          }
        : {}

      return {
        id: record.id,
        owner: record.address,
        program_id: record.programId,
        spent: record.spent === 0 ? false : true,
        recordName:
          parsedProgram.functions[record.functionName].outputs[
            record.outputIndex
          ].type,
        data: plainText,
        ...sensitiveInfo,
      }
    }),
  )

  return dappRecords
}

export async function fetchRecordsForProgram(
  chainId: string,
  address: string,
  programName: string,
  includeSpent: boolean = false,
): Promise<IRecord[]> {
  let records = await RecordsTable.getByChainIdAndAddress(chainId, address)
  records = records.filter(record => record.programId === programName)

  if (!includeSpent) {
    records = records.filter(record => record.spent === 0)
  }

  return records
}

function formatJsonString(jsonString: string) {
  const keyValueRegex = /([a-zA-Z0-9_]+)(\s*):(\s*)([a-zA-Z0-9_.]+)/g
  const objectArrayRegex = /([a-zA-Z0-9_]+)(\s*):(\s*)(\{|\[)/g

  function process(json: string) {
    const replacedKeys = json.replace(
      objectArrayRegex,
      (_, key, space1, space2, open) => {
        return `"${key}"${space1}:${space2}${open}`
      },
    )

    let replacedValues = replacedKeys.replace(
      keyValueRegex,
      (_, key, space1, space2, value) => {
        return `"${key}"${space1}:${space2}"${value}"`
      },
    )

    const nestedMatch = replacedValues.match(objectArrayRegex)

    if (nestedMatch) {
      for (const match of nestedMatch) {
        const open = match[match.length - 1]
        const close = open === '{' ? '}' : ']'
        const nestedStart = replacedValues.indexOf(match) + match.length - 1
        let nestedEnd = nestedStart
        let balance = 1

        while (balance > 0) {
          nestedEnd++
          if (replacedValues[nestedEnd] === open) {
            balance++
          } else if (replacedValues[nestedEnd] === close) {
            balance--
          }
        }

        const nestedJson = replacedValues.slice(nestedStart, nestedEnd + 1)
        const formattedNestedJson = process(nestedJson)
        replacedValues = replacedValues.replace(nestedJson, formattedNestedJson)
      }
    }

    return replacedValues
  }

  return process(jsonString)
}

function hasRequiredNFTFunctions(program: AleoProgram): boolean {
  const requiredFunctions = [
    'convert_public_to_private',
    'convert_private_to_public',
    'transfer_private',
    'transfer_public',
  ]

  return requiredFunctions.every(func => func in program.functions)
}

export async function isNFTLikeRecord(
  programId: string,
  record: IRecord,
  viewKey: string,
) {
  const program = await getProgram(programId, record.chainId as AleoChainId)
  const parsedProgram = parseAleoProgram(program)
  if (!hasRequiredNFTFunctions(parsedProgram)) {
    return false
  }

  let invalidJSON = ''
  try {
    invalidJSON = await decryptRecord(viewKey, record.ciphertext)
  } catch {
    console.log('Error decrypting record: ', record)
    return false
  }

  const validJSON = formatJsonString(invalidJSON)
  const plainText = JSON.parse(validJSON)

  // nft-like record doesn't look like an nft
  if (!plainText.data || !plainText.edition) {
    return false
  }

  return true
}

const nftProgramCache = new Map<string, INFTProgramInfo>()
const nftJsonCache = new Map<string, any>()
export async function fetchRecordsAsNFTs(
  chainId: AleoChainId,
  address: string,
  viewKey: string,
  offset?: number,
  limit?: number,
): Promise<INFT[]> {
  const nftLikeRecords = await fetchUnspentNFTLikeRecords(
    chainId,
    address,
    viewKey,
  )

  // Sort NFT-like records in descending order by timestamp (newest first) and slice to offset and limit
  const nftSubset = nftLikeRecords
    .sort((r1, r2) => r2.timestamp - r1.timestamp)
    .slice(offset, limit)
  return await fetchRecordSubsetAsNFTs(chainId, nftSubset)
}

function ensureHttpsProtocol(url: string): string {
  // Regular expression to check if the URL starts with "http://" or "https://"
  const protocolPattern = /^(http:\/\/|https:\/\/)/
  // If the URL already starts with a protocol, return it as is
  if (protocolPattern.test(url)) {
    return url
  }
  // If not, prepend "https://" to the URL
  return `https://${url}`
}

async function fetchRecordSubsetAsNFTs(
  chainId: AleoChainId,
  nftRecordData: INFTRecordData[],
): Promise<INFT[]> {
  for (let i = 0; i < nftRecordData.length; i++) {
    const record = nftRecordData[i]
    if (!nftProgramCache.has(record.programId)) {
      const programInfo = await getNFTProgramInfo(chainId, record.programId)
      nftProgramCache.set(record.programId, programInfo)
    }
  }

  const nfts: INFT[] = []

  for (let i = 0; i < nftRecordData.length; i++) {
    try {
      const record = nftRecordData[i]
      const programInfo = nftProgramCache.get(record.programId)
      let nftJsonInfo: any = null
      if (nftJsonCache.has(record.tokenId)) {
        nftJsonInfo = nftJsonCache.get(record.tokenId)
      } else {
        const nftJsonResponse = await fetch(
          ensureHttpsProtocol(programInfo!.baseUri) + record.tokenId,
        )
        nftJsonInfo = JSON.parse(await nftJsonResponse.text())
        nftJsonCache.set(record.tokenId, nftJsonInfo)
      }
      nfts.push({
        recordId: record.recordId,
        edition: record.edition,
        programId: record.programId,
        tokenId: record.tokenId,
        symbol: programInfo?.symbol ?? '',
        timestamp: record.timestamp,
        transactionId: record.transactionId,
        collectionDescription: nftJsonInfo.collectionDescription,
        imageURI: nftJsonInfo.image,
        mintNumber: nftJsonInfo.mintNumber,
        collectionName: nftJsonInfo.collectionName,
        sourceLink: nftJsonInfo.sourceLink,
        attributes: nftJsonInfo.attributes,
        isPrivate: true,
      })
    } catch (e) {
      console.log('Error fetching NFT info', e)
    }
  }

  return nfts
}

export async function fetchUnspentNFTLikeRecords(
  chainId: string,
  address: string,
  viewKey: string,
): Promise<INFTRecordData[]> {
  // Get all records for address that are unspent
  const unspentRecordsForAddress = (
    await RecordsTable.getByChainIdAndAddress(chainId, address)
  ).filter(record => record.spent === 0)

  // Get all programIds for these records
  const programIdsForUnspentRecordsSet = new Set<string>()
  unspentRecordsForAddress.forEach(record => {
    programIdsForUnspentRecordsSet.add(record.programId)
  })

  // Get mapping of programIds to programTypes from RPC
  const programTypesMap = await getProgramTypes(
    chainId as AleoChainId,
    Array.from(programIdsForUnspentRecordsSet),
  )

  // Filter map to only include NFT programs
  const filteredProgramTypesMap = Object.fromEntries(
    Object.entries(programTypesMap).filter(([, value]) => value === 'nft'),
  )

  // Filter unspent records to only include records with programIds that are known to be NFT programs
  const nftLikeRecords = unspentRecordsForAddress.filter(
    record => record.programId in filteredProgramTypesMap,
  )

  const nftRecordData: INFTRecordData[] = []
  for (let i = 0; i < nftLikeRecords.length; i++) {
    const nftLikeRecord = nftLikeRecords[i]
    let invalidJSON = ''
    try {
      invalidJSON = await decryptRecord(viewKey, nftLikeRecord.ciphertext)
    } catch {
      console.log('Error decrypting record: ', nftLikeRecord)
      continue
    }
    const validJSON = formatJsonString(invalidJSON)
    const plainTextRecordAsJson = JSON.parse(validJSON)

    // nft-like record doesn't look like an nft
    if (!plainTextRecordAsJson.data || !plainTextRecordAsJson.edition) {
      continue
    }

    let bigIntString = ''
    let scalarString = ''

    try {
      // iterate through data1, data2, ... in plainText.data and convert to big int string
      // eslint-disable-next-line no-loop-func
      Object.keys(plainTextRecordAsJson.data).forEach((key: string) => {
        const u128Index = plainTextRecordAsJson.data[key].indexOf('u128')
        const bigNumberString: string = plainTextRecordAsJson.data[key].slice(
          0,
          u128Index,
        )
        const charValue = bigIntToString(BigInt(bigNumberString))
        bigIntString += charValue
      })

      const scalarIndex = plainTextRecordAsJson.edition.indexOf('scalar')
      scalarString = plainTextRecordAsJson.edition.slice(0, scalarIndex)
    } catch (e) {
      console.log(e)
    }

    // doesn't match nft-like record
    if (bigIntString === '' || scalarString === '') {
      continue
    }

    nftRecordData.push({
      recordId: nftLikeRecord.id,
      transactionId: nftLikeRecord.transactionId,
      programId: nftLikeRecord.programId,
      tokenId: bigIntString,
      timestamp: nftLikeRecord.timestampCreated,
      edition: scalarString,
    })
  }
  return nftRecordData
}

export async function fetchPublicNFTs(
  chainId: AleoChainId,
  address: string,
): Promise<INFT[]> {
  const NFTs = await getPublicNfts(chainId, address)
  const publicNFTs: INFT[] = []
  for (const nft of NFTs) {
    try {
      const nftJsonResponse = await fetch(
        'https://' + nft.baseUri + nft.tokenIdString,
      )
      const nftJsonInfo = JSON.parse(await nftJsonResponse.text())
      const scalarIndex = nft.edition.indexOf('scalar')
      const edition = nft.edition.slice(0, scalarIndex)

      publicNFTs.push({
        transactionId: nft.transactionId,
        tokenId: nft.tokenIdString,
        tokenIdRaw: nft.tokenId,
        programId: nft.programId,
        isPrivate: false,
        symbol: nft.symbol,
        edition: edition,
        timestamp: Number(nft.timestamp),
        collectionDescription: nftJsonInfo.collectionDescription,
        imageURI: nftJsonInfo.image,
        mintNumber: nftJsonInfo.mintNumber,
        collectionName: nftJsonInfo.collectionName,
        sourceLink: nftJsonInfo.sourceLink,
        attributes: nftJsonInfo.attributes,
      })
    } catch (e) {
      console.log('Error fetching public NFT info', e)
    }
  }

  return publicNFTs
}
