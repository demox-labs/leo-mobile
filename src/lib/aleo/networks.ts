import { AleoNetwork } from './types'

export const NETWORKS: AleoNetwork[] = [
  {
    id: 'testnetbeta',
    name: 'testnetbeta', // TODO i18n
    nameI18nKey: 'testnetbeta',
    description: 'Aleo Testnet Beta',
    type: 'main',
    rpcBaseURL: 'https://testnetbeta.aleorpc.com',
    color: '#00DB8C',
    disabled: false,
    autoSync: true,
    hasFaucet: true,
  },
  {
    id: 'localnet',
    name: 'localhost:3000',
    description: 'Local Net',
    type: 'main',
    rpcBaseURL: 'http://localhost:3000',
    color: '#00DB8C',
    disabled: true,
    autoSync: false,
    hasFaucet: false,
  },
]
