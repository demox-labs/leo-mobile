import { AleoStatus, useAleoClient } from '@src/lib/aleo'
import useSettingsStore from '@src/state/zustand/settings'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppState, AppStateStatus, PanResponder, View } from 'react-native'
import LeoToast from './leo-toast'
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated'

const MILLISECONDS_PER_SECOND = 1000
const DEFAULT_TIMEOUT_SECONDS = 60 * 10 // 10 minutes
const DEFAULT_COUNTDOWN_SECONDS = 5

/**
 * `InactivityComponent` monitors user inactivity within a React Native application and locks the app after a specified period of inactivity. It listens to app state changes and user interactions to reset the inactivity timer. When the inactivity timer expires, the application is locked, and a countdown is displayed shortly before this happens.
 *
 *
 * Behavior:
 * - Utilizes the AppState to listen for changes in the app's foreground/background state and user interactions to manage the inactivity timeout.
 * - Leverages `useAleoClient` for accessing the lock functionality and determining the app's readiness state.
 * - Employs `useSettingsStore` to retrieve user settings, particularly checking if the wallet lock-up feature is enabled.
 * - Implements a countdown mechanism that triggers a visual cue (`LeoToast`) to inform the user of the impending app lock.
 * - Provides a flexible architecture to adapt to different timeout durations and app states, ensuring the app responds accurately to user activity and system events.
 *
 * Example Usage:
 * ```
 * <InactivityComponent>
 *   <YourAppComponents />
 * </InactivityComponent>
 * ```
 */

interface InactivityComponentProps {
  children: React.ReactNode
}
const InactivityComponent: React.FC<InactivityComponentProps> = ({
  children,
}) => {
  const { lock, data } = useAleoClient()
  const { isWalletLockUpEnabled } = useSettingsStore()

  const [lastActiveTimeMs, setLastActiveTimeMs] = useState(Date.now())
  const [countDownSeconds, setCountDownSeconds] = useState(0)

  // To be able to change the timeout duration in the future
  // const [timeoutSeconds] = useState(DEFAULT_TIMEOUT_SECONDS)

  const appState = useRef(AppState.currentState)
  const timerId = useRef<NodeJS.Timeout | null>(null)
  const triggerCountdownTimerId = useRef<NodeJS.Timeout | null>(null)
  const countdownTimerId = useRef<NodeJS.Timeout | null>(null)

  const clearAllTimers = useCallback(
    () =>
      [countdownTimerId, triggerCountdownTimerId, timerId].forEach(timer => {
        if (timer.current) {
          clearInterval(timer.current)
          clearTimeout(timer.current)
          timer.current = null
        }
      }),
    [],
  )

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (isWalletLockUpEnabled === false) return
      // Calculate the time at which the app should lock.
      const timeoutTimeMs =
        lastActiveTimeMs + DEFAULT_TIMEOUT_SECONDS * MILLISECONDS_PER_SECOND

      // Lock the app if it comes to the foreground past the timeout time.
      if (appState.current.match(/background/) && nextAppState === 'active') {
        if (timeoutTimeMs < Date.now()) lock()

        resetInactivityTimeout()
      } else if (nextAppState === 'background' || nextAppState === 'unknown') {
        // Clear timers and reset the last active time when app goes to the background.
        clearAllTimers()
        setLastActiveTimeMs(Date.now())
      }

      appState.current = nextAppState
    }

    // Subscribe to app state changes.
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    )

    // Cleanup on unmount or app state changes.
    return () => {
      subscription.remove()
      clearAllTimers()
    }
  }, [])

  // Resets the inactivity timer whenever the relevant dependencies change.
  useEffect(() => {
    resetInactivityTimeout()
  }, [data.status, isWalletLockUpEnabled])

  // Initializes pan responder to handle user interactions and reset inactivity timeout.
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponderCapture: () => {
          resetInactivityTimeout()

          return false
        },
      }),
    [data.status, isWalletLockUpEnabled],
  )

  // Starts a countdown timer before the lock is activated.
  const startCountdown = useCallback(() => {
    triggerCountdownTimerId.current = setTimeout(
      () => {
        setCountDownSeconds(DEFAULT_COUNTDOWN_SECONDS)

        countdownTimerId.current = setInterval(() => {
          setCountDownSeconds(prev => prev - 1)
        }, MILLISECONDS_PER_SECOND)
      },
      MILLISECONDS_PER_SECOND *
        (DEFAULT_TIMEOUT_SECONDS - DEFAULT_COUNTDOWN_SECONDS),
    )
  }, [])

  // Resets the inactivity timeout and starts the countdown before locking.
  const resetInactivityTimeout = useCallback(() => {
    clearAllTimers()
    setCountDownSeconds(0)

    if (data.status !== AleoStatus.Ready || !isWalletLockUpEnabled) {
      return
    }

    // Set a timer to lock the app after the specified timeout period.
    timerId.current = setTimeout(() => {
      lock()
      clearAllTimers()
    }, MILLISECONDS_PER_SECOND * DEFAULT_TIMEOUT_SECONDS)

    startCountdown()
  }, [data.status, isWalletLockUpEnabled])

  return (
    <View className="flex-1" {...panResponder.panHandlers}>
      {children}

      {/* Display a countdown toast message before locking the app. */}
      <Animated.View
        className="absolute z-10 left-4 right-4 bottom-24"
        entering={FadeInDown}
        exiting={FadeOutDown}
      >
        {countDownSeconds > 0 ? (
          <LeoToast
            message={`Lock-up in ${countDownSeconds} seconds`}
            type="info"
          />
        ) : null}
      </Animated.View>
    </View>
  )
}

export default InactivityComponent
