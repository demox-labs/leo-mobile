import { ImageSourcePropType } from 'react-native'

export type DAppInfo = {
  name: string
  origin: string
  account: string
  network: string
  decryptPermission: string
  image: ImageSourcePropType | string
}
