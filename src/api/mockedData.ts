import { Account } from '@src/types/accounts'
import { Token } from '@src/types/tokens'

import { TokenInfoData } from '@src/types/home'
import { INFT } from '@src/types/nfts'

export const mockedAccounts = [
  {
    id: '1',
    name: 'Account 1',
    syncProgress: 11,
  },
  {
    id: '2',
    name: 'Account 2',
    syncProgress: 50,
  },
  {
    id: '3',
    name: 'Account 3',
    syncProgress: 100,
  },
  {
    id: '4',
    name: 'Account 4',
    syncProgress: 100,
  },
  {
    id: '5',
    name: 'Account 5',
    syncProgress: 100,
  },
  {
    id: '6',
    name: 'Test Very Very Very Long Long Long Account Name',
    syncProgress: 100,
  },
]

export const mockedMnemonicWords = [
  'word1',
  'word2',
  'word3',
  'word4',
  'word5',
  'word6',
  'word7',
  'word8',
  'word9',
  'word10',
  'word11',
  'word12',
]

export const mockedTokens: Token[] = [
  {
    id: '1',
    name: 'Aleo',
    symbol: 'ALEO',
    balance: BigInt(100_000_000),
  },
]

export const mockedTokensBuyFlow = [
  ...mockedTokens,
  // {
  //   id: '3',
  //   name: 'Ethereum',
  //   symbol: 'ETH',
  //   balance: BigInt(10_000_000),
  //   fee: BigInt(5_000),
  // },
  // {
  //   id: '4',
  //   name: 'USD Coin',
  //   symbol: 'USD',
  //   balance: BigInt(10_000_000),
  //   fee: BigInt(5_000),
  // },
]

export const mockedWalletAddressess: Account[] = [
  {
    id: '0',
    name: 'Account 0',
    address: 'aleo1kf3dgrz9lqyklz8kqfy0hpxxyt78qfuzshuhccl02a5x43x6nqpsaapqru',
    isOwn: true,
  },
  {
    id: '1',
    name: 'Alice Bob',
    address: 'aleo19k32rzkfhjvpeahn2gr5gdtw6xj597q4q3e4d27qclyuygql6sqqkjn6up',
    isOwn: false,
  },
  {
    id: '2',
    name: 'Account Very long name (Own)',
    address: 'aleo19k32rzkfhjvpeahn2gr5gdtw6xj597q4q3e4d27qclyuygql6sqqkjn6up',
    isOwn: true,
  },
  {
    id: '3',
    name: 'Account 1 (Own)',
    address: 'aleo19k32rzkfhjvpeahn2gr5gdtw6xj597q4q3e4d27qclyuygql6sqqkjn6up',
    isOwn: true,
  },
]

export const accountAddress =
  'aleo19k32rzkfhjvpeahn2gr5gdtw6xj597q4q3e4d27qclyuygql6sqqkjn6up'

const name = 'ALEO'
const balance = {
  total: BigInt(500),
  private: BigInt(100),
  public: BigInt(400),
}

export const tokenInfo: TokenInfoData = {
  name,
  balance,
}

export const INFTs: INFT[] = [
  {
    recordId: '1',
    tokenId: '1',
    tokenIdRaw: '1',
    programId: '1',
    symbol: 'ALEO',
    imageURI: 'https://www.tbstat.com/wp/uploads/2022/03/Bored-Ape-8351.png',
    timestamp: 123456789,
    edition: '1',
    transactionId: '1',
    isPrivate: false,
    collectionDescription: 'Collection Description',
    collectionName: 'Collection Name',
    collectionLink: 'Collection Link',
    sourceLink: 'Source Link',
    explorerLink: 'Explorer Link',
    mintNumber: 1,
    attributes: [
      {
        trait_type: 'Trait Type',
        value: 'Value',
      },
    ],
  },
  {
    recordId: '2',
    tokenId: '2',
    tokenIdRaw: '2',
    programId: '2',
    symbol: 'ALEO',
    imageURI:
      'https://i.seadn.io/gcs/files/ccd8cf058003d71c4e7cbbff1ecd2283.png?w=500&auto=format',
    timestamp: 123456789,
    edition: '2',
    transactionId: '2',
    isPrivate: false,
    collectionDescription: 'Collection Description',
    collectionName: 'Collection Name',
    collectionLink: 'Collection Link',
    sourceLink: 'Source Link',
    explorerLink: 'Explorer Link',
    mintNumber: 2,
    attributes: [
      {
        trait_type: 'Trait Type',
        value: 'Value',
      },
    ],
  },
  {
    recordId: '3',
    tokenId: '3',
    tokenIdRaw: '3',
    programId: '3',
    symbol: 'ALEO',
    imageURI:
      'https://i.seadn.io/gae/EjbfVyIGH3pjUOf9qBpN6x5piW2-Is13C1BySY6zYstRYK9PJOIQJYpA4Be_T-uXG4i2_ITAanX9HsBcv5MdnT60uNA-zYqdK7GZ?auto=format&dpr=1&w=1000',
    timestamp: 123456789,
    edition: '3',
    transactionId: '3',
    isPrivate: false,
    collectionDescription: 'Collection Description',
    collectionName: 'Collection Name',
    collectionLink: 'Collection Link',
    sourceLink: 'Source Link',
    explorerLink: 'Explorer Link',
    mintNumber: 3,
    attributes: [
      {
        trait_type: 'Trait Type',
        value: 'Value',
      },
    ],
  },
]

