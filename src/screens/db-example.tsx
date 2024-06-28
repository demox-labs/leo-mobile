import { IOwnedRecord } from '@src/lib/aleo/db/types'
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  Button,
  TextInput,
  StatusBar,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native'

type DBExampleScreenProps = {
  onCreateNewRecordPress: (recordName: string) => void
  onRecordPress: (id: string) => void
  getRecords: (chainId: string) => Promise<IOwnedRecord[]>
  resync: () => void
  deleteDatabase: () => void
}

const DBExampleScreen: React.FC<DBExampleScreenProps> = ({
  onCreateNewRecordPress,
  onRecordPress,
  getRecords,
  resync,
  deleteDatabase,
}: DBExampleScreenProps) => {
  const [recordName, setRecordName] = useState('')
  const [records, setRecords] = useState<IOwnedRecord[]>([])
  useEffect(() => {
    const records = async () => {
      const records = await getRecords('test')
      const realRecords = await getRecords('testnet3')
      setRecords(records.concat(realRecords))
    }
    records()
  }, [])

  const saveRecord = async () => {
    onCreateNewRecordPress(recordName)
    setRecords(await getRecords('test'))
  }

  const deleteRecord = async (id: string) => {
    onRecordPress(id)
    setRecords(await getRecords('test'))
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View>
          <Text>Record Name:</Text>
          <TextInput
            value={recordName}
            onChangeText={text => setRecordName(text)}
            className={
              'mb-2 p-3 border border-gray-200 rounded-xl text-base pr-12'
            }
            style={{
              lineHeight: 20,
              textAlignVertical: 'center',
            }}
            placeholder={'Enter record name'}
            secureTextEntry={false}
            placeholderTextColor="#9E9E9E"
            textAlignVertical="center"
          />
          <Button title="Create New Record" onPress={saveRecord} />
          <Button title="Resync Chain" onPress={resync} />
          <Button title="Delete Database" onPress={deleteDatabase} />
          <Text>Saved Records (click to delete):</Text>
          {records.map((record, index) => {
            return (
              <View
                key={index}
                style={styles.recordView}
                onTouchEnd={() => deleteRecord(record.id)}
              >
                <Text>Id: {record.id}</Text>
                <Text>Record name: {record.address}</Text>
                <Text>Chain Id: {record.chainId}</Text>
                <Text>Transition Id: {record.transitionId}</Text>
                <Text>Output index: {record.outputIndex}</Text>
                <Text>Synced: {record.synced}</Text>
              </View>
            )
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },
  scrollView: {
    marginHorizontal: 20,
  },
  text: {
    fontSize: 42,
  },
  recordView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
})

export default DBExampleScreen
