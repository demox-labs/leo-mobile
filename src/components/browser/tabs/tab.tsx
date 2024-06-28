import React, { useCallback, useEffect, useState } from 'react'
import { Text, TouchableOpacity, View, Image } from 'react-native'
import Icon from '@src/components/icons'
import { getLinkPreview } from 'link-preview-js'
import { capitalize, trimUrl } from '@src/utils/strings'

interface LinkPreviewResponse {
  url: string
  title: string
  siteName?: string
  description?: string
  mediaType: string
  contentType?: string
  images: string[]
  videos?: {
    url?: string
    secureUrl?: string
    type?: string
    width?: string
    height?: string
  }[]
  favicons: string[]
}

type Props = {
  isActive?: boolean
  defaultSiteName?: string
  isNewTab?: boolean
  isLastTab?: boolean
  url?: string
  onTabPress: () => void
  onTabClose?: () => void
}

const Tab: React.FC<Props> = ({
  // isActive,
  // defaultSiteName,
  isNewTab,
  isLastTab,
  url,
  onTabPress,
  onTabClose,
}) => {
  const sharedStyles = `bg-white h-[230px] w-full p-2 mb-1 border-[1px] border-gray-50 rounded-xl ${isLastTab ? 'mb-[100px]' : ''}`

  const [imageUri, setImageUri] = useState<string | null>()
  const [siteName, setSiteName] = useState<string | null>()
  const [favicon, setFavicon] = useState<string | null>()

  const renderFavicon = useCallback(() => {
    if (favicon) {
      return (
        <Image
          style={{ width: 32, height: 32 }}
          source={{ uri: favicon ?? undefined }}
          resizeMode="contain"
        />
      )
    }

    return <Icon name="globe" color="black" size={32} />
  }, [favicon])

  useEffect(() => {
    if (url) {
      getLinkPreview(url, {
        imagesPropertyType: 'og',
      })
        .then(data => {
          const typedData = data as LinkPreviewResponse

          const openGraphImage = typedData.images ? typedData.images[0] : null
          setSiteName(typedData.siteName ?? null)
          setImageUri(openGraphImage)
          setFavicon(typedData.favicons[0] ?? null)
        })
        .catch(error => {
          console.error('Error fetching link preview:', error)
        })
    }
  }, [url])

  if (isNewTab) {
    return (
      <TouchableOpacity onPress={onTabPress}>
        <View
          className={`${sharedStyles} flex-row h-[64px] items-center justify-center mt-2`}
        >
          <Icon name="add-fill" size={32} />
          <Text className="text-black text-base ml-[6px]">New Tab</Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity onPress={onTabPress}>
      <View className={sharedStyles}>
        <View className="flex-row w-full items-center mb-[10px]">
          <Text
            className="text-black mr-auto max-w-[90%]"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {trimUrl(url ?? '')}
          </Text>
          <TouchableOpacity
            onPress={onTabClose}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Icon name="close-fill" size={20} />
          </TouchableOpacity>
        </View>
        <View className="flex-1 justify-center items-center">
          {imageUri ? (
            <Image className="w-full h-full" source={{ uri: imageUri }} />
          ) : (
            <View className="w-full h-full justify-center p-5 bg-primary-50">
              {renderFavicon()}
              <Text
                className="text-black text-xl mt-[9px] font-semibold"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {siteName ? capitalize(siteName) : url}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default Tab
