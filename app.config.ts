import 'ts-node/register'
import { ExpoConfig, ConfigContext } from 'expo/config'
const APP_VARIANT = process.env.APP_VARIANT || 'development'

import { VersionName, VersionCode } from './version'

let AppName = 'Leo Wallet'
let AppId = 'os.demoxlabs.leo'

switch (APP_VARIANT) {
  case 'development':
    AppName = 'Leo Wallet Dev'
    AppId = 'os.demoxlabs.leowallet.dev'
    break
  case 'staging':
    AppName = 'Leo Wallet Staging'
    AppId = 'os.demoxlabs.leowallet'
    break
  case 'production':
    break
  default:
    throw new Error(`Unknown APP_VARIANT: ${APP_VARIANT}`)
}

export default ({ config: expoConfig }: ConfigContext): ExpoConfig => {
  const config: ExpoConfig = {
    ...expoConfig,
    name: AppName,
    slug: 'os-leo-wallet-mobile',
    scheme: 'os-leo-wallet-mobile',
    version: VersionName,

    orientation: 'portrait',
    icon: './src/assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './src/assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#634CFF',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      buildNumber: String(VersionCode),
      supportsTablet: true,
      bundleIdentifier: AppId,
      // associatedDomains: ['applinks:app.leo.app'],
      config: {
        usesNonExemptEncryption: false,
      },
      privacyManifests: {
        NSPrivacyAccessedAPITypes: [
          {
            NSPrivacyAccessedAPIType:
              'NSPrivacyAccessedAPICategoryUserDefaults',
            NSPrivacyAccessedAPITypeReasons: ['CA92.1'],
          },
        ],
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#634CFF',
        foregroundImage: './src/assets/adaptive-icon.png',
        monochromeImage: './src/assets/adaptive-icon.png',
      },
      package: AppId,
      versionCode: VersionCode,
      softwareKeyboardLayoutMode: 'pan',
      // intentFilters: [
      //   {
      //     action: 'VIEW',
      //     autoVerify: true,
      //     data: [
      //       {
      //         scheme: 'https',
      //         host: 'app.leo.app',
      //         pathPrefix: '/',
      //       },
      //     ],
      //     category: ['BROWSABLE', 'DEFAULT'],
      //   },
      // ],
    },
    web: {
      favicon: './src/assets/favicon.png',
      bundler: 'metro',
    },
    plugins: [
      [
        '@sentry/react-native/expo',
        {
          organization: '<sentry_organization>',
          project: '<sentry_project>',
        },
      ],
      [
        'expo-build-properties',
        {
          ios: {
            flipper: false,
          },
          android: {
            minSdkVersion: 23,
            packagingOptions: {
              pickFirst: [
                'lib/arm64-v8a/libcrypto.so',
                'lib/armeabi-v7a/libcrypto.so',
                'lib/x86/libcrypto.so',
                'lib/x86_64/libcrypto.so',
              ],
            },
          },
        },
      ],
      'expo-font',
      [
        'expo-local-authentication',
        {
          faceIDPermission: 'Allow $(PRODUCT_NAME) to use Face ID.',
        },
      ],
      [
        'react-native-vision-camera',
        {
          enableCodeScanner: true,
        },
      ],
      'expo-router',
      'expo-localization',
    ],
    experiments: {
      tsconfigPaths: true,
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: '<project_id>',
      },
    },
    owner: 'leo-wallet',
    runtimeVersion: {
      policy: 'appVersion',
    },
    updates: {
      url: 'https://u.expo.dev/<project_id>',
    },
  }

  return config
}
