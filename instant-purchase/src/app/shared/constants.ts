export enum ErrorCodes {
  WrongNetwork = 1,
  InternalServer = 999,
  // Wallet Sign
  UserRejected = 2,

  InvalidParameters = 1000,
  NotLoggedIn = 1002,
  InvalidEmail = 1014,
  WrongVerificationCode = 1015,
  OperationIsNotPermitted = 1016,
  NotAcceptEmail = 1020,
  RequiredChangeNewEmail = 1021,

  AccountNotFound = 2000,
  PermissionDenied = 2001,
  aliasUpdateNotPermitted = 2002,
  InvalidAccount = 2003,
  AccountTOTPNotAvailable = 2004,
  AccountTOTPActivated = 2005,
  AccountTOTPInactivated = 2006,
  AccountTOTPRequired = 2007,
  AccountTOTPInvalid = 2008,
  AccountTOTPRecoveryPhrase = 2009,
  TakenAlias = 2010,
  InvalidAlias = 2011,
  AccountTOTPTOTPRecoveryInvalid = 2020,
  InvalidEthereumRoyaltiesAddress = 2033,
  InvalidETHAddress = 2035,
  WyreRefundHasStarted = 2036,
  InvalidEthereumArtistAddress = 2037,
  InvalidTezosArtistAddress = 2038,
  WebsiteTooLong = 2039,
  AliasTaken = 2040,
  EmailAlreadyInUse = 2041,
  AccountAlreadyExisted = 2042,
  InvalidLinkAccountAddress = 2048,
  LinkAccountExisted = 2049,

  // Series
  SeriesCannotDelete = 3024,

  OrderNotReady = 4000,
  SellerNotReady = 4003,
  ArtworkOnSale = 4008,
  TransferToFeralFile = 4011,
  PaymentFailed = 4012,
  FirstSaleSoldOut = 4019,
  SetSaleHasEnded = 4021,
  ExhibitionNotStarted = 5006,
  InvalidExhibitionTimePeriod = 5013,
  ExhibitionUpdateNotPermitted = 5022,
  ExhibitionChecklistNotCompleted = 5024,

  ArtworkNotFound = 6000,
  ArtworkIsArchive = 6002,
  TransferToYourself = 6003,
  ArtworkNotReady = 6001,
  InvalidTransferToAddress = 6005,
  ClaimCodeNotFound = 6016,
  ClaimCodeHasBeenClaimed = 6017,

  TokenExpired = 7000,
  InvalidAddress = 8000,
  UnsupportedCurrency = 8001,
  InsufficientBalances = 8002,
  WithdrawalInvalidAmount = 8005,
  WithdrawalLimitPer24h = 8006,
  WalletIsBusy = 8008,

  BidAskNotFound = 9000,
  BidAskCreationNotPermitted = 9001,
  LimitOneActiveOrder = 9002,
  OrderCreationTooQuick = 9003,
  SaleNotFound = 9004,
  OrderCancelled = 9005,
  SaleBeingProcessed = 9006,
  SaleIsNotReady = 9007,
  OrderBundleCreationTooQuick = 9008,
  PurchasingLimited = 9009,
  AllSaleSlotsOccupied = 9010,
  CanNotFindSlotInTime = 9011,
  AuctionHasPaused = 9017,

  AuctionNotFound = 10000,
  AuctionHasEnded = 10001,
  MinIncrementRequired = 10002,
  AnotherUserIsBidding = 10003,
  IsWinning = 10004,
  OwnArtwork = 10005,
  ArtworkBeingOffered = 10006,
  NotMeetMinPrice = 10007,
  NoBidYet = 10008,
  CreditCardBidTooSmall = 10014,

  InvalidBillingDetail = 12002,
  FailedPaymentCreation = 12003,
  PaymentNotCompleted = 12004,
  StripePaymentError = 12007,
  StripePaymentConfirmFailed = 12008,

  // Web3
  AccountConnectedWithWeb3Address = 2012,
  Web3AccountNotConnectedWithAccount = 2013,
  Web3AddressAlreadyConnectedWithAnAccount = 2018,
  TOTPRecoveryIsBlocked = 2023,
  InvalidOpenSeaEthAddress = 2025,
  OpenSeaEthAddressExisted = 2026,
  InvalidTzsRoyatiesAddress = 2027,
  TransferToWrongRecipientType = 2031,

  CannotSwapped = 21000,
  SwapNotFound = 21001,
  CannotCancelSwap = 21002,
  SwapCancelled = 21003,
  SwapInProgress = 21004,
  SwapPermission = 21005,
  SwapIsCreating = 21007,

  CannotTransfer = 22000,
  TransferNotFound = 22001,
  CannotCancelTransfer = 22002,
  TransferCancelled = 22003,
  TransferInProgress = 22004,
  TransferPermission = 22005,
  CannotDetermineTransferFee = 22006,
  TransferIsCreating = 22007,

  MigrationArtworksNotReady = 23002,
  MigrationIsNotExistingToCancel = 23004,
  MigrationAlreadyStarted = 23005,

  // MoMA events
  ShippingInfoExisted = 27000,
  TokenIDNotFound = 27001,
  ProvenanceNotFound = 27002,
  TokenIdNotBeLongUser = 27003,

  StripeCardDeclined = 'card_declined',
}

