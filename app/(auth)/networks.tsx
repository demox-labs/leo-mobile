import React, { useState } from 'react'
import NetworksScreen from '@src/screens/settings/networks'

const NetworksRoute = () => {
  const [selectedNetworkId, setSelectedNetworkId] = useState('aleo-devnet')

  const devnets = [{ name: 'Aleo Devnet', id: 'aleo-devnet' }]

  const testnets = [{ name: 'Aleo Mainnet Beta', id: 'aleo-mainnet-beta' }]

  const onNetworkSelect = (networkId: string) => {
    setSelectedNetworkId(networkId)
  }

  return (
    <NetworksScreen
      devnets={devnets}
      testnets={testnets}
      selectedNetworkId={selectedNetworkId}
      onNetworkSelect={onNetworkSelect}
    />
  )
}

export default NetworksRoute
