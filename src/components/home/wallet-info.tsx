import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { formatBigInt, roundNumberString } from '@src/utils/money'
import { WalletInfoViewProps } from '@src/types/home'
import Icon, { IconProps } from '@src/components/icons'
import randomColor from 'randomcolor'
import { ALEO_METADATA } from '@src/lib/aleo/assets/metadata'
import EllipsizedAddress from '../ellipsized-address'
import { capitalize } from '@src/utils/strings'

interface WalletInfoOptionButtonProps {
  option: 'send' | 'receive' | 'faucet'
  onPress: () => void
}
const WalletInfoOptionButton: React.FC<WalletInfoOptionButtonProps> = ({
  option,
  onPress,
}) => {
  const iconTypeNameMap = {
    send: 'arrow-right-up-fill',
    receive: 'arrow-right-down-fill',
    faucet: 'stake-button',
  }

  return (
    <TouchableOpacity className="items-center" onPress={onPress}>
      <View className="items-center justify-center w-[48px] h-[48px] rounded-3xl bg-primary-500 mb-2">
        <Icon
          name={iconTypeNameMap[option] as IconProps['name']}
          color="white"
          size={20}
        />
      </View>
      <Text>{capitalize(option)}</Text>
    </TouchableOpacity>
  )
}

export interface WalletInfoProps {
  walletInfo: WalletInfoViewProps
  isBalanceSyncBannerVisible?: boolean
}

const WalletInfo: React.FC<WalletInfoProps> = ({
  walletInfo,
  isBalanceSyncBannerVisible,
}: WalletInfoProps) => {
  const {
    walletName,
    balance,
    accountAddress,
    copyAddressClicked,
    onWalletNamePress,
    onCopyWalletToClipboardPress,
    onSendPress,
    onReceivePress,
    onFaucetPress,
    onScanPress,
    // onStakePress,
  } = walletInfo

  const copyIcon = copyAddressClicked ? 'success' : 'file-copy'
  const WalletInfoView = !isBalanceSyncBannerVisible ? SafeAreaView : View

  return (
    <WalletInfoView className="px-4 bg-primary-50 rounded-b-3xl pb-[28px] pt-4 w-full">
      <View className="flex flex-row justify-between">
        <TouchableOpacity
          className="flex-row items-center mb-5 gap-2"
          onPress={onWalletNamePress}
        >
          <Icon
            name="leo-logo-blue"
            size={20}
            color={randomColor({ seed: accountAddress })}
          />
          <Text className="text-base font-bold">{walletName}</Text>
          <Icon name="arrow-down-s-line" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onScanPress}
          hitSlop={{
            left: 10,
            right: 10,
            top: 10,
            bottom: 10,
          }}
        >
          <Icon name="scan" size={20} />
        </TouchableOpacity>
      </View>
      <Text className="text-4xl font-bold mb-2">
        ${roundNumberString(formatBigInt(balance, ALEO_METADATA.decimals))}
      </Text>
      <TouchableOpacity
        className="flex-row items-center mb-10"
        onPress={onCopyWalletToClipboardPress}
      >
        <EllipsizedAddress
          address={accountAddress}
          className="text-sm w-[80px]"
        />
        <Icon name={copyIcon} color="black" size={12} />
      </TouchableOpacity>

      <View className="flex-row justify-around">
        <WalletInfoOptionButton option={'send'} onPress={onSendPress} />
        <WalletInfoOptionButton option={'receive'} onPress={onReceivePress} />
        <WalletInfoOptionButton option={'faucet'} onPress={onFaucetPress} />
      </View>
    </WalletInfoView>
  )
}

export default WalletInfo
