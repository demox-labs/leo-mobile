const schema = `
CREATE TABLE IF NOT EXISTS RecordSyncs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chainId TEXT,
  [address] TEXT,
  startBlock INTEGER,
  endBlock INTEGER,
  [page] INTEGER,
  rangeComplete BOOLEAN
);
CREATE INDEX IF NOT EXISTS record_syncs_idx_chainId_address ON RecordSyncs (chainId, address);

CREATE TABLE IF NOT EXISTS OwnedRecords (
  id TEXT PRIMARY KEY,
  chainId TEXT,
  [address] TEXT,
  transitionId TEXT,
  outputIndex INTEGER,
  synced BOOLEAN
);
CREATE INDEX IF NOT EXISTS ownedRecords_idx_chainId ON OwnedRecords (chainId);
CREATE INDEX IF NOT EXISTS ownedRecords_idx_address ON OwnedRecords ([address]);
CREATE INDEX IF NOT EXISTS ownedRecords_idx_transitionId ON OwnedRecords (transitionId);
CREATE INDEX IF NOT EXISTS ownedRecords_idx_outputIndex ON OwnedRecords (outputIndex);
CREATE INDEX IF NOT EXISTS ownedRecords_idx_synced ON OwnedRecords (synced);
CREATE INDEX IF NOT EXISTS ownedRecords_idx_chainId_synced ON OwnedRecords (chainId, synced);

CREATE TABLE IF NOT EXISTS Records (
  id TEXT PRIMARY KEY,
  chainId TEXT NOT NULL,
  [address] TEXT NOT NULL,
  microcredits TEXT,
  blockHeightCreated TEXT,
  blockIdCreated TEXT,
  timestampCreated NUMERIC,
  serialNumber TEXT,
  ciphertext TEXT,
  programId TEXT,
  blockHeightSpent TEXT,
  blockIdSpent TEXT,
  blockHash TEXT,
  transactionId TEXT,
  transitionId TEXT,
  transactionIdSpent TEXT,
  transitionIdSpent TEXT,
  timestampSpent NUMERIC,
  spent BOOLEAN,
  locallySyncedTransactions BOOLEAN,
  locked BOOLEAN,
  outputIndex INTEGER,
  functionName TEXT
);
CREATE INDEX IF NOT EXISTS records_idx_chainId ON Records (chainId);
CREATE INDEX IF NOT EXISTS records_idx_address ON Records ([address]);
CREATE INDEX IF NOT EXISTS records_idx_programId ON Records (programId);
CREATE INDEX IF NOT EXISTS records_idx_spent ON Records (spent);
CREATE INDEX IF NOT EXISTS records_idx_timestampCreated ON Records (timestampCreated);
CREATE INDEX IF NOT EXISTS records_idx_timestampSpent ON Records (timestampSpent);
CREATE INDEX IF NOT EXISTS records_idx_locallySyncedTransactions ON Records (locallySyncedTransactions);
CREATE INDEX IF NOT EXISTS records_idx_locked ON Records (locked);

CREATE TABLE IF NOT EXISTS Transitions (
  id TEXT PRIMARY KEY,
  transitionId TEXT,
  transactionDbId TEXT,
  [address] TEXT,
  chainId TEXT,
  program TEXT,
  functionName TEXT,
  [status] TEXT,
  inputsJson TEXT,
  outputsJson TEXT,
  initiatedAt NUMERIC,
  completedAt NUMERIC,
  [json] TEXT,
  isFee BOOLEAN,
  [index] INTEGER
);
CREATE TABLE IF NOT EXISTS TransitionsInputRecordIds (
  transitionDbId TEXT,
  inputRecordId TEXT,
  PRIMARY KEY (transitionDbId, inputRecordId)
);
CREATE TABLE IF NOT EXISTS TransitionsOutputRecordIds (
  transitionDbId TEXT,
  outputRecordId TEXT,
  PRIMARY KEY (transitionDbId, outputRecordId)
);
CREATE INDEX IF NOT EXISTS transitions_idx_transitionId ON Transitions (transitionId);
CREATE INDEX IF NOT EXISTS transitions_idx_transactionDbId ON Transitions (transactionDbId);
CREATE INDEX IF NOT EXISTS transitions_idx_chainId ON Transitions (chainId);
CREATE INDEX IF NOT EXISTS transitions_idx_address ON Transitions ([address]);
CREATE INDEX IF NOT EXISTS transitions_idx_isFee ON Transitions (isFee);
CREATE INDEX IF NOT EXISTS transitions_idx_initiatedAt ON Transitions (initiatedAt);
CREATE INDEX IF NOT EXISTS transition_idx_completedAt ON Transitions (completedAt);
CREATE INDEX IF NOT EXISTS transitionInputRecordIds_idx_transitionDbId ON TransitionsInputRecordIds (transitionDbId);
CREATE INDEX IF NOT EXISTS transitionsOutputRecordIds_idx_transitionDbId ON TransitionsOutputRecordIds (transitionDbId);

CREATE TABLE IF NOT EXISTS Transactions (
  id TEXT PRIMARY KEY,
  [type] TEXT,
  transactionId TEXT,
  [address] TEXT,
  chainId TEXT,
  [status] INTEGER,
  initiatedAt NUMERIC,
  onlyExecute BOOLEAN,
  processingStartedAt NUMERIC,
  completedAt NUMERIC,
  finalizedAt NUMERIC,
  blockHeight TEXT,
  imports TEXT,
  fee TEXT,
  feeId TEXT,
  [json] TEXT,
  displayMessage TEXT,
  displayIcon TEXT,
  deployedProgramId TEXT,
  deployedProgram TEXT,
  deployedEdition INTEGER,
  authorization TEXT,
  feeAuthorization TEXT,
  delegated BOOLEAN,
  requestId TEXT
);
CREATE TABLE IF NOT EXISTS TransactionTransitionIds (
  transactionDbId TEXT,
  transitionDbId TEXT,
  PRIMARY KEY (transactionDbId, transitionDbId)
);
CREATE INDEX IF NOT EXISTS transaction_idx_transactionId ON Transactions (transactionId);
CREATE INDEX IF NOT EXISTS transaction_idx_type ON Transactions ([type]);
CREATE INDEX IF NOT EXISTS transaction_idx_chainId ON Transactions (chainId);
CREATE INDEX IF NOT EXISTS transaction_idx_address ON Transactions ([address]);
CREATE INDEX IF NOT EXISTS transaction_idx_initiatedAt ON Transactions (initiatedAt);
CREATE INDEX IF NOT EXISTS transaction_idx_completedAt ON Transactions (completedAt);
CREATE INDEX IF NOT EXISTS transactionTransitionIds_idx_transactionDbId ON TransactionTransitionIds (transactionDbId);

CREATE TABLE IF NOT EXISTS AccountTokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  [type] NUMERIC,
  chainId TEXT,
  account TEXT,
  tokenSlug TEXT,
  [status] NUMERIC,
  addedAt NUMERIC,
  latestBalance TEXT,
  latestUSDBalance TEXT
);
CREATE INDEX IF NOT EXISTS accountTokens_idx_chainId_account_type ON AccountTokens (chainId, account, [type]);
CREATE INDEX IF NOT EXISTS accountTokens_idx_chainId_type ON AccountTokens (chainId, [type]);

CREATE TABLE IF NOT EXISTS SerialNumberSyncTimes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chainId TEXT,
  [page] INTEGER
);
CREATE INDEX IF NOT EXISTS serialNumberSyncTimes_idx_chainId ON SerialNumberSyncTimes (chainId);
CREATE INDEX IF NOT EXISTS serialNumberSyncTimes_idx_page ON SerialNumberSyncTimes ([page]);

CREATE TABLE IF NOT EXISTS AccountCreationBlockHeights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chainId TEXT,
  [address] TEXT,
  blockHeight INTEGER,
  CONSTRAINT unique_account_creation_block_heights UNIQUE (chainId, [address])
);
CREATE INDEX IF NOT EXISTS accountCreationBlockHeights_idx_chainId_address ON AccountCreationBlockHeights (chainId, [address]);

CREATE TABLE IF NOT EXISTS KeyFiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  [name] TEXT,
  bytes BLOB,
  sourceType TEXT,
  lastUsed NUMERIC,
  [url] TEXT,
  functionName TEXT
);
CREATE INDEX IF NOT EXISTS keyFiles_idx_name ON KeyFiles ([name]);
CREATE INDEX IF NOT EXISTS keyFiles_idx_sourceType ON KeyFiles (sourceType);
CREATE INDEX IF NOT EXISTS keyFiles_idx_lastUsed ON KeyFiles (lastUsed);

CREATE TABLE IF NOT EXISTS PublicSyncs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chainId TEXT,
  [address] TEXT,
  startBlock INTEGER,
  endBlock INTEGER,
  [page] INTEGER,
  rangeComplete BOOLEAN
);
CREATE INDEX IF NOT EXISTS publicSyncs_idx_chainId_address ON PublicSyncs (chainId, [address]);`

export default schema