export const AppSetting = {
  BTCRoundFactor: '1.8-8',
  ETHRoundFactor: '1.2-6',
  USDCRoundFactor: '1.2-2',
  XTZRoundFactor: '1.2-2',
  withdrawMinimumTransactionSize: 2,
  exhBufferTimerMillsSec: 1500,
  AutonomyWalletLink: {
    ios: 'https://apps.apple.com/app/id1544022728',
    android:
      'https://play.google.com/store/apps/details?id=com.bitmark.autonomy_client',
  },
  featuredWorksMinLength: 4,
  featuredWorksMaxLength: 8,
  shortPollingSeconds: 5,
  mediumPollingSeconds: 30,
  longPollingSeconds: 60,
  defaultHighLightNumber: 1000,
  bufferTimeForBidOnServer: 1,
  hiddenTabCode: -1,
  itemPerPage: 20,
  curatorItemPerPage: 50,
  AutonomyDeepLink: 'https://autonomy.io',
  ffWalletName: 'ffWallet.name',
  walletconnect: 'walletconnect',
  loginWalletconnect: 'loginWalletconnect',
  timeOutForWaitingSign: 180000,
  walletConnectDomainBridge: 'https://bridge.walletconnect.org',
  walletConnectDomainWebSocket: 'wss://bridge.walletconnect.org',
  discordLink: 'https://discord.gg/QVjjMzqzPJ',
  googleCalendar:
    'https://calendar.google.com/calendar/u/0/r/eventedit?text={exhibitionTitle}&dates={date}&details={detail}',
  subscribeGoogleCalendar:
    'https://calendar.google.com/calendar/u/0?cid=Y19wbmJxdnJoYmZwMmFmN2N0NHEwNWQzbnRrc0Bncm91cC5jYWxlbmRhci5nb29nbGUuY29t',
  mailSupport: 'support@feralfile.com',
  infuraID: '5465443fa84345b9ab187b25d88ab73b',
  footerHeightThresholdDarkMode: 1000,
  footerHeightThresholdLightMode: 800 + window.innerWidth, // Footer top height with buffer + 3D object height
  maxDomainName: 100,
  cloudFlareHostingDomain: 'imagedelivery.net',
  ethPRCEndpoint: {
    1: 'https://mainnet.infura.io/v3/daf723d77ae54edf8b2abaf59f629cd1',
    5: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    11155111: 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  },
  txHashPrefix: 'FF_TX_',
  txHashExpiredBufferMiliseconds: 300000,
  MementoExhIDs: [
    '00370334-6151-4c04-b6be-dc09e325d57d',
    '3ee3e8a4-90dd-4843-8ec3-858e6bea1965',
  ],
  testExhibitionOnSale: 'testExhibitionOnSale',
  modalDismissTime: 200,
  websitePattern:
    'http(s)?:\\/\\/([\\w-]+\\.)+[\\w-]+(\\/[\\w\\- ;,.\\/\\?%&=]*)?',
  theExperimentExhibitionID: '4e32b3a3-87c5-42eb-817a-834202a7b389',
  sourceExhibitionID: 'source',
  a2pSuffix: '<A2P>',
  tezosSuffix: '_tez',
  unnamedAccount: 'Unnamed Account',
  youtubeThumbnailUrl: 'https://img.youtube.com/vi/{video-id}/{variant}.jpg',
  youtubeVideoUrl: 'https://www.youtube.com/embed/{video-id}',
  custodySuffix: '_custody',
  emptyImage: '/assets/images/empty_image.svg',
  ignoreCuratorIDs: ['aLgy7SxBMFj3mZcxPqU1xejkzWFKjaiWhB9wYbsFqXwNVH6WEQ'],
  danielleSeriesID: 'ccb212b8-76cd-4c54-824a-266f33fe057d',
  ipfsGateway: 'https://ipfs.io/ipfs/',
  registryBitmarkUrl: 'https://registry.bitmark.com/',
  feralFileSource: 'feralfile',
};

export enum YoutubeThumbnailVariants {
  highQuality = 'maxresdefault', // Higher quality - May or may not exist
  mediumQuality = 'mqdefault', // Lower quality - Guaranteed to exist
}

export enum ThumbnailVariants {
  thumbnailLarge = '/thumbnailLarge',
  thumbnailMedium = '/thumbnailMedium',
  thumbnailSmall = '/thumbnailSmall',
}

export const IframeFeatures = {
  Camera: 'camera',
  Microphone: 'microphone',
};

