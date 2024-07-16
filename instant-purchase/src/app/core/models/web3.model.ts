export enum Web3AuthorizeType {
  SessionRequest = 'session_request',
  PersonalSign = 'personal_sign',
}

export enum BlockchainType {
  bitmark = 'bitmark',
  tezos = 'tezos',
  ethereum = 'ethereum',
}

export enum BlockchainAcronym {
  ethereum = 'eth',
  bitmark = 'bmk',
  tezos = 'tez',
}

export enum CommonAction {
  CommonActionUploadAvatar = 'upload avatar',
  CommonActionDelateAvatar = 'delete avatar',
  CommonActionUpdateMe = 'update profile',
  CommonActionDownloadSeries = 'download series',
  CommonActionDownloadSeriesApp = 'download series application',
}

export enum Web3SignRequest {
  Common = 'Common',
  Custom = 'Custom',
}

export class AutonomyWalletBalance {
  ethereum? = 0;
  tezos? = 0;
}

export class AutonomyCurrencyRound {
  ethereum? = '';
  tezos? = '';
}

export class SignMessageParameters {
  address?: string;
  action?: CommonAction;
  customMessage?: string;
}

export class SignMessageResponse {
  message: string;
  signature: string;
  publicKey: string;
}

export enum WalletName {
  SafeWeb = 'Safe{Wallet}',
  Unknown = 'unknown',
}
