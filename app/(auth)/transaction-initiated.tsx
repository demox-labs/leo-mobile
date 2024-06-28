import React, { useEffect } from 'react'
import { useRouter } from 'expo-router'
import TransactionInitiatedScreen from '@src/screens/send-tokens/transaction-initiated'
import {
  getQueuedTransactions,
  safeGenerateTransaction,
} from '@src/lib/aleo/activity/transactions'
import { logger } from '@src/utils/logger'
import { ITransaction } from '@src/lib/aleo/db/transaction-types'

const TransactionInitiatedRoute = () => {
  const router = useRouter()
  const [done, setDone] = React.useState(false)
  const handleDone = () => {
    if (done) router.navigate('/home')
  }

  useEffect(() => {
    getQueuedTransactions().then(async (transactions: ITransaction[]) => {
      if (transactions.length === 0) {
        setDone(true)
      } else {
        const tasks: Promise<void>[] = []
        for (const transaction of transactions) {
          tasks.push(safeGenerateTransaction(transaction))
        }
        await Promise.all(tasks)
          .catch(err => {
            logger.error(err)
          })
          .then(() => {
            setDone(true)
          })
      }
    })
  })

  return <TransactionInitiatedScreen onDonePress={handleDone} done={done} />
}

export default TransactionInitiatedRoute
