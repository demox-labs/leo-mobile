import { ChainApiStatus } from '@src/lib/aleo'

export interface WalletInfoViewProps {
  className?: string
  walletName: string
  balance: bigint
  accountAddress: string
  copyAddressClicked: boolean
  chainStatus: ChainApiStatus
  onWalletNamePress: () => void
  onCopyWalletToClipboardPress: () => void
  onSendPress: () => void
  onReceivePress: () => void
  onFaucetPress: () => void
  onBuyTokensPress: () => void
  onStakePress: () => void
  onScanPress: () => void
}

export interface TokenInfoData {
  name: string
  balance: { total: bigint; private: bigint; public: bigint }
}
