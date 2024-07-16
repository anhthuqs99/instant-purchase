export const environment = {
  api_prefix: 'https://feralfilestg.dev.bitmark.com/api/',

  stripe_pk:
    'pk_test_519j0AQEVkg5BfxVlYy7cAJ6jUyRZ8RYsJIbFSfwOS1yb7ndvoVHnkKqie2w1XXfrDHPIizh1QD9l5jB7DPcLSPlG008WJRUnAE',
  artwork_preserved_hour: '24',
  launchThresholdSeconds: '300',
  orderCodeLength: '8',

  emailRegex: '^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$',
  aliasRegex: '^[A-Za-z0-9][A-Za-z0-9s._&-]*[A-Za-z0-9][._&-]?$',
  aliasMinLength: '3',
  aliasMaxLength: '70',

  // ----- Tezos ----------------
  tezosExplorerURL: 'https://limanet.tzkt.io',
  xtzDepositLimitation: '20000',
  tezosDomainNameContract: 'KT1GBZmSxmnKJXGMdMLbugPfLyUPmuLSMwKS',
  tezosToolkit: 'https://mainnet.api.tez.ie',
  tzktAPIPrefix: 'https://api.ghostnet.tzkt.io/v1',

  // Coin base
  coinBaseURL: 'https://api.coinbase.com/v2',

  // Wallet Connect 2.0
  walletConnectV2ProjectID: 'e890d30a31ed144496a9251b7675a214',
  walletChainID: '11155111',
  autonomyChainID: 'autonomy:1',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
