/**
 * Utility module providing modern inteface to SQLite database.
 * @module src/util/SQLiteClient
 *
 * https://codeburst.io/react-native-sqlite-and-migrations-bc72b70e66fb
 */
import * as SQLite from 'expo-sqlite/legacy'
import * as FileSystem from 'expo-file-system'

type Migration = (db: SQLite.SQLiteDatabase) => Promise<void>

/** Database downgrade error */
export class DowngradeError extends Error {
  constructor() {
    super()
    this.name = 'DowngradeError'
  }
}

/** Interface to SQLiteClient client. */
export default class SQLiteClient {
  private privateConnected = false

  private databaseFileName = 'SQLite'

  private name: string

  private migrations: Migration[]

  private privateDb: SQLite.SQLiteDatabase | null = null

  constructor(name: string, migrations: Migration[]) {
    this.name = name
    this.migrations = migrations
  }

  public get connected(): boolean {
    return this.privateConnected
  }

  public get dB(): SQLite.SQLiteDatabase | null {
    return this.privateDb
  }

  public async delete(): Promise<void> {
    await this.privateDb?.closeAsync()
    await this.privateDb?.deleteAsync()
  }

  public async exists(): Promise<boolean> {
    return (
      await FileSystem.getInfoAsync(
        FileSystem.documentDirectory + this.databaseFileName,
      )
    ).exists
  }

  public async connect(): Promise<void> {
    if (this.privateConnected) {
      return
    }
    try {
      this.privateDb = SQLite.openDatabase(this.name)

      // MIGRATIONS
      const resultSet = await this.privateDb.execAsync(
        [{ sql: 'PRAGMA user_version', args: [] }],
        false,
      )
      let version
      if ('error' in resultSet[0]) {
        console.log('error in result set', resultSet[0])
      } else {
        version = resultSet[0].rows[0]['user_version']
      }

      const nextVersion = this.migrations.length
      if (version > nextVersion) {
        throw new DowngradeError()
      }
      for (let i = version; i < nextVersion; i += 1) {
        const migration = this.migrations[i]
        // eslint-disable-next-line
        await migration(this.privateDb)
      }
      if (version !== nextVersion) {
        await this.privateDb.execAsync(
          [{ sql: `PRAGMA user_version = ${nextVersion}`, args: [] }],
          false,
        )
      }

      this.privateConnected = true
    } catch (err) {
      if (err instanceof DowngradeError) {
        throw err
      }
      console.log(err)
      throw new Error(
        `SQLiteClient: failed to connect to database: ${this.name}`,
      )
    }
  }
}
