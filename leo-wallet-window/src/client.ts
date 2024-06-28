import { AleoDeployment, AleoTransaction, DecryptPermission, WalletAdapterNetwork } from "@demox-labs/aleo-wallet-adapter-base";
import { nanoid } from 'nanoid';

import {
  AleoDAppErrorType,
  AleoDAppMessageType,
  AleoDAppMetadata,
  AleoDAppPermission,
  AleoDAppRequest,
  AleoDAppResponse,
  AleoPageMessage,
  AleoPageMessageType
} from "./types";

export function onPermissionChange(callback: (permission: AleoDAppPermission) => void) {
  let t: any;
  let currentPerm: AleoDAppPermission = null;
  const check = async () => {
    try {
      const perm = await getCurrentPermission();
      if (!permissionsAreEqual(perm, currentPerm)) {
        callback(perm);
        currentPerm = perm;
      }
    } catch {}

    t = setTimeout(check, 10_000);
  };
  check();
  return () => clearTimeout(t);
}

export async function getCurrentPermission() {
  const res = await request({
    type: AleoDAppMessageType.GetCurrentPermissionRequest
  });
  assertResponse(res.type === AleoDAppMessageType.GetCurrentPermissionResponse);
  return res.permission;
}

export async function requestPermission(
  appMeta: AleoDAppMetadata,
  force: boolean,
  decryptPermission: DecryptPermission,
  network: WalletAdapterNetwork,
  programs?: string[]
) {
  const res = await request({
    type: AleoDAppMessageType.PermissionRequest,
    appMeta,
    force,
    decryptPermission,
    network,
    programs
  });
  assertResponse(res.type === AleoDAppMessageType.PermissionResponse);
  return {
    rpc: res.network,
    publicKey: res.publicKey,
    decryptPermission: res.decryptPermission,
    programs: res.programs
  };
}

export async function requestDisconnect() {
  const res = await request({
    type: AleoDAppMessageType.DisconnectRequest
  });
  assertResponse(res.type === AleoDAppMessageType.DisconnectResponse);
  return res;
}

export async function requestSign(sourcePublicKey: string, payload: string) {
  const res = await request({
    type: AleoDAppMessageType.SignRequest,
    sourcePublicKey,
    payload
  });
  assertResponse(res.type === AleoDAppMessageType.SignResponse);
  return res.signature;
}

export async function requestDecrypt(
  sourcePublicKey: string,
  cipherText: string,
  tpk?: string,
  programId?: string,
  functionName?: string,
  index?: number
) {
  const res = await request({
    type: AleoDAppMessageType.DecryptRequest,
    sourcePublicKey,
    cipherText,
    tpk,
    programId,
    functionName,
    index
  });
  assertResponse(res.type === AleoDAppMessageType.DecryptResponse);
  return res.plainText;
}

export async function requestRecords(sourcePublicKey: string, program: string) {
  const res = await request({
    type: AleoDAppMessageType.RecordsRequest,
    sourcePublicKey,
    program
  });
  assertResponse(res.type === AleoDAppMessageType.RecordsResponse);
  return res.records;
}

export async function requestTransaction(sourcePublicKey: string, transaction: AleoTransaction) {
  const res = await request({
    type: AleoDAppMessageType.TransactionRequest,
    sourcePublicKey,
    transaction
  });
  assertResponse(res.type === AleoDAppMessageType.TransactionResponse);
  return res.transactionId;
}

export async function requestExecution(sourcePublicKey: string, transaction: AleoTransaction) {
  const res = await request({
    type: AleoDAppMessageType.ExecutionRequest,
    sourcePublicKey,
    transaction
  });
  assertResponse(res.type === AleoDAppMessageType.ExecutionResponse);
  return res.transactionId;
}

export async function requestBulkTransactions(sourcePublicKey: string, transactions: AleoTransaction[]) {
  const res = await request({
    type: AleoDAppMessageType.BulkTransactionsRequest,
    sourcePublicKey,
    transactions
  });
  assertResponse(res.type === AleoDAppMessageType.BulkTransactionsResponse);
  return res.transactionIds;
}

