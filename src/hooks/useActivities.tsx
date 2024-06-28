import { AleoChainId } from '@src/lib/aleo'
import { cancelTransactionById } from '@src/lib/aleo/activity/transactions'
import { useAccount, useChainId } from '@src/lib/aleo/ready'
import {
  fetchPendingTransactionsAsActivities,
  fetchTransactionsAsActivities,
  mergeAndSort,
} from '@src/utils/activity-helpers'
import { useRetryableSWR } from '@src/utils/swr'
import { useMemo } from 'react'

export const useActivities = (programId?: string | null) => {
  const account = useAccount()
  const chainId = useChainId()
  const address = account?.publicKey

  // transactionsFetching will be used when we have loading state elements
  const { data: latestTransactions } = useRetryableSWR(
    ['latest-transactions', chainId, address],
    async () =>
      fetchTransactionsAsActivities(chainId as AleoChainId, address, programId),
    {
      revalidateOnMount: true,
      refreshInterval: 10_000,
      dedupingInterval: 3_000,
    },
  )

  const { data: latestPendingTransactions, mutate: mutateTx } = useRetryableSWR(
    ['latest-pending-transactions', chainId, address],
    async () =>
      fetchPendingTransactionsAsActivities(chainId as AleoChainId, address),
    {
      revalidateOnMount: true,
      refreshInterval: 5_000,
      dedupingInterval: 3_000,
    },
  )
  const pendingTransactions = useMemo(
    () =>
      latestPendingTransactions?.map(tx => {
        tx.cancel = async () => {
          if (tx.txId) {
            await cancelTransactionById(tx.txId)
            mutateTx()
          }
        }
        return tx
      }) || [],
    [latestPendingTransactions, mutateTx],
  )

  const combinedLatestActivites = latestTransactions ?? []

  // Don't sort the pending transactions, earliest should come first as they are processed first
  const allActivities = useMemo(
    () => pendingTransactions.concat(mergeAndSort(combinedLatestActivites)),
    [combinedLatestActivites, pendingTransactions],
  )

  return allActivities
}
