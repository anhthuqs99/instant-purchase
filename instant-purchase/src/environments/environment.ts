// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  serverMode: 'debug',
  wet_market_account_number:
    'f18TudZGqXzwCArzqwhEPtc88whwWjVQgKpMc1Sni8QoVxAFMb',

  api_prefix: 'https://feralfilebrandon.dev.bitmark.com/api/',
  eventsURL: 'wss://feralfilestg.dev.bitmark.com/api/events',
  back_office_URL: 'https://feralfile1-backoffice.dev.bitmark.com',

  etherscanExplorer: 'https://sepolia.etherscan.io',
  metamaskDeepLink: 'https://metamask.app.link/dapp/feralfile1.dev.bitmark.com',
  cloudFrontEndpoint: 'https://d1l3yxhqoo0dav.cloudfront.net/',

  indexerImageURLPrefix: 'https://imagedelivery.net/zDrO-YmKDy1tz0_bjCkDJg',

  stripe_pk:
    'pk_test_519j0AQEVkg5BfxVlYy7cAJ6jUyRZ8RYsJIbFSfwOS1yb7ndvoVHnkKqie2w1XXfrDHPIizh1QD9l5jB7DPcLSPlG008WJRUnAE',
  artwork_preserved_hour: '24',
  launchThresholdSeconds: '300',
  orderCodeLength: '8',

  series_file_size_limit: '2147483648',
  series_thumbnail_file_size_limit: '512000',
  avatar_file_size_limit: '2097152',

  withdrawalTokenExpiresInMinute: '3',
  withdrawalLimitPer24Hour: '100.00',

  videoPreviewFileSizeLimit: '115343360',
  audioPreviewFileSizeLimit: '57671680',
  imagePreviewFileSizeLimit: '11534336',
  pdfPreviewFileSizeLimit: '11534336',
  txtPreviewFileSizeLimit: '11534336',
  gifPreviewFileSizeLimit: '23068672',

  videoPreviewSupportedExt: '.mp4',
  audioPreviewSupportedExt: '.m4a',
  imagePreviewSupportedExt: '.png,.jpg,.jpeg',
  thumbnailSupportedExt: '.png,.jpg,.jpeg',
  gifPreviewSupportedExt: '.gif',
  supportedMediums: '3d,software,video,audio,image,animated gif,pdf,txt',

  emailRegex: '^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$',
  aliasRegex: '^[A-Za-z0-9][A-Za-z0-9s._&-]*[A-Za-z0-9][._&-]?$',
  aliasMinLength: '3',
  aliasMaxLength: '70',

  usdcContractAddress: '0xc1e9e0355fdfc014ad0bdcae78d44e43e442605d',
  englishAuctionContractAddress: '0xC044Cc122d638352F1371970aCe8889D4DB134c7',
  mixpanelProjectToken: 'fb104fd8c4869cf5ff105f6b325fcf40',

  // --------- client configuration only ----------
  MoMAExhibitionIDs:
    '57415b9f-f372-40b5-be78-b212b9cfee8d,94ff4f52-75b0-47c1-8fd5-224b43b8d3e4',

  // ----- Tezos ----------------
  tezosExplorerURL: 'https://limanet.tzkt.io',
  xtzDepositLimitation: '20000',
  tezosDomainNameContract: 'KT1GBZmSxmnKJXGMdMLbugPfLyUPmuLSMwKS',
  tezosToolkit: 'https://mainnet.api.tez.ie',
  tzktAPIPrefix: 'https://api.ghostnet.tzkt.io/v1',

  // Coin base
  coinBaseURL: 'https://api.coinbase.com/v2',

  // ------ NFT Indexer -------
  nftIndexerURL: 'https://indexer.dev.feralfile.com',
  etherscanWalletEndpoint: 'https://sepolia.etherscan.io',

  // ------ Reservoir -------
  reservoirURL: 'https://api-sepolia.reservoir.tools',

  // Wallet Connect 2.0
  walletConnectV2ProjectID: 'e890d30a31ed144496a9251b7675a214',
  walletChainID: '11155111',
  autonomyChainID: 'autonomy:1',

  //MoMA burn and mint
  BurnAndMintContractAddress: '0xC3ea9E142dc2bF594e1F54C6D85B68A558F5c5e6',
  FF09ContractAddress: '0x2ff21d94E622Ee99b52B64Ac46f9DeE09D290a3a',
  Tier3AWContractAddress: '0xCDa6b6086498f7085917f1aD4797E132e1BD08F5',
  BurnEndDate: '2023-09-09T00:00:00Z', //GMT Date

  // Special Exhibition
  jg043ExhibitionID: '500384a2-dc5e-40db-a7db-f16529710dcb',
  ts044ExhibitionID: '10f1fc6a-6863-43df-ac34-06f84da626e7',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
