import { AleoDeployment, AleoTransaction, DecryptPermission, EventEmitter, WalletAdapterNetwork } from '@demox-labs/aleo-wallet-adapter-base';
import { LeoWallet, LeoWalletEvents } from '@demox-labs/aleo-wallet-adapter-leo';
import { AleoDAppPermission } from './types';
import {
  getExecution,
  onPermissionChange,
  requestBulkTransactions,
  requestDecrypt,
  requestDeploy,
  requestDisconnect,
  requestExecution,
  requestPermission,
  requestRecordPlaintexts,
  requestRecords,
  requestSign,
  requestTransaction,
  requestTransactionHistory,
  transactionStatus
} from './client';

export class LeoWindowObject extends EventEmitter<LeoWalletEvents> implements LeoWallet {
  publicKey?: string | undefined;
  permission?: AleoDAppPermission | undefined;
  appName?: string | undefined;
  private clearAccountChangeInterval?: () => void | undefined;

  // Since DApps are only available through the webview within the app, we can assume that the wallet is always available
  async isAvailable(): Promise<boolean> {
    return true;
  }

  async signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }> {
    const messageString = new TextDecoder().decode(message);
    const signature = await requestSign(this.publicKey!, messageString);
    return { signature: new TextEncoder().encode(signature) };
  }

  async decrypt(
    cipherText: string,
    tpk?: string,
    programId?: string,
    functionName?: string,
    index?: number
  ): Promise<{ text: string }> {
    const res = await requestDecrypt(this.publicKey!, cipherText, tpk, programId, functionName, index);
    return { text: res };
  }

  async requestRecords(program: string): Promise<{ records: any[] }> {
    const res = await requestRecords(this.publicKey!, program);
    return { records: res };
  }

  async requestTransaction(transaction: AleoTransaction): Promise<{ transactionId?: string | undefined }> {
    const res = await requestTransaction(this.publicKey!, transaction);
    return { transactionId: res };
  }

  async requestExecution(transaction: AleoTransaction): Promise<{ transactionId?: string | undefined }> {
    const res = await requestExecution(this.publicKey!, transaction);
    return { transactionId: res };
  }

  async requestBulkTransactions(transaction: AleoTransaction[]): Promise<{ transactionIds?: string[] | undefined }> {
    const res = await requestBulkTransactions(this.publicKey!, transaction);
    return { transactionIds: res };
  }

  async requestDeploy(deployment: AleoDeployment): Promise<{ transactionId?: string | undefined }> {
    const res = await requestDeploy(this.publicKey!, deployment);
    return { transactionId: res };
  }

  async transactionStatus(transactionId: string): Promise<{ status: string }> {
    const res = await transactionStatus(this.publicKey!, transactionId);
    return { status: res };
  }

  async getExecution(transactionId: string): Promise<{ execution: any }> {
    const res = await getExecution(this.publicKey!, transactionId);
    return { execution: res };
  }

  async requestRecordPlaintexts(program: string): Promise<{ records: any[] }> {
    const res = await requestRecordPlaintexts(this.publicKey!, program);
    return { records: res };
  }

  async requestTransactionHistory(program: string): Promise<{ transactions: any[] }> {
    const res = await requestTransactionHistory(this.publicKey!, program);
    return { transactions: res };
  }

  async connect(
    decryptPermission: DecryptPermission,
    network: WalletAdapterNetwork,
    programs?: string[]
  ): Promise<void> {
    const perm = await requestPermission(
      { name: window.location.hostname },
      false,
      decryptPermission,
      network,
      programs
    );
    this.permission = perm;
    this.publicKey = perm.publicKey;
    this.clearAccountChangeInterval = onPermissionChange((perm: AleoDAppPermission) => {
      this.emit('accountChange', perm);
    });
  }

  async disconnect(): Promise<void> {
    await requestDisconnect();
    this.publicKey = undefined;
    this.permission = undefined;
    this.clearAccountChangeInterval && this.clearAccountChangeInterval();
  }
}