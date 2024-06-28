export type AssetMetadata = {
  // Common
  decimals: number
  symbol: string
  name: string
  programId: string

  // [default: false]
  // Allows wallets to decide whether or not a symbol should be displayed
  // in place of a name.
  shouldPreferSymbol?: boolean

  // [format: uri-reference]
  // A URI to an image of the asset for wallets and client applications
  // to have a scaled down image to present to end-users.
  // Recommend maximum size of 350x350px.
  thumbnailUri?: string

  // [format: uri-reference]
  // A URI to an image of the asset.
  // Used for display purposes.
  displayUri?: string

  // [format: uri-reference]
  // A URI to the asset.
  artifactUri?: string
}
