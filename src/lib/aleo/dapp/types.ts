import { AleoDAppResponse } from 'leo-wallet-window/src'

export type PendingResponse<T extends AleoDAppResponse> = {
  type: 'pending_response'
  onConfirm: () => Promise<T>
  renderData?: any
}
