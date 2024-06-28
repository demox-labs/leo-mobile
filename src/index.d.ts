/// <reference types="nativewind/types" />

declare global {}

// Declare png files as components:
declare module '*.png' {
  import { ImageSourcePropType } from 'react-native'
  const content: ImageSourcePropType
  export default content
}

// Declare svg files as components:
//https://github.com/kristerkari/react-native-svg-transformer?tab=readme-ov-file#using-typescript

declare module '*.svg' {
  import React from 'react'
  import { SvgProps } from 'react-native-svg'
  const content: React.FC<SvgProps>
  export default content
}

declare module '*.png'
