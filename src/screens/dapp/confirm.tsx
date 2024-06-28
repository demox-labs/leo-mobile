import React, { Ref, useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import LeoButton from '@src/components/leo-button'
import ActionSheet, {
  ActionSheetProps,
  ActionSheetRef,
} from 'react-native-actions-sheet'
import {
  AleoDAppDecryptRequest,
  AleoDAppMessageType,
  AleoDAppPermissionRequest,
  AleoDAppRecordsRequest,
  AleoDAppRequest,
  AleoDAppResponse,
  AleoDAppSignRequest,
  AleoDAppTransactionRequest,
} from 'leo-wallet-window/src'
import { AleoAccount } from '@src/lib/aleo'
import randomColor from 'randomcolor'
import Icon from '@src/components/icons'
import { PendingResponse } from '@src/lib/aleo/dapp/types'
import EllipsizedAddress from '@src/components/ellipsized-address'

type ConfirmModalProps = ActionSheetProps & {
  origin: string
  account: AleoAccount
  request: AleoDAppRequest
  response: PendingResponse<AleoDAppResponse>
  onConfirm: () => void
  onReject: () => void
}

const ConfirmModal = React.forwardRef(
  (props: ConfirmModalProps, ref: Ref<ActionSheetRef>) => {
    const handleConfirm = () => {
      props.onConfirm()
      ;(ref as React.RefObject<ActionSheetRef>)?.current?.hide()
    }

    const handleReject = () => {
      props.onReject()
      ;(ref as React.RefObject<ActionSheetRef>)?.current?.hide()
    }

    const content = useMemo(() => {
      switch (props.request.type) {
        case AleoDAppMessageType.PermissionRequest:
          return ConnectModal(
            props.origin,
            props.account,
            props.request as AleoDAppPermissionRequest,
          )
        case AleoDAppMessageType.SignRequest:
          return SignModal(
            props.origin,
            props.account,
            props.request as AleoDAppSignRequest,
          )
        case AleoDAppMessageType.DecryptRequest:
          return DecryptModal(
            props.origin,
            props.account,
            props.request as AleoDAppDecryptRequest,
            props.response.renderData,
          )
        case AleoDAppMessageType.RecordsRequest:
          return RecordsModal(
            props.origin,
            props.account,
            props.request as AleoDAppRecordsRequest,
            props.response.renderData,
          )
        case AleoDAppMessageType.TransactionRequest:
          return TransactionModal(
            props.origin,
            props.account,
            props.request as AleoDAppTransactionRequest,
            props.response.renderData,
          )
      }
    }, [props.request, props.origin, props.account, props.response.renderData])

    return (
      <ActionSheet
        {...props}
        ref={ref}
        useBottomSafeAreaPadding
        drawUnderStatusBar={false}
        gestureEnabled
      >
        <View style={styles.container}>
          {content}
          <View style={styles.buttonContainer}>
            <LeoButton
              type={'secondary'}
              label="Reject"
              onPress={handleReject}
              style={styles.rejectButton}
            />
            <LeoButton
              type={'primary'}
              label="Confirm"
              onPress={handleConfirm}
              style={styles.confirmButton}
            />
          </View>
        </View>
      </ActionSheet>
    )
  },
)

const ConnectModal = (
  origin: string,
  account: AleoAccount,
  req: AleoDAppPermissionRequest,
) => {
  return (
    <>
      <Text style={styles.title}>Confirm connection</Text>
      <Text style={styles.domain}>
        {origin} is requesting to connect to your Leo Wallet account on{' '}
        {account.name}
      </Text>

      <View style={styles.divider} />

      <Text style={styles.subtitle}>Decryption Permission</Text>
      <Text style={styles.description}>
        {req.decryptPermission ||
          'This app can only decrypt records with your explicit approval. You will be prompted for any decryption request.'}
      </Text>
    </>
  )
}

const SignModal = (
  origin: string,
  account: AleoAccount,
  req: AleoDAppSignRequest,
) => {
  return (
    <GenericConfirmModal
      account={account}
      title={'Confirm signature'}
      origin={origin}
      action={'Requests you to sign'}
      subtitle={'Message to sign:'}
      description={req.payload}
    />
  )
}

const DecryptModal = (
  origin: string,
  account: AleoAccount,
  req: AleoDAppDecryptRequest,
  renderData: any,
) => {
  return (
    <GenericConfirmModal
      account={account}
      title={'Confirm decryption'}
      origin={origin}
      action={'Requests you to decrypt'}
      subtitle={'Share decrypted:'}
      description={renderData.plainText}
    />
  )
}

const RecordsModal = (
  origin: string,
  account: AleoAccount,
  req: AleoDAppRecordsRequest,
  renderData: any,
) => {
  return (
    <GenericConfirmModal
      account={account}
      title={'Confirm share records'}
      origin={origin}
      action={`Requests records for the program: ${renderData.program}`}
      subtitle={`Share all ${renderData.records.length} records for ${renderData.program}`}
    />
  )
}

const TransactionModal = (
  origin: string,
  account: AleoAccount,
  req: AleoDAppTransactionRequest,
  renderData: any,
) => {
  const subtitle = (
    <>
      <Text className="mt-4" style={styles.subtitle} numberOfLines={1}>
        {renderData.programMessage + '\n\n'}
      </Text>
      <Text className="mt-4" style={styles.subtitle} numberOfLines={1}>
        {renderData.fee + '\n\n'}
      </Text>
      <Text className="mt-4" style={styles.subtitle} numberOfLines={1}>
        Transaction inputs: {'\n\n'}
      </Text>
      <Text className="mt-4" style={styles.details}>
        {renderData.transactionMessages.join('\n')}
      </Text>
    </>
  )

  return (
    <GenericConfirmModal
      account={account}
      title={'Confirm transaction'}
      origin={origin}
      action={'Requests you to approve a transaction'}
      subtitle={subtitle} // TODO: Ensure the modal appears function
    />
  )
}

type GenericConfirmModalProps = {
  account: AleoAccount
  title: string
  origin: string
  action: string
  subtitle: string | JSX.Element
  description?: string
}

const GenericConfirmModal = ({
  account,
  title,
  origin,
  action,
  subtitle,
  description,
}: GenericConfirmModalProps) => {
  const iconColor = randomColor({ seed: account.publicKey })
  return (
    <>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle} className="mt-6">
        {origin}
      </Text>
      <Text style={styles.description}>{action}</Text>
      <View style={styles.divider} />
      <View className="w-full flex-row">
        <Icon name="leo-logo-blue" className="mr-4 p-5" color={iconColor} />
        <View className="w-full flex-col">
          <Text
            className="text-sm font-medium max-w-[80%]"
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {account.name}
          </Text>
          <EllipsizedAddress
            address={account.publicKey}
            className="text-xs w-[80px]"
          />
        </View>
      </View>
      <View style={styles.divider} />
      <Text style={styles.subtitle}>{subtitle}</Text>
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  domain: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'left',
  },
  divider: {
    marginVertical: 18,
    height: 1,
    backgroundColor: '#e1e1e1',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  description: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 16,
  },
  details: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: 'normal',
  },
  buttonContainer: {
    marginTop: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rejectButton: {
    width: '48%',
  },
  confirmButton: {
    width: '48%',
  },
})

ConfirmModal.displayName = 'ConfirmModal'

export default ConfirmModal
