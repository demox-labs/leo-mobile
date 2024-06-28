import React, { useState } from 'react'
import { View, Text, Button } from 'react-native'

type SDKExampleScreenProps = {
  onGeneratePrivateKeyPress: () => Promise<string | undefined>
  onGenerateAuthorizationPress: () => Promise<string>
  onExecuteAuthorizationPress: (
    auth: string,
    feeAuth: string,
  ) => Promise<string>
}

const SDKExampleScreen: React.FC<SDKExampleScreenProps> = ({
  onGeneratePrivateKeyPress,
  onGenerateAuthorizationPress,
  onExecuteAuthorizationPress,
}: SDKExampleScreenProps) => {
  const [privateKey, setPrivateKey] = useState<string | undefined>('')
  const [authorization, setAuthorization] = useState('')
  const [execution, setExecution] = useState('')

  const handleGeneratePrivateKey = async () => {
    setPrivateKey(await onGeneratePrivateKeyPress())
  }
  const handleGenerateAuthorization = async () => {
    setAuthorization('')
    const auth = await onGenerateAuthorizationPress()
    console.log('auth', auth)
    setAuthorization(auth)
  }
  const handleExecuteAuthorization = async () => {
    setExecution('')
    const authObj = JSON.parse(authorization)
    const exec = await onExecuteAuthorizationPress(
      authObj.authorization,
      authObj.fee_authorization,
    )
    console.log('exec', exec)
    setExecution(exec)
  }
  return (
    <View>
      <Button title="Generate Private Key" onPress={handleGeneratePrivateKey} />
      {privateKey ? <Text>Private Key: {privateKey}</Text> : null}
      <Button
        title="Generate Authorization"
        onPress={handleGenerateAuthorization}
      />
      {authorization ? (
        <Text>Private Key: {authorization.slice(0, 200) + '...'}</Text>
      ) : null}
      <Button
        title="Execute Authorization"
        onPress={handleExecuteAuthorization}
      />
      {execution ? (
        <Text>Execution: {execution.slice(0, 200) + '...'}</Text>
      ) : null}
    </View>
  )
}

export default SDKExampleScreen
