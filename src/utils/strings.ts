import { DecryptPermission } from '@demox-labs/aleo-wallet-adapter-base'
import { Platform } from 'react-native'

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const getDecryptLabel = (type: DecryptPermission) => {
  switch (type) {
    case DecryptPermission.AutoDecrypt:
      return 'Auto decrypt'
    case DecryptPermission.NoDecrypt:
      return 'No decrypt'
    case DecryptPermission.OnChainHistory:
      return 'On-chain history'
    case DecryptPermission.UponRequest:
      return 'On request'
    default:
      return 'None'
  }
}

export const biometricTypeName = Platform.select({
  ios: 'Touch ID / Face ID',
  android: 'Fingerprint / Face',
  default: 'Biometric Authentication',
})

export const trimUrl = (url: string) => {
  return url
    .replace(/^https?:\/\//, '') // Remove the protocol
    .replace(/\/$/, '') // Remove trailing slash
}

export const ValidUrlHosts = [
  'leo.app',
  'app.leo.app',
  'demo.leo.app',
  'arcane.finance',
  'staking.xyz',
  'duckduckgo.com',
  '*.google.com',
  'google.com',
]

const validUrlRegex =
  /^(https?:\/\/)?(www\.)?((leo\.app|app\.leo\.app|demo\.leo\.app|arcane\.finance|staking\.xyz|duckduckgo\.com)|([a-zA-Z0-9-]+\.)*google\.com)$/

export const sanitizeUrl = (url: string | undefined) => {
  if (url) {
    const urlObject = new URL(url)
    // regex match for valid hosts
    if (validUrlRegex.test(urlObject.hostname)) {
      return url
    }
  }

  return 'https://app.leo.app'
}

export const sanitizeDeepLink = (urlString: string) => {
  try {
    const url = new URL(urlString, 'os-leo-wallet-mobile://')
    const validHostnames = ['app.leo.app', 'os-leo-wallet-mobile']
    const validPaths = [
      {
        path: '/send-tokens',
        target: '/send-tokens',
      },
      {
        path: '/convert-token',
        target: '/convert-token',
      },
      {
        path: '/receive',
        target: '/receive',
      },
      {
        path: '/stake',
        target: '/stake',
      },
      {
        path: '/',
        target: '/home',
      },
      {
        path: '/settings',
        target: '/tab-settings',
      },
      {
        path: '/receive',
        target: '/receive',
      },
      {
        path: '/browser',
        target: '/browser/browser-webview',
      },
    ]

    if (validHostnames.includes(url.hostname)) {
      const allowedPath = validPaths.find(p => p.path === url.pathname)

      if (!allowedPath) {
        return '/404'
      }

      return url.hostname + '://' + allowedPath.target + url.search
    }

    return '/404'
  } catch {
    // Do not crash inside this function! Instead you should redirect users
    // to a custom route to handle unexpected errors, where they are able to report the incident
    return '/unexpected-error'
  }
}
