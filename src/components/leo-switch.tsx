import { Switch, SwitchProps } from 'react-native'
import React from 'react'
import colors from '@src/utils/colors'

const LeoSwitch: React.FC<SwitchProps> = props => {
  return (
    <Switch
      trackColor={{ false: 'gray', true: colors.primary['500'] }}
      style={{
        transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
      }}
      {...props}
    />
  )
}

export default LeoSwitch
