import { getHeight } from '@src/lib/aleo-chain/client'

import {
  completeOwnedRecords,
  finishInProgressSyncs,
  syncAllSpentRecords,
  syncOwnedRecords,
} from '@src/lib/aleo/activity/sync/sync'

import { setAccountCreationBlockHeight } from '@src/lib/aleo/activity/sync/account-creation'
import { AleoAccount, AleoAccountType, AleoChainId, AleoState } from './types'
import AsyncLock from 'async-lock'
import {
  syncPublicTransactions,
  syncTransactionsFromRecords,
  syncTransactionsWithoutRecords,
  updateDelegatedTransactions,
} from './activity/sync-local-transactions'
import { cancelTransactions } from './activity/transactions'
const lock = new AsyncLock()

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

class Sync {
  state?: AleoState
  lastHeight: number = 0
  getHeightFetchTimestamp: number = 0

  public updateState(state: AleoState) {
    const previousState = this.state
    this.state = state

    if (!previousState && this.state) {
      this.sync()
    }
  }

  async sync() {
    const state = this.state
    if (!state) {
      return
    }

    const accounts = state.accounts
    const networks = state.networks.filter(net => net.autoSync)
    const ownMnemonic = state.ownMnemonic

    if (
      accounts.length === 0 ||
      networks.length === 0 ||
      ownMnemonic === null
    ) {
      await sleep(2000)
      await this.sync()
    } else {
      const syncJobs = networks.map(net =>
        this.syncChain(net.id, accounts, ownMnemonic),
      )
      await Promise.all(syncJobs)
      await sleep(2000)
      await this.sync()
    }
  }

  private async syncRecords(chainId: string, keys: Keys[]) {
    const syncBatch = 2
    const blockBatchSize = 5_000
    try {
      await finishInProgressSyncs(chainId as AleoChainId, keys)
      await syncOwnedRecords(
        this.lastHeight,
        chainId as AleoChainId,
        keys,
        syncBatch,
        blockBatchSize,
      )
      await completeOwnedRecords(chainId as AleoChainId, keys)
      await syncAllSpentRecords(chainId as AleoChainId)
    } catch (e) {
      console.error(`Failed to sync records for chain: ${chainId}`, e)
    }
  }

  private async syncTransactions(
    chainId: string,
    accounts: AleoAccount[],
    currentBlock: number,
  ) {
    try {
      const delegatedTransactionTasks: Promise<void>[] = []
      for (let i = 0; i < accounts.length; i++) {
        delegatedTransactionTasks.push(
          updateDelegatedTransactions(chainId, accounts[i].publicKey),
        )
      }
      await Promise.all(delegatedTransactionTasks)

      const recordTasks: Promise<any>[] = []
      for (let i = 0; i < accounts.length; i++) {
        recordTasks.push(
          syncTransactionsFromRecords(
            accounts[i].publicKey,
            chainId,
            accounts[i].viewKey,
          ),
        )
      }
      await Promise.all(recordTasks)

      const transactionTasks: Promise<any>[] = []
      for (let i = 0; i < accounts.length; i++) {
        transactionTasks.push(
          syncTransactionsWithoutRecords(
            accounts[i].publicKey,
            chainId,
            accounts[i].viewKey,
          ),
        )
      }
      await Promise.all(transactionTasks)

      const publicTransactionTasks: Promise<void>[] = []
      for (let i = 0; i < accounts.length; i++) {
        transactionTasks.push(
          syncPublicTransactions(
            chainId,
            accounts[i].publicKey,
            accounts[i].viewKey,
            currentBlock,
          ),
        )
      }
      await Promise.all(publicTransactionTasks)
    } catch (e) {
      console.error('Failed to sync transactions from records', e)
    }
  }

  private async cancelFailedTransactions(chainId: string) {
    lock
      .acquire('cancel-all-failed-transactions', async () => {
        await cancelTransactions()
      })
      .catch(e => {
        console.error(`Failed to cancel failed transactions: ${chainId}`, e)
      })
  }

  private async syncAccountCreationBlockHeights(
    chainId: string,
    accounts: AleoAccount[],
    ownMnemonic: boolean,
    blockHeight: number,
  ) {
    try {
      const accountCreationBlockHeightTasks: Promise<any>[] = []
      for (let i = 0; i < accounts.length; i++) {
        const startBlockHeight =
          accounts[i].type === AleoAccountType.HD && !ownMnemonic
            ? blockHeight
            : 0
        accountCreationBlockHeightTasks.push(
          setAccountCreationBlockHeight(
            chainId,
            accounts[i].publicKey,
            startBlockHeight,
          ),
        )
      }
      await Promise.all(accountCreationBlockHeightTasks)
    } catch (e) {
      console.error('Failed to sync account creation block heights', e)
    }
  }

  async syncChain(
    chainId: string,
    accounts: AleoAccount[],
    ownMnemonic: boolean,
  ) {
    try {
      if ((Date.now() - this.getHeightFetchTimestamp) / 1000 >= 10) {
        this.lastHeight = await getHeight(chainId as AleoChainId)
        this.getHeightFetchTimestamp = Date.now()
      }
      const keys: Keys[] = accounts
        .map(a => {
          if (!a.privateKey || !a.viewKey) {
            return null
          }
          return { privateKey: a.privateKey, viewKey: a.viewKey }
        })
        .filter(k => k) as Keys[]

      if (keys.length === 0) {
        return
      }

      // We want to ensure newly created accounts get their block height set before trying to sync them
      await this.syncAccountCreationBlockHeights(
        chainId,
        accounts,
        ownMnemonic,
        this.lastHeight,
      )

      const syncRecordsTask = this.syncRecords(chainId, keys)
      const syncTransactionsTask = this.syncTransactions(
        chainId,
        accounts,
        this.lastHeight,
      )
      const cancelFailedTransactionsTask =
        this.cancelFailedTransactions(chainId)

      await Promise.all([
        syncRecordsTask,
        syncTransactionsTask,
        cancelFailedTransactionsTask,
      ])
    } catch (e) {
      // console.error(`Failed to sync chain: ${chainId}`, e)
    }
  }
}

export const AutoSync = new Sync()

export interface Keys {
  privateKey: string
  viewKey: string
}
