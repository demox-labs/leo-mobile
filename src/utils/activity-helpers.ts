import { AleoChainId } from '@src/lib/aleo'
import { ActivityType, IActivity } from '@src/types/activities'
import { formatBigInt } from './money'
import {
  getCompletedAndFinalizedTransactions,
  getUncompletedTransactions,
} from '@src/lib/aleo/activity/transactions'
import { ALEO_DECIMALS } from '@src/lib/fiat-currency/consts'
import { ALEO_EXPLORER_TRANSACTION_URL } from '@src/lib/aleo-chain/client'
import {
  ITransactionIcon,
  ITransactionStatus,
  formatTransactionStatus,
} from '@src/lib/aleo/db/transaction-types'

const getTokenByTransactionType = (type: ITransactionIcon) => {
  switch (type) {
    case 'SEND':
    case 'RECEIVE':
    case 'CONVERT_PRIVATE_TOKEN':
    case 'CONVERT_PUBLIC_TOKEN':
      return 'ALEO'
    default:
      return ''
  }
}

export async function fetchTransactionsAsActivities(
  chainId: AleoChainId,
  address: string,
  programId?: string | null,
  offset?: number,
  limit?: number,
): Promise<IActivity[]> {
  const transactions = await getCompletedAndFinalizedTransactions(
    address,
    chainId,
    programId,
    offset,
    limit,
  )
  const activities = transactions.map(tx => {
    const fee =
      tx.fee > BigInt(0) ? formatBigInt(tx.fee, ALEO_DECIMALS) : undefined
    const activity = {
      key: `completed-${tx.id}`,
      address: tx.address,
      timestamp: tx.finalizedAt || tx.completedAt,
      message: tx.displayMessage,
      type: ActivityType.CompletedTransaction,
      explorerLink: tx.transactionId
        ? `${ALEO_EXPLORER_TRANSACTION_URL}${tx.transactionId}`
        : undefined,
      transactionIcon: tx.displayIcon,
      fee,
      txId: tx.id,
      token: getTokenByTransactionType(tx.displayIcon),
    } as IActivity

    if (tx.status === ITransactionStatus.Completed)
      activity.secondaryMessage = 'Waiting for confirmation...'

    return activity
  })
  return activities
}

export async function fetchPendingTransactionsAsActivities(
  chainId: AleoChainId,
  address: string,
): Promise<IActivity[]> {
  const pendingTransactions = await getUncompletedTransactions(address, chainId)
  const activities = pendingTransactions.map(tx => {
    const fee =
      tx.fee > BigInt(0) ? formatBigInt(tx.fee, ALEO_DECIMALS) : undefined
    const activityType =
      tx.status !== ITransactionStatus.Queued
        ? ActivityType.ProcessingTransaction
        : ActivityType.PendingTransaction
    return {
      key: `pending-${tx.id}`,
      address: tx.address,
      secondaryMessage: formatTransactionStatus(tx.status),
      timestamp: tx.initiatedAt,
      message: tx.displayMessage || 'Generating transaction',
      type: activityType,
      fee,
      txId: tx.id,
      token: getTokenByTransactionType(tx.displayIcon),
    }
  })
  return activities
}

export function mergeAndSort(base?: IActivity[], toAppend: IActivity[] = []) {
  if (!base) return []

  const uniqueKeys = new Set<string>()
  const uniques: IActivity[] = []
  for (const activity of [...base, ...toAppend]) {
    if (!uniqueKeys.has(activity.key)) {
      uniqueKeys.add(activity.key)
      uniques.push(activity)
    }
  }
  uniques.sort((r1, r2) => r2.timestamp - r1.timestamp || r2.type - r1.type)
  return uniques
}
