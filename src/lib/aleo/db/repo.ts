import * as SQLite from 'expo-sqlite/legacy'
import {
  IAccountCreationBlockHeight,
  IAccountToken,
  IDBPublicSync,
  IDBRecordSync,
  IDBSerialNumberSync,
  IKeyFile,
  IOwnedRecord,
  IPublicSync,
  IRecord,
  IRecordSync,
  ISerialNumberSync,
} from './types'
import {
  ITransaction,
  ITransactionStatus,
  ITransition,
  ITransitionStatus,
} from './transaction-types'
import { DB_NAME } from './setup'

const db = SQLite.openDatabase(DB_NAME)

interface ISQLQuery {
  sql: string
  params: any[]
}

const executeQuery = async (query: ISQLQuery): Promise<SQLite.SQLResultSet> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        query.sql,
        query.params,
        (_, results) => resolve(results),
        (_, error) => {
          if (error.message.includes('Error code 19')) {
            // For some reason error.code is undefined
            console.log('SQLITE_CONSTRAINT error, ignoring', error)
            resolve({ rows: { length: 0 } } as SQLite.SQLResultSet)
            return true
          }
          console.error('Error executing query:', error)
          reject(error)
          return false
        },
      )
    })
  })
}
const executeQueries = async (
  query: ISQLQuery[],
): Promise<SQLite.SQLResultSet[]> => {
  return new Promise((resolve, reject) => {
    const allResults: SQLite.SQLResultSet[] = []
    db.transaction(
      tx => {
        for (let i = 0; i < query.length; i++) {
          tx.executeSql(
            query[i].sql,
            query[i].params,
            (_, results) => allResults.push(results),
            (_, error) => {
              console.error('Error executing query:', error)
              reject(error)
              return false
            },
          )
        }
      },
      error => {
        console.error('Error executing query:', error)
        reject(error)
        return false
      },
      () => {
        resolve(allResults)
      },
    )
  })
}

export const RecordSyncsTable = {
  insertNew: async (recordSync: IRecordSync) => {
    const sql = `
      INSERT INTO RecordSyncs (
        chainId, address, startBlock, endBlock, page, rangeComplete
      ) VALUES (?, ?, ?, ?, ?, ?)
    `
    const query = {
      sql,
      params: [
        recordSync.chainId,
        recordSync.address,
        recordSync.startBlock,
        recordSync.endBlock,
        recordSync.page,
        recordSync.rangeComplete,
      ],
    }
    await executeQuery(query)
  },

  update: async (id: number, recordSync: IRecordSync | IDBRecordSync) => {
    const sql = `
      UPDATE RecordSyncs SET
        chainId = ?, address = ?, startBlock = ?, endBlock = ?, page = ?, rangeComplete = ?
      WHERE id = ?
    `
    const query = {
      sql,
      params: [
        recordSync.chainId,
        recordSync.address,
        recordSync.startBlock,
        recordSync.endBlock,
        recordSync.page,
        recordSync.rangeComplete,
        id,
      ],
    }
    await executeQuery(query)
  },

  getByChainId: async (chainId: string): Promise<IRecordSync[]> => {
    const sql = 'SELECT * FROM RecordSyncs WHERE chainId = ?'
    const query = {
      sql,
      params: [chainId],
    }
    const results = await executeQuery(query)
    const recordSyncs: IRecordSync[] = []
    for (let i = 0; i < results.rows.length; i++) {
      recordSyncs.push(results.rows.item(i) as IRecordSync)
    }

    return recordSyncs
  },

  getById: async (id: string): Promise<IRecordSync> => {
    const sql = 'SELECT * FROM RecordSyncs WHERE id = ?'
    const query = {
      sql,
      params: [id],
    }
    const results: SQLite.SQLResultSet = await executeQuery(query)
    return results.rows.item(0) as IRecordSync
  },

  getSyncsByCompletion: async (
    chainId: string,
    isRangeComplete: boolean,
  ): Promise<IDBRecordSync[]> => {
    const query = {
      sql: 'SELECT * FROM RecordSyncs WHERE chainId = ? AND rangeComplete = ?',
      params: [chainId, isRangeComplete],
    }
    const results = await executeQuery(query)
    const recordSyncs: IDBRecordSync[] = []
    for (let i = 0; i < results.rows.length; i++) {
      recordSyncs.push(results.rows.item(i) as IDBRecordSync)
    }

    return recordSyncs
  },

  getSyncsByAddressAndCompletion: async (
    chainId: string,
    address: string,
    isRangeComplete: boolean,
  ): Promise<IDBRecordSync[]> => {
    const query = {
      sql: 'SELECT * FROM RecordSyncs WHERE chainId = ? AND address = ? AND rangeComplete = ?',
      params: [chainId, address, isRangeComplete],
    }
    const results = await executeQuery(query)
    const recordSyncs: IDBRecordSync[] = []
    for (let i = 0; i < results.rows.length; i++) {
      recordSyncs.push(results.rows.item(i) as IDBRecordSync)
    }

    return recordSyncs
  },

  getSyncsForAddress: async (
    chainId: string,
    address: string,
  ): Promise<IDBRecordSync[]> => {
    const query = {
      sql: 'SELECT * FROM RecordSyncs WHERE chainId = ? AND address = ?',
      params: [chainId, address],
    }
    const results = await executeQuery(query)
    const recordSyncs: IDBRecordSync[] = []
    for (let i = 0; i < results.rows.length; i++) {
      recordSyncs.push(results.rows.item(i) as IDBRecordSync)
    }

    return recordSyncs
  },

  deleteByAddressAndChainId: async (address: string, chainId: string) => {
    const query = {
      sql: 'DELETE FROM RecordSyncs WHERE chainId = ? AND address = ?',
      params: [chainId, address],
    }
    await executeQuery(query)
  },

  deleteAll: async () => {
    const query = {
      sql: 'DELETE FROM RecordSyncs',
      params: [],
    }
    await executeQuery(query)
  },
}

