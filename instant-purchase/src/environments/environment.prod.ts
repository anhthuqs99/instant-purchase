// @ts-nocheck
export const environment = {
  production: true,
  serverMode: 'release',
  wet_market_account_number: '',

  api_prefix: '/api/',
  eventsURL: 'wss://feralfile1.dev.bitmark.com/api/events',
  back_office_URL: 'https://feralfile1-backoffice.dev.bitmark.com',

  etherscanExplorer: 'https://etherscan.io',
  metamaskDeepLink: 'https://metamask.app.link/dapp/feralfile1.dev.bitmark.com',
  cloudFrontEndpoint: 'https://d1l3yxhqoo0dav.cloudfront.net/',

  indexerImageURLPrefix: 'https://imagedelivery.net/iCRs13uicXIPOWrnuHbaKA',

  stripe_pk: '',
  artwork_preserved_hour: '24',
  launchThresholdSeconds: '300',
  orderCodeLength: '8',

  series_file_size_limit: '2147483648',
  series_thumbnail_file_size_limit: '512000',
  avatar_file_size_limit: '2097152',

  withdrawalTokenExpiresInMinute: '3',
  withdrawalLimitPer24Hour: '5000',

  videoPreviewFileSizeLimit: '52428800',
  audioPreviewFileSizeLimit: '52428800',
  imagePreviewFileSizeLimit: '52428800',
  pdfPreviewFileSizeLimit: '52428800',
  txtPreviewFileSizeLimit: '52428800',
  gifPreviewFileSizeLimit: '52428800',

  videoPreviewSupportedExt: 'mp4',
  audioPreviewSupportedExt: 'wav',
  imagePreviewSupportedExt: 'jpg,jpeg,png',
  thumbnailSupportedExt: 'jpg,jpeg,png',
  gifPreviewSupportedExt: 'gif',
  supportedMediums: '3d,software,video,audio,image,animated gif,pdf,txt',

  emailRegex: '^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$',
  aliasRegex: '^[A-Za-z0-9][A-Za-z0-9s._&-]*[A-Za-z0-9][._&-]?$',
  aliasMinLength: '3',
  aliasMaxLength: '50',

  usdcContractAddress: '',
  englishAuctionContractAddress: '0xa180895570cb118454077759f40621D714C1E3e8',
  mixpanelProjectToken: '',

  // --------- client configuration only ----------
  MoMAExhibitionIDs:
    'e9c1bf2f-f50e-466b-9d2a-dbfa673daa85,53e958b9-71f2-45da-a979-b3343b322221,e3a2a207-ea91-461b-80db-18c7ffbfe8ce',

  // ----- Tezos ----------------
  tezosExplorerURL: 'https://tzkt.io',
  xtzDepositLimitation: '20000',
  tezosDomainNameContract: 'KT1GBZmSxmnKJXGMdMLbugPfLyUPmuLSMwKS',
  tezosToolkit: 'https://mainnet.api.tez.ie',
  tzktAPIPrefix: 'https://api.tzkt.io/v1',

  // Coin base
  coinBaseURL: 'https://api.coinbase.com/v2',

  // Indexer
  nftIndexerURL: 'https://nft-indexer.bitmark.com/v1',

  // -----------Etherscan link
  etherscanWalletEndpoint: 'https://etherscan.io',

  // ------ Reservoir -------
  reservoirURL: '',

  // Wallet Connect 2.0
  walletConnectV2ProjectID: '',
  walletChainID: '1',
  autonomyChainID: '',

  //MoMA burn and mint
  BurnAndMintContractAddress: '',
  FF09ContractAddress: '',
  Tier3AWContractAddress: '',
  BurnEndDate: '',

  // Special Exhibition
  jg043ExhibitionID: 'a0d2f49b-2229-4c4d-88df-fff9c6e70981',
  ts044ExhibitionID: '3c4b0a8b-6d3e-4c32-aaae-c701bb9deca9',
};
