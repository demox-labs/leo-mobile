import { ImageSourcePropType } from 'react-native'

export type AppInfo = {
  id: string
  name?: string
  url?: string
  image?: ImageSourcePropType
}

export type TabType = {
  id: string
  name: string
  url: string
}
