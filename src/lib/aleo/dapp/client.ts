import {
  AleoDAppMessageType,
  AleoDAppRequest,
  AleoDAppResponse,
  AleoPageMessage,
  AleoPageMessageType,
} from 'leo-wallet-window/src'
import { PendingResponse } from './types'
import {
  getCurrentPermission,
  getRecordPlaintexts,
  getTransactionHistory,
  requestDecrypt,
  requestDisconnect,
  requestPermission,
  requestRecords,
  requestSign,
  requestTransaction,
  requestTransactionStatus,
} from './dapp'

export async function processRequest(
  origin: string,
  req: AleoPageMessage,
): Promise<AleoPageMessage | PendingResponse<AleoDAppResponse> | void> {
  switch (req.type) {
    case AleoPageMessageType.Request: {
      const dAppEnabled = true // TODO: check if dApp is enabled from settings
      if (dAppEnabled) {
        if (req.payload === 'PING') {
          return {
            type: AleoPageMessageType.Response,
            reqId: req.reqId,
            payload: 'PONG',
          }
        }

        const resPayload = await processDApp(origin, req.payload)
        if (resPayload && resPayload.type === 'pending_response') {
          return resPayload
        }
        return {
          type: AleoPageMessageType.Response,
          reqId: req.reqId,
          payload: resPayload ?? null,
        }
      }
      break
    }
  }
}

export async function processDApp(
  origin: string,
  req: AleoDAppRequest,
): Promise<AleoDAppResponse | PendingResponse<AleoDAppResponse> | void> {
  switch (req?.type) {
    case AleoDAppMessageType.GetCurrentPermissionRequest:
      return getCurrentPermission(origin)

    case AleoDAppMessageType.PermissionRequest:
      return requestPermission(origin, req)

    case AleoDAppMessageType.DisconnectRequest:
      return requestDisconnect(origin)

    case AleoDAppMessageType.SignRequest:
      return requestSign(origin, req)

    case AleoDAppMessageType.DecryptRequest:
      return requestDecrypt(origin, req)

    case AleoDAppMessageType.RecordsRequest:
      return requestRecords(origin, req)

    case AleoDAppMessageType.TransactionRequest:
      return requestTransaction(origin, req)

    case AleoDAppMessageType.ExecutionRequest:
      throw new Error('Method not implemented.')

    case AleoDAppMessageType.BulkTransactionsRequest:
      throw new Error('Method not implemented.')

    case AleoDAppMessageType.DeployRequest:
      throw new Error('Method not implemented.')

    case AleoDAppMessageType.TransactionStatusRequest:
      return requestTransactionStatus(origin, req)

    case AleoDAppMessageType.GetExecutionRequest:
      throw new Error('Method not implemented.')

    case AleoDAppMessageType.RecordPlaintextsRequest:
      return getRecordPlaintexts(origin, req)

    case AleoDAppMessageType.TransactionHistoryRequest:
      return getTransactionHistory(origin, req)
  }
}
