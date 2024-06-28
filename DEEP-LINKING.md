### Deep Linking Usage in the `os-leo-wallet-mobile` Application

Deep linking in the `os-leo-wallet-mobile` app enables direct navigation to specific screens within the application, enhancing user experience by allowing users to jump straight to the desired content. The Expo-router within the application listens for deep link URLs and navigates to the corresponding route within the app. These deep links can include parameters to pass specific data to the application, enabling even more targeted functionality.

#### Deep Linking with URL Parameters

In the `os-leo-wallet-mobile` app, deep links can carry additional information through URL parameters. For example, if you want to direct a user to the `webview` screen and load a specific URL, you can structure the deep link as follows:

```
os-leo-wallet-mobile://webview?url=https://google.com
```

This deep link would instruct the application to navigate to the `webview` route and open `https://google.com` within that view.

#### Examples of Structured Deep Links

Here are more examples showcasing how you can structure deep links to leverage different functionalities within the `os-leo-wallet-mobile` app:

- **Opening a Specific Article in WebView:** Suppose you want to direct users to an article within your application. You can pass the article URL as a parameter:

  ```
  os-leo-wallet-mobile://webview?url=https://example.com/article
  ```

- **Navigating to the Send Tokens Screen:** If you want to initiate a token sending process, you might use a deep link like:

  ```
  os-leo-wallet-mobile://send-tokens
  ```

  If there are specific parameters you can pass to pre-populate fields (e.g., the recipient's address or token amount), you would include those in the link as well.

- **Viewing Specific NFT Details:** To direct a user to a particular NFT detail page:

  ```
  os-leo-wallet-mobile://nft-details?id=12345
  ```

  Assuming the `nft-details` route is configured to accept an ID parameter, this link would load details for the NFT with ID 12345.

#### Testing Deep Links

You can test these deep links using ADB for Android devices, ensuring that each link navigates to the correct screen and handles parameters as expected. For instance, to test the `webview` deep link mentioned above:

```bash
adb shell am start -W -a android.intent.action.VIEW -d "os-leo-wallet-mobile://webview?url=https://google.com" com.demoxlabs.leowallet.dev
```

This direct testing approach allows you to verify that each aspect of your deep linking setup operates correctly, ensuring users have a smooth experience navigating your app via deep links.


#### App Routing Tree


```
PUBLIC ROUTES
├── auth
│   ├── auth-splash -> auth/auth-splash
│   └── login -> auth/login
├── create-password -> create-password
├── db-example -> db-example
├── forgot-password -> forgot-password
├── get-started -> get-started
├── import-wallet -> import-wallet
├── index -> index
├── network-logger -> network-logger
├── qr-code-scanner -> qr-code-scanner
├── screens-list -> screens-list
├── sdk-example -> sdk-example
├── signup -> signup
├── storybook -> storybook
├── verify-seed-phrase -> verify-seed-phrase
├── webview -> webview
└── welcome -> welcome

PRIVATE ROUTES
├── activities -> activities
├── browser -> browser
├── home -> home
├── nfts
│   ├── index -> nfts/index
│   └── nft-details -> nfts/nft-details
└── tab-settings -> tab-settings
├── accounts -> accounts
├── back-up-wallet -> back-up-wallet
├── biometric-auth-enroll -> biometric-auth-enroll
├── buy-tokens
│   ├── amount -> buy-tokens/amount
│   ├── index -> buy-tokens/index
│   ├── method -> buy-tokens/method
│   └── success -> buy-tokens/success
├── convert-token
│   ├── index -> convert-token/index
│   └── review -> convert-token/review
├── create-account -> create-account
├── import-account -> import-account
├── receive -> receive
├── select-transaction-type -> select-transaction-type
├── send-tokens
│   ├── address-book -> send-tokens/address-book
│   ├── choose-token -> send-tokens/choose-token
│   ├── configure-send -> send-tokens/configure-send
│   ├── customize-fee -> send-tokens/customize-fee
│   ├── index -> send-tokens/index
│   ├── review -> send-tokens/review
│   ├── step-2 -> send-tokens/step-2
│   ├── transaction-details -> send-tokens/transaction-details
│   └── transaction-initiated -> send-tokens/transaction-initiated
├── settings
│   ├── about -> settings/about
│   ├── account-name -> settings/account-name
│   ├── address-book
│   │   ├── add-contact -> settings/address-book/add-contact
│   │   └── index -> settings/address-book/index
│   ├── advanced -> settings/advanced
│   ├── authorized-dapps -> settings/authorized-dapps
│   ├── file-settings -> settings/file-settings
│   ├── general -> settings/general
│   ├── remove-account -> settings/remove-account
│   ├── reveal-private-key -> settings/reveal-private-key
│   ├── reveal-seed-phrase -> settings/reveal-seed-phrase
│   └── reveal-view-key -> settings/reveal-view-key
└── stake
    ├── active-stake -> stake/active-stake
    ├── empty-balance -> stake/empty-balance
    ├── index -> stake/index
    ├── staking -> stake/staking
    └── token-details -> stake/token-details
```