export const RecordsTable = {
  put: async (record: IRecord) => {
    const sql = `
      REPLACE INTO Records (
        id, chainId, address, microcredits, blockHeightCreated, blockIdCreated,
        timestampCreated, serialNumber, ciphertext, programId, blockHeightSpent,
        blockIdSpent, blockHash, transactionId, transitionId, transactionIdSpent,
        transitionIdSpent, timestampSpent, spent, locallySyncedTransactions, locked,
        outputIndex, functionName
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    const query = {
      sql,
      params: [
        record.id,
        record.chainId,
        record.address,
        record.microcredits?.toString(),
        record.blockHeightCreated.toString(),
        record.blockIdCreated.toString(),
        record.timestampCreated,
        record.serialNumber,
        record.ciphertext,
        record.programId,
        record.blockHeightSpent.toString(),
        record.blockIdSpent.toString(),
        record.blockHash,
        record.transactionId,
        record.transitionId,
        record.transactionIdSpent,
        record.transitionIdSpent,
        record.timestampSpent,
        record.spent,
        record.locallySyncedTransactions,
        record.locked,
        record.outputIndex,
        record.functionName,
      ],
    }
    await executeQuery(query)
  },

  getByChainId: async (chainId: string): Promise<IRecord[]> => {
    const sql = 'SELECT * FROM Records WHERE chainId = ?'
    const query = {
      sql,
      params: [chainId],
    }
    const results = await executeQuery(query)
    const records: IRecord[] = []
    for (let i = 0; i < results.rows.length; i++) {
      records.push(results.rows.item(i) as IRecord)
    }

    return records
  },

  getByChainIdAndAddress: async (
    chainId: string,
    address: string,
  ): Promise<IRecord[]> => {
    const sql = 'SELECT * FROM Records WHERE chainId = ? AND address = ?'
    const query = {
      sql,
      params: [chainId, address],
    }
    const results = await executeQuery(query)
    const records: IRecord[] = []
    for (let i = 0; i < results.rows.length; i++) {
      const record = results.rows.item(i) as IRecord
      // convert microcredits to bigint as database stores as an integer (automatically converted to a Number)
      if (record.microcredits) {
        record.microcredits = BigInt(record.microcredits)
      }
      records.push(record)
    }

    return records
  },

  getById: async (id: string): Promise<IRecord> => {
    const sql = 'SELECT * FROM Records WHERE id = ?'
    const query = {
      sql,
      params: [id],
    }
    const results: SQLite.SQLResultSet = await executeQuery(query)
    return results.rows.item(0) as IRecord
  },

  getUnspent: async (chainId: string): Promise<IRecord[]> => {
    const query = {
      sql: "SELECT * FROM Records WHERE chainId = ? AND (spent = 0 OR spent = 'false')",
      params: [chainId],
    }
    const results = await executeQuery(query)
    const records: IRecord[] = []
    for (let i = 0; i < results.rows.length; i++) {
      records.push(results.rows.item(i) as IRecord)
    }

    return records
  },

  deleteByAddressAndChainId: async (address: string, chainId: string) => {
    const query = {
      sql: 'DELETE FROM Records WHERE chainId = ? AND address = ?',
      params: [chainId, address],
    }
    await executeQuery(query)
  },

  deleteAll: async () => {
    const query = {
      sql: 'DELETE FROM Records',
      params: [],
    }
    await executeQuery(query)
  },

  getByLocallySyncedTransactions: async (
    chainId: string,
    address: string,
    locallySyncedTransactions: number,
  ): Promise<IRecord[]> => {
    const query = {
      sql: 'SELECT * FROM Records WHERE chainId = ? AND address = ? AND locallySyncedTransactions = ?',
      params: [chainId, address, locallySyncedTransactions],
    }
    const results = await executeQuery(query)
    const records: IRecord[] = []
    for (let i = 0; i < results.rows.length; i++) {
      records.push(results.rows.item(i) as IRecord)
    }

    return records
  },

  getLockedRecords: async (): Promise<IRecord[]> => {
    const query = {
      sql: "SELECT * FROM Records WHERE (locked = 1 OR locked = 'true')",
      params: [],
    }
    const results = await executeQuery(query)
    const records: IRecord[] = []
    for (let i = 0; i < results.rows.length; i++) {
      records.push(results.rows.item(i) as IRecord)
    }

    return records
  },

  updateRecordLockState: async (recordIds: string[], lock: boolean = true) => {
    const newLockedValue = lock ? 1 : 0
    const query = {
      sql: `UPDATE Records SET locked = ${newLockedValue} WHERE id IN (?)`,
      params: [recordIds],
    }
    await executeQuery(query)
  },
}

export const AccountTokensTable = {
  insertNew: async (accountToken: IAccountToken) => {
    const sql = `
      INSERT INTO AccountTokens (
        type, chainId, account, tokenSlug, status, addedAt, latestBalance, latestUSDBalance
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
    const query = {
      sql,
      params: [
        accountToken.type,
        accountToken.chainId,
        accountToken.account,
        accountToken.tokenSlug,
        accountToken.status,
        accountToken.addedAt,
        accountToken.latestBalance,
        accountToken.latestUSDBalance,
      ],
    }
    await executeQuery(query)
  },

  update: async (id: number, accountToken: IAccountToken) => {
    const sql = `
      UPDATE AccountTokens SET
        type = ?, chainId = ?, account = ?, token_slug = ?, status = ?, addedAt = ?, latestBalance = ?, latestUSDBalance = ?
      WHERE id = ?
    `
    const query = {
      sql,
      params: [
        accountToken.type,
        accountToken.chainId,
        accountToken.account,
        accountToken.tokenSlug,
        accountToken.status,
        accountToken.addedAt,
        accountToken.latestBalance,
        accountToken.latestUSDBalance,
        id,
      ],
    }
    await executeQuery(query)
  },

  getByChainId: async (chainId: string): Promise<IAccountToken[]> => {
    const sql = 'SELECT * FROM AccountTokens WHERE chainId = ?'
    const query = {
      sql,
      params: [chainId],
    }
    const results = await executeQuery(query)
    const accountTokens: IAccountToken[] = []
    for (let i = 0; i < results.rows.length; i++) {
      accountTokens.push(results.rows.item(i) as IAccountToken)
    }

    return accountTokens
  },

  getById: async (id: string): Promise<IAccountToken> => {
    const sql = 'SELECT * FROM AccountTokens WHERE id = ?'
    const query = {
      sql,
      params: [id],
    }
    const results: SQLite.SQLResultSet = await executeQuery(query)
    return results.rows.item(0) as IAccountToken
  },
}

export const SerialNumberSyncTimesTable = {
  insertNew: async (serialNumberSyncTime: ISerialNumberSync) => {
    const sql = `
      INSERT INTO SerialNumberSyncTimes (
        chainId, page
      ) VALUES (?, ?)
    `
    const query = {
      sql,
      params: [serialNumberSyncTime.chainId, serialNumberSyncTime.page],
    }
    await executeQuery(query)
  },

  update: async (id: number, serialNumberSyncTime: ISerialNumberSync) => {
    const sql = `
      UPDATE SerialNumberSyncTimes SET
        chainId = ?, page = ?
      WHERE id = ?
    `
    const query = {
      sql,
      params: [serialNumberSyncTime.chainId, serialNumberSyncTime.page, id],
    }
    await executeQuery(query)
  },

  getByChainId: async (
    chainId: string,
  ): Promise<IDBSerialNumberSync | null> => {
    const sql = 'SELECT * FROM SerialNumberSyncTimes WHERE chainId = ?'
    const query = {
      sql,
      params: [chainId],
    }
    const results = await executeQuery(query)

    return (results.rows.item(0) as IDBSerialNumberSync) ?? null
  },

  getById: async (id: string): Promise<IDBSerialNumberSync | null> => {
    const sql = 'SELECT * FROM SerialNumberSyncTimes WHERE id = ?'
    const query = {
      sql,
      params: [id],
    }
    const results: SQLite.SQLResultSet = await executeQuery(query)
    return (results.rows.item(0) as IDBSerialNumberSync) ?? null
  },

  updatePageByChainId: async (chainId: string, page: number) => {
    const sql = 'UPDATE SerialNumberSyncTimes SET page = ? WHERE chainId = ?'
    const query = {
      sql,
      params: [page, chainId],
    }
    await executeQuery(query)
  },
}

export const TransitionsTable = {
  put: async (transition: ITransition) => {
    const replaceQuery = {
      sql: `
        REPLACE INTO Transitions (
          id, transitionId, transactionDbId, [index], address, chainId, program, functionName, status, inputsJson, outputsJson, initiatedAt, completedAt, json, isFee
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      params: [
        transition.id,
        transition.transitionId,
        transition.transactionDbId,
        transition.index,
        transition.address,
        transition.chainId,
        transition.program,
        transition.functionName,
        transition.status,
        transition.inputsJson,
        transition.outputsJson,
        transition.initiatedAt,
        transition.completedAt,
        transition.json,
        transition.isFee,
      ],
    }
    const queries = [
      replaceQuery,
      {
        sql: 'DELETE FROM TransitionsInputRecordIds WHERE transitionDbId = ?',
        params: [transition.id],
      },
      {
        sql: 'DELETE FROM TransitionsOutputRecordIds WHERE transitionDbId = ?',
        params: [transition.id],
      },
    ]

    // populate the input and output record ids
    const insertInputRecordIdsSql = `
      INSERT INTO TransitionsInputRecordIds (
        transitionDbId, inputRecordId
      ) VALUES (?, ?)
    `
    const insertOutputRecordIdsSql = `
      INSERT INTO TransitionsOutputRecordIds (
        transitionDbId, outputRecordId
      ) VALUES (?, ?)
    `
    for (let i = 0; i < transition.inputRecordIds.length; i++) {
      queries.push({
        sql: insertInputRecordIdsSql,
        params: [transition.id, transition.inputRecordIds[i]],
      })
    }
    for (let i = 0; i < transition.outputRecordIds.length; i++) {
      queries.push({
        sql: insertOutputRecordIdsSql,
        params: [transition.id, transition.outputRecordIds[i]],
      })
    }
    await executeQueries(queries)
  },

  getByChainId: async (chainId: string): Promise<ITransition[]> => {
    const query = {
      sql: 'SELECT * FROM Transitions WHERE chainId = ?',
      params: [chainId],
    }
    const res = await executeQuery(query)
    const transitions: ITransition[] = []
    for (let i = 0; i < res.rows.length; i++) {
      const transition = res.rows.item(i) as ITransition

      const ids = await getRecordIdsForTransition(transition.id)
      transition.inputRecordIds = ids.inputIds
      transition.outputRecordIds = ids.outputIds

      transitions.push(transition)
    }

    return transitions
  },

  getById: async (id: string): Promise<ITransition | null> => {
    const query = {
      sql: 'SELECT * FROM Transitions WHERE id = ?',
      params: [id],
    }
    const res = await executeQuery(query)
    const transition = res.rows.item(0) as ITransition
    if (!transition) return null

    const ids = await getRecordIdsForTransition(transition.id)
    transition.inputRecordIds = ids.inputIds
    transition.outputRecordIds = ids.outputIds

    return transition
  },

  getByTransitionId: async (
    transitionId: string,
    chainId: string,
    address: string,
  ): Promise<ITransition | null> => {
    const query = {
      sql: 'SELECT * FROM Transitions WHERE transitionId = ? AND chainId = ? AND address = ?',
      params: [transitionId, chainId, address],
    }
    const res = await executeQuery(query)
    const transition = res.rows.item(0) as ITransition
    if (!transition) return null

    const ids = await getRecordIdsForTransition(transition.id)
    transition.inputRecordIds = ids.inputIds
    transition.outputRecordIds = ids.outputIds

    return transition ?? null
  },

  getNonFailedNonFeeTransitionsByTransactionId: async (
    transactionDbId: string,
  ): Promise<ITransition[]> => {
    const query = {
      sql: "SELECT * FROM Transitions WHERE transactionDbId = ? AND status != ? AND (isFee = 0 OR isFee = 'false')",
      params: [transactionDbId, ITransitionStatus.Failed],
    }
    const res = await executeQuery(query)
    const transitions: ITransition[] = []
    for (let i = 0; i < res.rows.length; i++) {
      const transition = res.rows.item(i) as ITransition

      const ids = await getRecordIdsForTransition(transition.id)
      transition.inputRecordIds = ids.inputIds
      transition.outputRecordIds = ids.outputIds

      transitions.push(transition)
    }

    return transitions
  },

  getByTransactionDbId: async (
    transactionDbId: string,
  ): Promise<ITransition[]> => {
    const query = {
      sql: 'SELECT * FROM Transitions WHERE transactionDbId = ?',
      params: [transactionDbId],
    }
    const res = await executeQuery(query)
    const transitions: ITransition[] = []
    for (let i = 0; i < res.rows.length; i++) {
      const transition = res.rows.item(i) as ITransition

      const ids = await getRecordIdsForTransition(transition.id)
      transition.inputRecordIds = ids.inputIds
      transition.outputRecordIds = ids.outputIds

      transitions.push(transition)
    }

    return transitions
  },

  getByTransactionDbIds: async (transactionDbIds: string[]) => {
    const query = {
      sql: `SELECT * FROM Transitions WHERE transactionDbId IN (${transactionDbIds
        .map(() => '?')
        .join(',')}) AND (isFee = 0 OR isFee = 'false')`,
      params: transactionDbIds,
    }
    const res = await executeQuery(query)
    const transitions: ITransition[] = []
    for (let i = 0; i < res.rows.length; i++) {
      const transition = res.rows.item(i) as ITransition

      const ids = await getRecordIdsForTransition(transition.id)
      transition.inputRecordIds = ids.inputIds
      transition.outputRecordIds = ids.outputIds

      transitions.push(transition)
    }

    return transitions
  },

  deleteByAddressAndChainId: async (address: string, chainId: string) => {
    const query = {
      sql: 'DELETE FROM Transitions WHERE chainId = ? AND address = ?',
      params: [chainId, address],
    }
    await executeQuery(query)
  },

  deleteAll: async () => {
    const query = {
      sql: 'DELETE FROM Transitions',
      params: [],
    }
    await executeQuery(query)
  },
}

interface InputAndOutputIds {
  inputIds: string[]
  outputIds: string[]
}

const getRecordIdsForTransition = async (
  transitionDbId: string,
): Promise<InputAndOutputIds> => {
  // get input record ids
  const getInputRecordsQuery = {
    sql: 'SELECT * FROM TransitionsInputRecordIds WHERE transitionDbId = ?',
    params: [transitionDbId],
  }
  const getInputRecordsRes = await executeQuery(getInputRecordsQuery)
  const inputRecordIds: string[] = []
  for (let i = 0; i < getInputRecordsRes.rows.length; i++) {
    inputRecordIds.push(getInputRecordsRes.rows.item(i).inputRecordId)
  }

  // get output record ids
  const getOutputRecordsQuery = {
    sql: 'SELECT * FROM TransitionsOutputRecordIds WHERE transitionDbId = ?',
    params: [transitionDbId],
  }
  const getOutputRecordsRes = await executeQuery(getOutputRecordsQuery)
  const outputRecordIds: string[] = []
  for (let i = 0; i < getOutputRecordsRes.rows.length; i++) {
    outputRecordIds.push(getOutputRecordsRes.rows.item(i).outputRecordId)
  }

  return { inputIds: inputRecordIds, outputIds: outputRecordIds }
}

export const TransactionsTable = {
  put: async (transaction: ITransaction) => {
    const replaceQuery = {
      sql: `REPLACE INTO Transactions (
        id, [type], transactionId, [address], chainId, [status], initiatedAt, onlyExecute, processingStartedAt, completedAt, 
        finalizedAt, blockHeight, imports, fee, feeId, [json], displayMessage, displayIcon, deployedProgramId, deployedProgram, 
        deployedEdition, authorization, feeAuthorization, delegated, requestId
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?
      )`,
      params: [
        transaction.id,
        transaction.type,
        transaction.transactionId,
        transaction.address,
        transaction.chainId,
        transaction.status,
        transaction.initiatedAt,
        transaction.onlyExecute,
        transaction.processingStartedAt,
        transaction.completedAt,
        transaction.finalizedAt,
        transaction.blockHeight?.toString(),
        transaction.imports,
        transaction.fee.toString(),
        transaction.feeId,
        transaction.json,
        transaction.displayMessage,
        transaction.displayIcon,
        transaction.deployedProgramId,
        transaction.deployedProgram,
        transaction.deployedEdition,
        transaction.authorization,
        transaction.feeAuthorization,
        transaction.delegated,
        transaction.requestId,
      ],
    }
    const queries = [
      replaceQuery,
      {
        sql: 'DELETE FROM TransactionTransitionIds WHERE transactionDbId = ?',
        params: [transaction.id],
      },
    ]

    // populate the transition ids
    const insertTransitionIdsSql = `
      REPLACE INTO TransactionTransitionIds (
        transactionDbId, transitionDbId
      ) VALUES (?, ?)
    `
    for (let i = 0; i < transaction.transitionIds.length; i++) {
      queries.push({
        sql: insertTransitionIdsSql,
        params: [transaction.id, transaction.transitionIds[i]],
      })
    }
    await executeQueries(queries)
  },

  getByChainId: async (chainId: string): Promise<ITransaction[]> => {
    const query = {
      sql: 'SELECT * FROM Transactions WHERE chainId = ?',
      params: [chainId],
    }
    const res = await executeQuery(query)
    const transactions: ITransaction[] = []
    for (let i = 0; i < res.rows.length; i++) {
      const transaction = res.rows.item(i) as ITransaction

      const transitionIds = await getTransitionIdsForTransaction(transaction.id)
      transaction.transitionIds = transitionIds

      transactions.push(transaction)
    }

    return transactions
  },

  getById: async (id: string): Promise<ITransaction | null> => {
    const query = {
      sql: 'SELECT * FROM Transactions WHERE id = ?',
      params: [id],
    }
    const res = await executeQuery(query)
    const transaction = res.rows.item(0) as ITransaction
    if (!transaction) return null

    const transitionIds = await getTransitionIdsForTransaction(transaction.id)
    transaction.transitionIds = transitionIds

    return transaction
  },

  getCompletedDelegated: async (
    chainId: string,
    address: string,
  ): Promise<ITransaction[]> => {
    const query = {
      sql: "SELECT * FROM Transactions WHERE chainId = ? AND address = ? AND status = ? AND (delegated = 1 OR delegated = 'true')",
      params: [chainId, address, ITransactionStatus.Completed],
    }
    const res = await executeQuery(query)
    const transactions: ITransaction[] = []
    for (let i = 0; i < res.rows.length; i++) {
      const transaction = res.rows.item(i) as ITransaction

      const transitionIds = await getTransitionIdsForTransaction(transaction.id)
      transaction.transitionIds = transitionIds

      transactions.push(transaction)
    }

    return transactions
  },

  getCompleted: async (
    chainId: string,
    address: string,
  ): Promise<ITransaction[]> => {
    const query = {
      sql: 'SELECT * FROM Transactions WHERE chainId = ? AND address = ? AND status = ?',
      params: [chainId, address, ITransactionStatus.Completed],
    }
    const res = await executeQuery(query)
    const transactions: ITransaction[] = []
    for (let i = 0; i < res.rows.length; i++) {
      const transaction = res.rows.item(i) as ITransaction

      const transitionIds = await getTransitionIdsForTransaction(transaction.id)
      transaction.transitionIds = transitionIds

      transactions.push(transaction)
    }

    return transactions
  },

  getByTransactionId: async (
    chainId: string,
    address: string,
    transactionId: string,
  ): Promise<ITransaction | null> => {
    const query = {
      sql: 'SELECT * FROM Transactions WHERE chainId = ? AND address = ? AND transactionId = ?',
      params: [chainId, address, transactionId],
    }
    const res = await executeQuery(query)
    const transaction = res.rows.item(0) as ITransaction
    if (!transaction) return null

    const transitionIds = await getTransitionIdsForTransaction(transaction.id)
    transaction.transitionIds = transitionIds

    return transaction
  },

  getAnyInStatuses: async (
    states: ITransactionStatus[],
  ): Promise<ITransaction[]> => {
    const query = {
      sql: `SELECT * FROM Transactions WHERE status IN (${states
        .map(() => '?')
        .join(',')})`,
      params: states,
    }
    const res = await executeQuery(query)
    const transactions: ITransaction[] = []
    for (let i = 0; i < res.rows.length; i++) {
      const transaction = res.rows.item(i) as ITransaction

      const transitionIds = await getTransitionIdsForTransaction(transaction.id)
      transaction.transitionIds = transitionIds

      transactions.push(transaction)
    }

    return transactions
  },

  getByStatus: async (status: ITransactionStatus): Promise<ITransaction[]> => {
    const query = {
      sql: 'SELECT * FROM Transactions WHERE status = ?',
      params: [status],
    }
    const res = await executeQuery(query)
    const transactions: ITransaction[] = []
    for (let i = 0; i < res.rows.length; i++) {
      const transaction = res.rows.item(i) as ITransaction

      const transitionIds = await getTransitionIdsForTransaction(transaction.id)
      transaction.transitionIds = transitionIds

      transactions.push(transaction)
    }

    return transactions
  },

  getFailedBroadcastTransactions: async (
    timeToWait: number,
  ): Promise<ITransaction[]> => {
    const query = {
      sql: 'SELECT * FROM Transactions WHERE status = ? AND processingStartedAt IS NOT NULL AND processingStartedAt < ?',
      params: [ITransactionStatus.Completed, Date.now() - timeToWait],
    }
    const res = await executeQuery(query)
    const transactions: ITransaction[] = []
    for (let i = 0; i < res.rows.length; i++) {
      const transaction = res.rows.item(i) as ITransaction
      console.log(
        ' failed broadcast transaction',
        transaction.processingStartedAt,
        Date.now() - timeToWait,
      )

      const transitionIds = await getTransitionIdsForTransaction(transaction.id)
      transaction.transitionIds = transitionIds

      transactions.push(transaction)
    }

    return transactions
  },

  getCompletedAndFinalizedTransactions: async (
    chainId: string,
    address: string,
  ): Promise<ITransaction[]> => {
    const query = {
      sql: `
        SELECT * FROM Transactions
        WHERE chainId = ? AND address = ? AND (onlyExecute = 0 OR onlyExecute = 'false') AND status IN (?, ?, ?)`,
      params: [
        chainId,
        address,
        ITransactionStatus.Completed,
        ITransactionStatus.Finalized,
        ITransactionStatus.Rejected,
      ],
    }
    const res = await executeQuery(query)
    const transactions: ITransaction[] = []
    for (let i = 0; i < res.rows.length; i++) {
      const transaction = res.rows.item(i) as ITransaction

      const transitionIds = await getTransitionIdsForTransaction(transaction.id)
      transaction.transitionIds = transitionIds

      transactions.push(transaction)
    }

    return transactions
  },

  deleteByAddressAndChainId: async (address: string, chainId: string) => {
    const query = {
      sql: 'DELETE FROM Transactions WHERE chainId = ? AND address = ?',
      params: [chainId, address],
    }
    await executeQuery(query)
  },

  deleteAll: async () => {
    const query = {
      sql: 'DELETE FROM Transactions',
      params: [],
    }
    await executeQuery(query)
  },
}

const getTransitionIdsForTransaction = async (
  transactionDbId: string,
): Promise<string[]> => {
  const query = {
    sql: 'SELECT * FROM TransactionTransitionIds WHERE transactionDbId = ?',
    params: [transactionDbId],
  }
  const res = await executeQuery(query)
  const transitionIds: string[] = []
  for (let i = 0; i < res.rows.length; i++) {
    transitionIds.push(res.rows.item(i).transitionDbId)
  }

  return transitionIds
}

export const OwnedRecordsTable = {
  put: async (ownedRecord: IOwnedRecord) => {
    const query = {
      sql: 'REPLACE INTO OwnedRecords (id, chainId, address, transitionId, outputIndex, synced) VALUES (?, ?, ?, ?, ?, ?)',
      params: [
        ownedRecord.id,
        ownedRecord.chainId,
        ownedRecord.address,
        ownedRecord.transitionId,
        ownedRecord.outputIndex,
        ownedRecord.synced,
      ],
    }
    await executeQuery(query)
  },

  getByChainId: async (chainId: string): Promise<IOwnedRecord[]> => {
    const query = {
      sql: 'SELECT * FROM OwnedRecords WHERE chainId = ?',
      params: [chainId],
    }
    const res = await executeQuery(query)
    const ownedRecords: IOwnedRecord[] = []
    for (let i = 0; i < res.rows.length; i++) {
      ownedRecords.push(res.rows.item(i) as IOwnedRecord)
    }
    return ownedRecords
  },

  getById: async (id: string): Promise<IOwnedRecord> => {
    const query = {
      sql: 'SELECT * FROM OwnedRecords WHERE id = ?',
      params: [id],
    }
    const res = await executeQuery(query)
    return res.rows.item(0) as IOwnedRecord
  },

  deleteById: async (id: string) => {
    const query = {
      sql: 'DELETE FROM OwnedRecords WHERE id = ?',
      params: [id],
    }
    await executeQuery(query)
  },

  deleteByAddressAndChainId: async (address: string, chainId: string) => {
    const query = {
      sql: 'DELETE FROM OwnedRecords WHERE address = ? AND chainId = ?',
      params: [address, chainId],
    }
    await executeQuery(query)
  },

  deleteAll: async () => {
    const query = {
      sql: 'DELETE FROM OwnedRecords',
      params: [],
    }
    await executeQuery(query)
  },

  getUnsynced: async (chainId: string): Promise<IOwnedRecord[]> => {
    const query = {
      sql: "SELECT * FROM OwnedRecords WHERE chainId = ? AND (synced = 0 OR synced = 'false')",
      params: [chainId],
    }
    const res = await executeQuery(query)
    const ownedRecords: IOwnedRecord[] = []
    for (let i = 0; i < res.rows.length; i++) {
      ownedRecords.push(res.rows.item(i) as IOwnedRecord)
    }
    return ownedRecords
  },
}

export const AccountCreationBlockHeightsTable = {
  insertNew: async (
    accountCreationBlockHeight: IAccountCreationBlockHeight,
  ) => {
    const query = {
      sql: 'INSERT INTO AccountCreationBlockHeights (chainId, address, blockHeight) VALUES (?, ?, ?)',
      params: [
        accountCreationBlockHeight.chainId,
        accountCreationBlockHeight.address,
        accountCreationBlockHeight.blockHeight,
      ],
    }
    await executeQuery(query)
  },

  update: async (
    id: number,
    accountCreationBlockHeight: IAccountCreationBlockHeight,
  ) => {
    const query = {
      sql: 'UPDATE AccountCreationBlockHeights SET chainId = ?, address = ?, blockHeight = ? WHERE id = ?',
      params: [
        accountCreationBlockHeight.chainId,
        accountCreationBlockHeight.address,
        accountCreationBlockHeight.blockHeight,
        id,
      ],
    }
    await executeQuery(query)
  },

  getByChainId: async (
    chainId: string,
  ): Promise<IAccountCreationBlockHeight[]> => {
    const query = {
      sql: 'SELECT * FROM AccountCreationBlockHeights WHERE chainId = ?',
      params: [chainId],
    }
    const res = await executeQuery(query)
    const accountCreationBlockHeights: IAccountCreationBlockHeight[] = []
    for (let i = 0; i < res.rows.length; i++) {
      accountCreationBlockHeights.push(
        res.rows.item(i) as IAccountCreationBlockHeight,
      )
    }
    return accountCreationBlockHeights
  },

  getByChainIdAndAddress: async (
    chainId: string,
    address: string,
  ): Promise<IAccountCreationBlockHeight | null> => {
    const query = {
      sql: 'SELECT * FROM AccountCreationBlockHeights WHERE chainId = ? AND address = ?',
      params: [chainId, address],
    }
    const res = await executeQuery(query)
    return res.rows.item(0) as IAccountCreationBlockHeight | null
  },

  getById: async (id: string): Promise<IAccountCreationBlockHeight> => {
    const query = {
      sql: 'SELECT * FROM AccountCreationBlockHeights WHERE id = ?',
      params: [id],
    }
    const res = await executeQuery(query)
    return res.rows.item(0) as IAccountCreationBlockHeight
  },
}

export const KeyFilesTable = {
  insertNew: async (keyFile: IKeyFile) => {
    const query = {
      sql: 'INSERT INTO KeyFiles (name, bytes, sourceType, lastUsed, url, functionName) VALUES (?, ?, ?, ?, ?, ?)',
      params: [
        keyFile.name,
        keyFile.bytes,
        keyFile.sourceType,
        keyFile.lastUsed,
        keyFile.url,
        keyFile.functionName,
      ],
    }
    await executeQuery(query)
  },

  update: async (id: number, keyFile: IKeyFile) => {
    const query = {
      sql: 'UPDATE KeyFiles SET name = ?, bytes = ?, sourceType = ?, lastUsed = ?, url = ?, functionName = ? WHERE id = ?',
      params: [
        keyFile.name,
        keyFile.bytes,
        keyFile.sourceType,
        keyFile.lastUsed,
        keyFile.url,
        keyFile.functionName,
        id,
      ],
    }
    await executeQuery(query)
  },

  getByChainId: async (chainId: string): Promise<IKeyFile[]> => {
    const query = {
      sql: 'SELECT * FROM KeyFiles WHERE chainId = ?',
      params: [chainId],
    }
    const res = await executeQuery(query)
    const keyFiles: IKeyFile[] = []
    for (let i = 0; i < res.rows.length; i++) {
      keyFiles.push(res.rows.item(i) as IKeyFile)
    }
    return keyFiles
  },

  getById: async (id: string): Promise<IKeyFile> => {
    const query = {
      sql: 'SELECT * FROM KeyFiles WHERE id = ?',
      params: [id],
    }
    const res = await executeQuery(query)
    return res.rows.item(0) as IKeyFile
  },
}

export const PublicSyncsTable = {
  insertNew: async (publicSync: IPublicSync) => {
    const query = {
      sql: 'INSERT INTO PublicSyncs (chainId, address, startBlock, endBlock, page, rangeComplete) VALUES (?, ?, ?, ?, ?, ?)',
      params: [
        publicSync.chainId,
        publicSync.address,
        publicSync.startBlock,
        publicSync.endBlock,
        publicSync.page,
        publicSync.rangeComplete,
      ],
    }
    await executeQuery(query)
  },

  update: async (id: number, publicSync: IPublicSync) => {
    const query = {
      sql: 'UPDATE PublicSyncs SET chainId = ?, address = ?, startBlock = ?, endBlock = ?, page = ?, rangeComplete = ? WHERE id = ?',
      params: [
        publicSync.chainId,
        publicSync.address,
        publicSync.startBlock,
        publicSync.endBlock,
        publicSync.page,
        publicSync.rangeComplete,
        id,
      ],
    }
    await executeQuery(query)
  },

  getByChainId: async (chainId: string): Promise<IDBPublicSync[]> => {
    const query = {
      sql: 'SELECT * FROM PublicSyncs WHERE chainId = ?',
      params: [chainId],
    }
    const res = await executeQuery(query)
    const publicSyncs: IDBPublicSync[] = []
    for (let i = 0; i < res.rows.length; i++) {
      publicSyncs.push(res.rows.item(i) as IDBPublicSync)
    }
    return publicSyncs
  },

  getById: async (id: string): Promise<IDBPublicSync> => {
    const query = {
      sql: 'SELECT * FROM PublicSyncs WHERE id = ?',
      params: [id],
    }
    const res = await executeQuery(query)
    return res.rows.item(0) as IDBPublicSync
  },

  getByChainIdAndAddress: async (
    chainId: string,
    address: string,
  ): Promise<IDBPublicSync[]> => {
    const query = {
      sql: 'SELECT * FROM PublicSyncs WHERE chainId = ? AND address = ?',
      params: [chainId, address],
    }
    const res = await executeQuery(query)
    const publicSyncs: IDBPublicSync[] = []
    for (let i = 0; i < res.rows.length; i++) {
      publicSyncs.push(res.rows.item(i) as IDBPublicSync)
    }
    return publicSyncs
  },

  deleteByAddressAndChainId: async (address: string, chainId: string) => {
    const query = {
      sql: 'DELETE FROM PublicSyncs WHERE chainId = ? AND address = ?',
      params: [chainId, address],
    }
    await executeQuery(query)
  },

  deleteAll: async () => {
    const query = {
      sql: 'DELETE FROM PublicSyncs',
      params: [],
    }
    await executeQuery(query)
  },
}
