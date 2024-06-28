import React from 'react'
import DBExampleScreen from '@src/screens/db-example'
import { OwnedRecordsTable } from '@src/lib/aleo/db/repo'
import { IOwnedRecord } from '@src/lib/aleo/db/types'
import { resetTables } from '@src/lib/aleo/activity/sync/sync'
import { deleteDatabase } from '@src/lib/aleo/db/setup'
import { isProduction } from '@src/utils/app'
import { Redirect } from 'expo-router'

const DBExampleScreenRoute = () => {
  const createNewRecord = async (recordName: string) => {
    const recordToSave: IOwnedRecord = {
      id: 'blah',
      chainId: 'test',
      address: recordName,
      transitionId: 'transition_id',
      outputIndex: 1,
      synced: false,
    }
    await OwnedRecordsTable.put(recordToSave)
  }

  const deleteRecord = async (recordId: string) => {
    await OwnedRecordsTable.deleteById(recordId)
  }

  const resync = async () => {
    await resetTables()
  }

  const deleteDb = async () => {
    await deleteDatabase()
  }

  if (isProduction) {
    return <Redirect href="/home" />
  }

  return (
    <DBExampleScreen
      onCreateNewRecordPress={createNewRecord}
      onRecordPress={deleteRecord}
      getRecords={OwnedRecordsTable.getByChainId}
      resync={resync}
      deleteDatabase={deleteDb}
    />
  )
}

export default DBExampleScreenRoute