export const BeaconSetting = {
  SdkVersion: 'beacon:sdk_version',
  MatrixSelectedNode: 'beacon:matrix-selected-node',
  AppMetadataList: 'beacon:app-metadata-list',
  MatrixPeerRooms: 'beacon:matrix-peer-rooms',
  CommunicationPeersDapp: 'beacon:communication-peers-dapp',
  PostMessagenPeersDapp: 'beacon:postmessage-peers-dapp',
  SdkSecretSeed: 'beacon:sdk-secret-seed',
  SdkMatrixPreservedState: 'beacon:sdk-matrix-preserved-state',
  ActivePeer: 'beacon:active-peer',
  ActiveAccount: 'beacon:active-account',
  Accounts: 'beacon:accounts',
};

export const EditionSpecialName = ['AE', 'PP'];

export const TIME = {
  DAY_TO_MILLISECONDS: 24 * 3600 * 1000,
  MINUTE_TO_MILLISECONDS: 60 * 1000,
  MINUTE_TO_SECONDS: 60,
  MILLISECONDS: 1000,
};

export enum ServerMode {
  Debug = 'debug',
  Release = 'release',
}

export enum ImageLoadingType {
  Lazy = 'lazy',
  Eager = 'eager',
}

// TODO: Separate related constant values into another file (ErrorCodes, AppSetting, etc.)

export const MOMA_ACCOUNT_ID = '0x3F2496e9871744b8E865835639cbB7F1063DDFDE';
export const UNSUPERVISED_EXHIBITION_ID =
  'e3a2a207-ea91-461b-80db-18c7ffbfe8ce';

export const SoundPieceVSeriesIDs = [
  'faa810f7-7b75-4c02-bf8a-b7447a89c921', // PRD single token
  'a8cefd59-fd74-4ac1-9cdc-c91d1ef56e7e', // PRD series in set,
  '0ec945ca-4c0f-4b47-8ea9-9b8e9d963ee1', // STG single token
  '13df2a52-ed46-4177-929e-66ccd2222005', // STG series in set
];

export const YOKO_ONO_EDITION_ID = 'faa810f7-7b75-4c02-bf8a-b7447a89c921';
export const YOKO_ONO_ARTWORK_ID =
  '5429577522081131997036023001590580143450575936';
export const YOKO_ONO_PRIVATE_SERIES_ID =
  'a8cefd59-fd74-4ac1-9cdc-c91d1ef56e7e';
export const TRAVESS_MERGE_SERIES_ID = '0a954c31-d336-4e37-af0f-ec336c064879';

export const ExhibitionSaleText: Record<
  string,
  {
    SetSale: {
      title: string;
      description: string;
    };
    EditionSale: {
      title: string;
      description: string;
    };
  }
> = {
  'f3787e42-eaca-4005-aba1-ffa5b7c9c481': {
    SetSale: {
      title: 'SOUND MACHINES',
      description:
        '<p>This exhibition, organized by MoMA and Feral File, continues a legacy of related research, commissions, publications, and exhibitions at the intersection of sound and digital or computer-generated art at MoMA. The works are freely viewable online and are also available via online auction as sets minted on Ethereum: one work from each artist in 30 distinct versions, 30 unique sets available in total.</p><br><p>Proceeds go to the artists; to benefit sound art and collection care at The Museum of Modern Art; and to Feral File for production costs.</p>',
    },
    EditionSale: {
      title: 'SOUND MACHINES: Editions',
      description:
        '<p>Editions inspired by the works in the exhibition are available after the highest-bid auction closes in an edition size of 100 per work. Editions are sold individually at a fixed price.\n\nWe also invite you to contribute your recording to Yoko Ono’s community <i>SOUND PIECE V</i> (1996/2024), a public archive of laughter. This form of <i>SOUND PIECE V</i>  will be open for all to participate in perpetuity.</p>',
    },
  },
  '57f55b7c-52e3-4f38-8b42-d0a5fccdd55c': {
    SetSale: {
      title: 'SOUND MACHINES',
      description:
        '<p>This exhibition, organized by MoMA and Feral File, continues a legacy of related research, commissions, publications, and exhibitions at the intersection of sound and digital or computer-generated art at MoMA. The works are freely viewable online and are also available via online auction as sets minted on Ethereum: one work from each artist in 30 distinct versions, 30 unique sets available in total.</p>',
    },
    EditionSale: {
      title: 'SOUND MACHINES: Editions',
      description:
        '<p>Editions inspired by the works in the exhibition are available after the highest-bid auction closes in an edition size of 100 per work. Editions are sold individually at a fixed price.\n\nWe also invite you to contribute your recording to Yoko Ono’s community <i>SOUND PIECE V</i> (1996/2024), a public archive of laughter. This form of <i>SOUND PIECE V</i>  will be open for all to participate in perpetuity.</p>',
    },
  },
};

export const ONGOING_EXHIBITION_ID = '46a0f68b-a657-4364-92a0-32a88b65fbd9';
