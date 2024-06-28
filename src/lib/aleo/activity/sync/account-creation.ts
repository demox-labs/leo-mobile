import * as Repo from 'src/lib/aleo/db/repo'

export async function setAccountCreationBlockHeight(
  chainId: string,
  address: string,
  blockHeight: number,
): Promise<void> {
  const existingAccountCreationBlockHeight =
    await Repo.AccountCreationBlockHeightsTable.getByChainIdAndAddress(
      chainId,
      address,
    )
  if (existingAccountCreationBlockHeight === undefined) {
    await Repo.AccountCreationBlockHeightsTable.insertNew({
      chainId,
      address,
      blockHeight,
    })
  }
}

export async function getAccountCreationBlockHeight(
  chainId: string,
  address: string,
): Promise<number> {
  const blockHeight =
    await Repo.AccountCreationBlockHeightsTable.getByChainIdAndAddress(
      chainId,
      address,
    )
  return blockHeight?.blockHeight ?? 0
}
