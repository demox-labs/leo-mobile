import { NETWORKS } from './networks'

export function fetchChainId(rpcUrl: string) {
  // should really use an rpc client, but one is not defined yet.
  const chainId = NETWORKS.find(n => n.rpcBaseURL === rpcUrl)?.id
  return chainId
}
