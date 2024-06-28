import { ILog, sendLog } from '@src/lib/aleo-chain/client'
import { AleoChainId } from '@src/lib/aleo/types'
import useSettingsStore from '@src/state/zustand/settings'

class ServerLogger {
  chainId: AleoChainId

  constructor(chainId: AleoChainId) {
    this.chainId = chainId
  }

  private censorKeys(input: string): string {
    const privateKeyPattern = /APrivateKey[\w\d]{48}/g
    const privateKeyreplacementText = 'APrivateKey****'
    const viewKeyPattern = /AViewKey[\w\d]{45}/g
    const viewKeyreplacementText = 'AViewKey****'
    return input
      .replace(privateKeyPattern, privateKeyreplacementText)
      .replace(viewKeyPattern, viewKeyreplacementText)
  }

  async info(message: string, meta?: any) {
    console.info(message)
    await this.sendLog('info', message, meta)
  }

  async warning(message: string, meta?: any) {
    console.warn(message)
    await this.sendLog('warn', message, meta)
  }

  async error(message: string, meta?: any) {
    console.error(message, meta)
    await this.sendLog('error', message, meta)
  }

  private async sendLog(level: string, message: string, meta: any = {}) {
    // TODO: Add logic to send only production logs to server
    if (!useSettingsStore.getState().isAnonymousAnalyticsEnabled) {
      return
    }

    meta = {
      app: 'LeoWalletMobile',
      ...(meta || {}),
    }
    const censoredMeta = this.censorKeys(JSON.stringify(meta))
    const log: ILog = {
      level: level,
      message: this.censorKeys(message),
      meta: JSON.parse(censoredMeta),
    }

    await sendLog(this.chainId, log)
  }
}

const envLogger = new ServerLogger(AleoChainId.TestnetBeta)
export const logger = envLogger
