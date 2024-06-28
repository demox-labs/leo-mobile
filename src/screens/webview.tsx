import React, { useState, useRef, useEffect, useCallback } from 'react'
import { WebView, WebViewNavigation } from 'react-native-webview'
import {
  View,
  TouchableOpacity,
  Alert,
  Share,
  TextInput,
  Text,
  Keyboard,
  Pressable,
} from 'react-native'
import { Edges, SafeAreaView } from 'react-native-safe-area-context'
import LeoWalletWindow from '@demox-labs/leo-wallet-window/build'
import { Ionicons } from '@expo/vector-icons'
import {
  WebViewErrorEvent,
  WebViewMessageEvent,
} from 'react-native-webview/lib/WebViewTypes'
import ConfirmModal from './dapp/confirm'
import { ActionSheetRef } from 'react-native-actions-sheet'
import { processRequest } from '@src/lib/aleo/dapp/client'
import { serializeError } from 'leo-wallet-window/src/client'
import {
  AleoDAppErrorType,
  AleoDAppMessageType,
  AleoPageMessage,
  AleoPageMessageType,
} from 'leo-wallet-window/src'
import { AleoAccount } from '@src/lib/aleo'
import { isDAppInteractionsAllowed } from '@src/utils/helpers'
import { router } from 'expo-router'
import WebviewControlsModal from '@src/components/webview/webview-controls-modal'
import useBrowserStore from '@src/state/zustand/browser'
import TabsCounterIcon from '@src/components/browser/tabs/tabs-counter-icon'
import Icon from '@src/components/icons'
import { trimUrl } from '@src/utils/strings'

interface WebViewScreenProps {
  account: AleoAccount
  url: string
  onUrlUpdate: (searchQuery: string) => void
  onClose: () => void
  onOpenTabs: () => void
  applyTopPadding?: boolean
  applyBottomPadding?: boolean
  flow?: 'buy-tokens'
}

