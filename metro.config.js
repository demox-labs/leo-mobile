const { getSentryExpoConfig } = require('@sentry/react-native/metro')

module.exports = (async () => {
  const config = getSentryExpoConfig(__dirname)

  config.transformer = {
    ...config.transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  }

  const { resolver } = config
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...resolver.sourceExts, 'svg'],
  }

  config.resolver.resolverMainFields.unshift('sbmodern')

  return config
})()