export const NFTs: NFT[] = [
  {
    id: 'NFT0x3233f',
    name: 'Bored Ape Yacht Best Club #3230',
    image: 'https://www.tbstat.com/wp/uploads/2022/03/Bored-Ape-8351.png',
    collection: 'Bored Ape Yacht Best Club',
    source: 'Source Link',
    description:
      'Het is al geruime tijd een bekend gegeven dat een lezer, tijdens het bekijken van de layout',
  },
  {
    id: 'NFT0x3233g',
    name: 'TheBoboCouncil #2312',
    image:
      'https://i.seadn.io/gcs/files/ccd8cf058003d71c4e7cbbff1ecd2283.png?w=500&auto=format',
    collection: 'Bored Ape Yacht Best Club',
    source: 'Source Link',
    description:
      'Het is al geruime tijd een bekend gegeven dat een lezer, tijdens het bekijken van de layout',
  },
  {
    id: 'NFT0x3233h',
    name: 'Bored Skeleton #3230',
    image:
      'https://i.seadn.io/gae/EjbfVyIGH3pjUOf9qBpN6x5piW2-Is13C1BySY6zYstRYK9PJOIQJYpA4Be_T-uXG4i2_ITAanX9HsBcv5MdnT60uNA-zYqdK7GZ?auto=format&dpr=1&w=1000',
    collection: 'Bored Ape Yacht Best Club',
    source: 'Source Link',
    description:
      'Het is al geruime tijd een bekend gegeven dat een lezer, tijdens het bekijken van de layout',
  },
  {
    id: 'NFT0x3233i',
    name: 'Bored Ape #32394',
    image:
      'https://thumbor.forbes.com/thumbor/fit-in/900x510/https://www.forbes.com/advisor/in/wp-content/uploads/2022/03/monkey-g412399084_1280.jpg',
    collection: 'Bored Ape Yacht Best Club',
    source: 'Source Link',
    description:
      'Het is al geruime tijd een bekend gegeven dat een lezer, tijdens het bekijken van de layout',
  },
  {
    id: 'NFT0x3233fa',
    name: 'Bored Ape 2 #3230',
    image:
      'https://www.ledgerinsights.com/wp-content/uploads/2021/12/adidas-nft-bored-ape-810x524.jpg',
    collection: 'Bored Ape Yacht Best Club',
    source: 'Source Link',
    description:
      'Het is al geruime tijd een bekend gegeven dat een lezer, tijdens het bekijken van de layout',
  },
  {
    id: 'NFT0x3233ia',
    name: 'Leo #32394',
    image:
      'https://miro.medium.com/v2/resize:fit:1400/format:webp/1*tWV5XiyuyKBsQeAvbSRwHQ.png',
    collection: 'Bored Ape Yacht Best Club',
    source: 'Source Link',
    description:
      'Het is al geruime tijd een bekend gegeven dat een lezer, tijdens het bekijken van de layout',
  },
  {
    id: 'NFT0x3233gaa',
    name: 'TheBoboCouncil #2312',
    image:
      'https://i.seadn.io/gcs/files/ccd8cf058003d71c4e7cbbff1ecd2283.png?w=500&auto=format',
    collection: 'Bored Ape Yacht Best Club',
    source: 'Source Link',
    description:
      'Het is al geruime tijd een bekend gegeven dat een lezer, tijdens het bekijken van de layout',
  },
  {
    id: 'NFT0x3233ha',
    name: 'Bored Skeleton #3230',
    image:
      'https://i.seadn.io/gae/EjbfVyIGH3pjUOf9qBpN6x5piW2-Is13C1BySY6zYstRYK9PJOIQJYpA4Be_T-uXG4i2_ITAanX9HsBcv5MdnT60uNA-zYqdK7GZ?auto=format&dpr=1&w=1000',
    collection: 'Bored Ape Yacht Best Club',
    source: 'Source Link',
    description:
      'Het is al geruime tijd een bekend gegeven dat een lezer, tijdens het bekijken van de layout',
  },
]

export type NFT = {
  id: string
  name: string
  image: string
  collection: string
  source: string
  description: string
}