const WebViewScreen: React.FC<WebViewScreenProps> = ({
  account,
  url,
  onUrlUpdate,
  onClose,
  onOpenTabs,
  applyTopPadding = true,
  applyBottomPadding = true,
  flow,
}: WebViewScreenProps) => {
  const confirmModalRef: React.RefObject<ActionSheetRef> =
    React.useRef<ActionSheetRef>(null)

  const controlsModalRef: React.RefObject<ActionSheetRef> =
    React.useRef<ActionSheetRef>(null)

  const { recents, setRecents, updateActiveTabData, activeTabId, tabsCount } =
    useBrowserStore()

  const [canGoBack, setCanGoBack] = useState(false)
  const [currentOrigin, setCurrentOrigin] = useState(new URL(url).origin)
  const [currentUrl, setCurrentUrl] = useState(url)
  const [confirmModal, setConfirmModal] = useState<JSX.Element>()
  const webViewRef = useRef<WebView>(null)

  const [isFocused, setIsFocused] = useState(false)
  const [hasText, setHasText] = useState(false)

  const hideTabs = flow === 'buy-tokens'

  const textInputRef = useRef<TextInput>(null)

  const displayUrl = isFocused ? currentUrl : trimUrl(currentUrl)

  const borderColor = isFocused ? 'border-purple-500' : 'border-gray-200'

  const backgroundColor = 'white'

  const updateRecents = React.useCallback(
    (recents: string[], url: string) => {
      if (recents.includes(url)) {
        setRecents([url, ...recents.filter(r => r !== url)])
      } else {
        if (recents.length >= 10) {
          recents.pop()
        }
        setRecents([url, ...recents])
      }
    },
    [setRecents],
  )

  const onNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    navState.url

    setCanGoBack(navState.canGoBack)
    setCurrentUrl(navState.url)

    const _currentUrl = new URL(navState.url)

    const origin = _currentUrl.origin

    setCurrentOrigin(origin)

    if (flow === 'buy-tokens') {
      // If the flow is buy-tokens, we don't want to update the recents or tabs
      return
    }

    updateRecents(recents, navState.url)

    if (activeTabId) {
      updateActiveTabData({
        name: origin,
        url: navState.url,
      })
    }
  }, [])

  const goBack = useCallback(() => {
    canGoBack ? webViewRef.current?.goBack() : onClose()
  }, [canGoBack])

  const refresh = useCallback(() => {
    webViewRef.current?.reload()
    controlsModalRef.current?.hide()
  }, [])

  const onOpenTabsButtonPress = () => onOpenTabs()

  const onCancelSearchButtonPress = () => {
    Keyboard.dismiss()
    setIsFocused(false)
  }

  const showControlsModal = () => {
    controlsModalRef.current?.show()
  }

  const onError = (error: WebViewErrorEvent) => {
    alert(error.nativeEvent.description)
  }

  const bookmark = () => {
    controlsModalRef.current?.hide()
    // TODO: implement bookmarking
  }

  const share = () => {
    Share.share({ message: url })
  }

  const runFirst = `
    console.log('firstRun')
    window.isNativeApp = true;
    true;
  ` // note: this is required, or you'll sometimes get silent failures

  const injectedJavaScript = `
    console.log('injected leoWallet');
    if (!window.leoWallet) {
      ${LeoWalletWindow}
    }
  `

  const onMessage = async (event: WebViewMessageEvent) => {
    const { data } = event.nativeEvent
    try {
      const request = JSON.parse(data) as AleoPageMessage

      try {
        const response = await processRequest(currentOrigin, request)
        if (response) {
          // Handle pending responses for actions that require user confirmation
          if (response.type === 'pending_response') {
            // apparently not a great way to type match in typescript

            const onReject = async () => {
              webViewRef.current?.injectJavaScript(
                getInjectableJSMessage({
                  type: AleoPageMessageType.ErrorResponse,
                  reqId: request.reqId,
                  payload: serializeError(
                    new Error(AleoDAppErrorType.NotGranted),
                  ),
                }),
              )
              setConfirmModal(undefined)
            }
            let confirmModal: JSX.Element | undefined

            if (
              request.payload.type === AleoDAppMessageType.PermissionRequest
            ) {
              const onConfirm = async () => {
                const payload = await response.onConfirm()
                webViewRef.current?.injectJavaScript(
                  getInjectableJSMessage({
                    type: AleoPageMessageType.Response,
                    reqId: request.reqId,
                    payload,
                  }),
                )
                setConfirmModal(undefined)
              }

              confirmModal = (
                <ConfirmModal
                  ref={confirmModalRef}
                  origin={currentOrigin}
                  account={account}
                  request={request.payload}
                  response={response}
                  onConfirm={onConfirm}
                  onReject={onReject}
                />
              )
            } else if (
              request.payload.type === AleoDAppMessageType.SignRequest
            ) {
              const onConfirm = async () => {
                const payload = await response.onConfirm()
                webViewRef.current?.injectJavaScript(
                  getInjectableJSMessage({
                    type: AleoPageMessageType.Response,
                    reqId: request.reqId,
                    payload,
                  }),
                )
                setConfirmModal(undefined)
              }

              confirmModal = (
                <ConfirmModal
                  ref={confirmModalRef}
                  origin={currentOrigin}
                  account={account}
                  request={request.payload}
                  response={response}
                  onConfirm={onConfirm}
                  onReject={onReject}
                />
              )
            } else if (
              request.payload.type === AleoDAppMessageType.DecryptRequest
            ) {
              const onConfirm = async () => {
                const payload = await response.onConfirm()
                webViewRef.current?.injectJavaScript(
                  getInjectableJSMessage({
                    type: AleoPageMessageType.Response,
                    reqId: request.reqId,
                    payload,
                  }),
                )
                setConfirmModal(undefined)
              }

              confirmModal = (
                <ConfirmModal
                  ref={confirmModalRef}
                  origin={currentOrigin}
                  account={account}
                  request={request.payload}
                  response={response}
                  onConfirm={onConfirm}
                  onReject={onReject}
                />
              )
            } else if (
              request.payload.type === AleoDAppMessageType.RecordsRequest
            ) {
              const onConfirm = async () => {
                const payload = await response.onConfirm()
                webViewRef.current?.injectJavaScript(
                  getInjectableJSMessage({
                    type: AleoPageMessageType.Response,
                    reqId: request.reqId,
                    payload,
                  }),
                )
                setConfirmModal(undefined)
              }

              confirmModal = (
                <ConfirmModal
                  ref={confirmModalRef}
                  origin={currentOrigin}
                  account={account}
                  request={request.payload}
                  response={response}
                  onConfirm={onConfirm}
                  onReject={onReject}
                />
              )
            } else if (
              request.payload.type === AleoDAppMessageType.TransactionRequest
            ) {
              const onConfirm = async () => {
                const payload = await response.onConfirm()
                webViewRef.current?.injectJavaScript(
                  getInjectableJSMessage({
                    type: AleoPageMessageType.Response,
                    reqId: request.reqId,
                    payload,
                  }),
                )
                setConfirmModal(undefined)
              }

              confirmModal = (
                <ConfirmModal
                  ref={confirmModalRef}
                  origin={currentOrigin}
                  account={account}
                  request={request.payload}
                  response={response}
                  onConfirm={onConfirm}
                  onReject={onReject}
                />
              )
            }

            if (confirmModal && !(await isDAppInteractionsAllowed())) {
              return Alert.alert(
                'DApp Interaction disabled',
                'You need to enable DApp Interaction in Settings.',
                [
                  {
                    isPreferred: true,
                    text: 'Go to Settings',
                    onPress: () => router.replace('/authorized-dapps'),
                  },
                  {
                    text: 'Cancel',
                  },
                ],
              )
            }

            confirmModal && setConfirmModal(confirmModal)
          } else {
            webViewRef.current?.injectJavaScript(
              getInjectableJSMessage(response),
            )
          }
        }
      } catch (error: any) {
        webViewRef.current?.injectJavaScript(
          getInjectableJSMessage({
            type: AleoPageMessageType.ErrorResponse,
            reqId: request.reqId,
            payload: serializeError(error),
          }),
        )
      }
    } catch (error) {
      console.error('Error handling message from WebView:', error)
    }
  }

  useEffect(() => {
    confirmModalRef.current?.show()
  }, [confirmModal, confirmModalRef])

  const edges: Edges | undefined = (() => {
    if (applyTopPadding && applyBottomPadding) return ['top', 'bottom']
    if (applyTopPadding) return ['top']
    if (applyBottomPadding) return ['bottom']
    return undefined
  })()

  return (
    <SafeAreaView
      className={`flex-1 bg-${backgroundColor} ${!applyTopPadding ? 'pt-2' : ''}`}
      edges={edges}
    >
      <View className="flex-row items-center justify-between px-4 py-[8px]">
        {!isFocused ? (
          <View className="flex-row items-center">
            <TouchableOpacity onPress={goBack}>
              <Icon name="arrow-left" size={24} color="black" />
            </TouchableOpacity>
          </View>
        ) : null}
        <View
          className={`
            flex-row flex-1 items-center ${!isFocused ? 'mx-2' : ''} border ${borderColor} rounded-lg h-full h-[40px]`}
        >
          {isFocused ? <Icon name="search" className="ml-2" size={20} /> : null}
          <Pressable
            onPress={() => textInputRef.current?.focus()}
            className={`flex-1 h-[40px] p-1 items-center flex-row ${isFocused ? 'justify-start' : 'justify-center'} gap-1 p-3`}
          >
            {!isFocused && currentUrl && <Icon name="lock" />}
            <TextInput
              key={currentUrl} // This is to force the input to re-render when the URL changes
              ref={textInputRef}
              defaultValue={displayUrl}
              placeholder="Search or type URL"
              onSubmitEditing={event => {
                const text = event.nativeEvent.text
                onUrlUpdate(text)
                refresh()
              }}
              onChange={event => {
                const text = event.nativeEvent.text
                setHasText(!!text)
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="h-full font-semibold"
              returnKeyType="go"
            />
          </Pressable>
          {isFocused && (hasText || currentUrl) ? (
            <TouchableOpacity
              onPress={() => {
                setCurrentUrl('')
                textInputRef.current?.clear()
              }}
            >
              <Icon name="close-circle-fill" className="mr-2" size={20} />
            </TouchableOpacity>
          ) : null}
        </View>
        {!isFocused ? (
          <View className="flex-row items-center">
            {!hideTabs && (
              <TouchableOpacity
                onPress={onOpenTabsButtonPress}
                className="ml-2"
              >
                <TabsCounterIcon count={tabsCount} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={showControlsModal} className="ml-2">
              <Ionicons name="ellipsis-horizontal" size={24} color="black" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={onCancelSearchButtonPress}
            className="ml-[19px]"
          >
            <Text className="text-base">Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        onNavigationStateChange={onNavigationStateChange}
        onError={onError}
        javaScriptEnabled={true}
        injectedJavaScriptBeforeContentLoaded={runFirst}
        injectedJavaScript={injectedJavaScript}
        onMessage={onMessage}
      />
      {confirmModal}
      <WebviewControlsModal
        ref={controlsModalRef}
        onRefresh={refresh}
        onBookmark={bookmark}
        onShare={share}
        applyBottomMargin={applyBottomPadding}
      />
    </SafeAreaView>
  )
}

function getInjectableJSMessage(message: any) {
  return `
    (function() {
      window.dispatchEvent(new MessageEvent('message', {
        data: ${JSON.stringify(message)}
      }));
    })();
  `
}

export default WebViewScreen