export async function requestDeploy(sourcePublicKey: string, deployment: AleoDeployment) {
  const res = await request({
    type: AleoDAppMessageType.DeployRequest,
    sourcePublicKey,
    deployment
  });
  assertResponse(res.type === AleoDAppMessageType.DeployResponse);
  return res.transactionId;
}

export async function transactionStatus(sourcePublicKey: string, transactionId: string) {
  const res = await request({
    type: AleoDAppMessageType.TransactionStatusRequest,
    sourcePublicKey,
    transactionId
  });
  assertResponse(res.type === AleoDAppMessageType.TransactionStatusResponse);
  return res.status;
}

export async function getExecution(sourcePublicKey: string, transactionId: string) {
  const res = await request({
    type: AleoDAppMessageType.GetExecutionRequest,
    sourcePublicKey,
    transactionId
  });
  assertResponse(res.type === AleoDAppMessageType.GetExecutionResponse);
  return res.execution;
}

export async function requestRecordPlaintexts(sourcePublicKey: string, program: string) {
  const res = await request({
    type: AleoDAppMessageType.RecordPlaintextsRequest,
    sourcePublicKey,
    program
  });
  assertResponse(res.type === AleoDAppMessageType.RecordPlaintextsResponse);
  return res.records;
}

export async function requestTransactionHistory(sourcePublicKey: string, program: string) {
  const res = await request({
    type: AleoDAppMessageType.TransactionHistoryRequest,
    sourcePublicKey,
    program
  });
  assertResponse(res.type === AleoDAppMessageType.TransactionHistoryResponse);
  return res.transactions;
}

function request(payload: AleoDAppRequest) {
  return new Promise<AleoDAppResponse>((resolve, reject) => {
    const reqId = nanoid();
    const handleMessage = (evt: MessageEvent) => {
      const res = evt.data as AleoPageMessage;

      switch (true) {
        case res?.reqId !== reqId:
          return;

        case res?.type === AleoPageMessageType.Response:
          resolve(res.payload);
          window.removeEventListener('message', handleMessage);
          break;

        case res?.type === AleoPageMessageType.ErrorResponse:
          reject(createError(res.payload));
          window.removeEventListener('message', handleMessage);
          break;
      }
    };

    send({
      type: AleoPageMessageType.Request,
      payload,
      reqId
    });

    window.addEventListener('message', handleMessage);
  });
}

function permissionsAreEqual(aPerm: AleoDAppPermission, bPerm: AleoDAppPermission) {
  if (aPerm === null) return bPerm === null;
  return aPerm.publicKey === bPerm?.publicKey && aPerm.rpc === bPerm?.rpc;
}

function createError(payload: any) {
  console.log('Error: ', payload);
  switch (true) {
    case payload === AleoDAppErrorType.NotGranted:
      return new NotGrantedAleoWalletError();

    case payload === AleoDAppErrorType.NotFound:
      return new NotFoundAleoWalletError();

    case payload === AleoDAppErrorType.InvalidParams:
      return new InvalidParamsAleoWalletError();

    default:
      return new AleoWalletError();
  }
}

export function assertResponse(condition: any): asserts condition {
  if (!condition) {
    throw new Error('Invalid response recieved');
  }
}

function send(msg: AleoPageMessage) {
  if ((window as any).ReactNativeWebView) {
    (window as any).ReactNativeWebView.postMessage(JSON.stringify(msg));
  } else {
    window.postMessage(msg, '*');
  }
}

export class AleoWalletError implements Error {
  name = 'AleoWalletError';
  message = 'An unknown error occured. Please try again or report it';
}

export class NotGrantedAleoWalletError extends AleoWalletError {
  name = 'NotGrantedAleoWalletError';
  message = 'Permission Not Granted';
}

export class NotFoundAleoWalletError extends AleoWalletError {
  name = 'NotFoundAleoWalletError';
  message = 'Account Not Found. Try connect again';
}

export class InvalidParamsAleoWalletError extends AleoWalletError {
  name = 'InvalidParamsAleoWalletError';
  message = 'Some of the parameters you provided are invalid';
}

export const DEFAULT_ERROR_MESSAGE = 'Unexpected error occured';

export function serializeError(err: any) {
  const message = err?.message || DEFAULT_ERROR_MESSAGE;
  return Array.isArray(err?.errors) && err.errors.length > 0 ? [message, err.errors] : message;
}