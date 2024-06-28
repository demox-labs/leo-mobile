import * as SQLite from 'expo-sqlite/legacy'
import SQLiteClient from './SQLiteClient'
import schema from './schema'

export const DB_NAME = 'leowallet.db'
const getMigrationFunc = (query: string) => {
  return async (db: SQLite.Database): Promise<void> => {
    return new Promise((resolve, reject) => {
      const statements = query
        .split(';')
        .filter(statement => statement.trim() !== '')

      db.transaction(
        tx => {
          statements.forEach(statement => {
            if (statement.trim()) {
              tx.executeSql(
                statement,
                [],
                () => {
                  console.log('Statement executed successfully')
                },
                (tx, error) => {
                  console.log('Failed to execute statement', error)
                  reject(error)
                  return false
                },
              )
            }
          })
        },
        error => {
          console.log('Transaction error', error)
          reject(error)
        },
        () => {
          resolve()
        },
      )
    })
  }
}

const DB_MIGRATIONS = [getMigrationFunc(schema)]

export const sqLiteClient = new SQLiteClient(DB_NAME, DB_MIGRATIONS)

export const initializeDatabase = async (): Promise<void> => {
  await sqLiteClient.connect()
}

export const databaseExists = async (): Promise<boolean> => {
  return await sqLiteClient.exists()
}

export const deleteDatabase = async (): Promise<void> => {
  await sqLiteClient.delete()
}
