import { environment } from '@environment';
import moment from 'moment';
import { AppSetting, ServerMode, ThumbnailVariants } from './constants';
import {
  ArtworkDetail,
  Blockchain,
  Exhibition,
  ReverseDutchAuctionPrice,
  ReverseDutchAuctionSetting,
  SeriesDetail,
} from '@core/models';
import Web3 from 'web3';
import { NetworkType } from '@airgap/beacon-types';
import { ETHEREUM_MAINNET, ETHEREUM_SEPOLIA } from './ethereum-chains';

const TOKEN_ID_V2_1_LENGTH = 32; // 32 bytes

export class Utils {
  public static async delay(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  public static bnToHex(
    bn: string | number | bigint,
    hasPrefix = true,
    length = 64,
  ) {
    const base = 16;

    let hex: string;
    try {
      hex = BigInt(bn).toString(base);
    } catch (error) {
      return bn.toString();
    }

    if (hasPrefix) {
      hex = hex.padStart(length, '0');
    }
    return hex;
  }

  public static formatDateTime(duration: moment.Duration) {
    const days = parseInt(duration.asDays().toString());
    const dateString = days > 9 ? days : '0' + days;
    const hourString = ('0' + duration.hours()).slice(-2);
    const minString = ('0' + duration.minutes()).slice(-2);
    const secondString = ('0' + duration.seconds()).slice(-2);
    return (
      (days > 0 ? dateString + 'd ' : '') +
      (hourString || '00') +
      'h ' +
      (minString || '00') +
      'm' +
      (days > 0 ? '' : ' ' + secondString + 's')
    );
  }

  // TokenIDv21
  public static calculateTokenID(
    seriesOnchainID: string,
    exhibitionID: string,
    artworkIndex: number,
  ): string {
    // eslint-disable-next-line prefer-const
    let [part1, part2] = this.tokenIDv2Shards(
      seriesOnchainID,
      exhibitionID,
      artworkIndex,
    );
    const part2Len = TOKEN_ID_V2_1_LENGTH * 2 - part1.length;
    if (part2.length < part2Len) {
      part2 = part2.padStart(part2Len, '0');
    }
    const tokenIDHex = part1 + part2;
    if (tokenIDHex.length != TOKEN_ID_V2_1_LENGTH * 2) {
      throw Error('Invalid token ID length');
    }

    return this.hexToDec(tokenIDHex);
  }

  public static calculateTokenIndex(
    seriesOnchainID: string,
    exhibitionID: string,
    tokenID: string,
  ) {
    const tokenIDHex = this.decToHex(tokenID);
    const part1 = exhibitionID.replaceAll(/-/g, '');
    const part2 = tokenIDHex.slice(part1.length);

    const si = BigInt(seriesOnchainID);
    const msi = BigInt(Number.parseInt(part2, 16));
    const artworkIndex = Number(msi - si * BigInt(1000000));

    return artworkIndex;
  }

  public static async previewArtCustomTokenID(
    seriesOnchainID: string,
    exhibitionID: string,
    artworkIndex: number,
  ): Promise<string> {
    const si = BigInt(seriesOnchainID);
    const msi = si * BigInt(1000000) + BigInt(artworkIndex);
    const part1 = exhibitionID.replace(/-/g, '');
    const part2 = msi.toString(16);
    const p = part1 + part2;
    const tokenID = BigInt('0x' + p).toString();
    const tokenIDHash = await this.digestHex2Hash(p);
    return `&token_id=${tokenID.toString()}&token_id_hash=0x${tokenIDHash}`;
  }

  public static async digestHex2Hash(hexString: string) {
    hexString = hexString.replace(/^0x/, ''); // remove the leading 0x

    const pairs = hexString.match(/[\dA-F]{2}/gi); // split the string into pairs of octets

    // convert the octets to integers
    const integers = pairs && pairs.map((s) => parseInt(s, 16));
    const array = new Uint8Array(integers || []);

    const hashBuffer = await crypto.subtle.digest('SHA-256', array.buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(''); // convert bytes to hex string
    return hashHex;
  }

  public static async hashOrderChecksum(text: string): Promise<string> {
    const data = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const max = Math.floor(
      hashHex.length - parseFloat(environment.orderCodeLength),
    );
    const index = Math.floor(Math.random() * (max + 1));
    return hashHex.substring(
      index,
      index + parseFloat(environment.orderCodeLength),
    );
  }

  public static transformImageSrc(src: string): string {
    if (src.startsWith('https')) {
      if (src.includes(AppSetting.cloudFlareHostingDomain)) {
        const variantSuffix = '/thumbnail';
        return src.includes(variantSuffix)
          ? src
          : src + ThumbnailVariants.thumbnailLarge;
      } else {
        return src;
      }
    } else if (src.startsWith('ipfs://')) {
      return src.replace('ipfs://', AppSetting.ipfsGateway);
    } else if (src.includes('/assets/images/empty_image.svg')) {
      return src;
    }

    return environment.cloudFrontEndpoint + src;
  }

  public static calculateCurrentPriceAndNextDropPrice(
    reverseDutchAuctionSetting: ReverseDutchAuctionSetting,
  ): ReverseDutchAuctionPrice {
    const totalExponentialDropCount = Math.floor(
      moment(reverseDutchAuctionSetting.endedAt).diff(
        moment(reverseDutchAuctionSetting.startedAt),
        'seconds',
      ) / reverseDutchAuctionSetting.exponentialPriceDropDurationSecond,
    );
    const exponentialDropCount = Math.floor(
      moment().diff(moment(reverseDutchAuctionSetting.startedAt), 'seconds') /
        reverseDutchAuctionSetting.exponentialPriceDropDurationSecond,
    );
    if (exponentialDropCount >= 0) {
      const currentExponentialPrice =
        exponentialDropCount >= totalExponentialDropCount
          ? reverseDutchAuctionSetting.endPrice
          : reverseDutchAuctionSetting.startPrice /
            Math.pow(
              reverseDutchAuctionSetting.priceDropDecayRate,
              exponentialDropCount,
            );
      const nextExponentialPrice =
        exponentialDropCount + 1 >= totalExponentialDropCount
          ? reverseDutchAuctionSetting.endPrice
          : reverseDutchAuctionSetting.startPrice /
            Math.pow(
              reverseDutchAuctionSetting.priceDropDecayRate,
              exponentialDropCount + 1,
            );
      let currentPrice = currentExponentialPrice;
      let nextPrice = nextExponentialPrice;

      const extraSecondLinearDrop =
        moment().diff(moment(reverseDutchAuctionSetting.startedAt), 'seconds') %
        reverseDutchAuctionSetting.exponentialPriceDropDurationSecond;
      const gapLinearDropCount = Math.ceil(
        reverseDutchAuctionSetting.exponentialPriceDropDurationSecond /
          reverseDutchAuctionSetting.linearPriceDropDurationSecond,
      );

      if (
        reverseDutchAuctionSetting.linearPriceDropDurationSecond > 0 &&
        currentExponentialPrice > reverseDutchAuctionSetting.endPrice &&
        gapLinearDropCount > 0
      ) {
        const perLinearDropAmount =
          (currentExponentialPrice - nextExponentialPrice) / gapLinearDropCount;
        const linearDropCount = Math.floor(
          extraSecondLinearDrop /
            reverseDutchAuctionSetting.linearPriceDropDurationSecond,
        );
        currentPrice -= perLinearDropAmount * linearDropCount;

        if (currentPrice >= perLinearDropAmount) {
          nextPrice = currentPrice - perLinearDropAmount;
        }
      }

      const dropDurationSecond =
        reverseDutchAuctionSetting.linearPriceDropDurationSecond > 0
          ? reverseDutchAuctionSetting.linearPriceDropDurationSecond
          : reverseDutchAuctionSetting.exponentialPriceDropDurationSecond;
      const dropCount =
        moment().diff(moment(reverseDutchAuctionSetting.startedAt), 'seconds') %
        dropDurationSecond;
      const dropAt =
        currentPrice !== nextPrice &&
        moment()
          .add(dropDurationSecond - dropCount, 'seconds')
          .format();

      return { currentPrice, nextPrice, dropAt };
    }
    return {
      currentPrice: reverseDutchAuctionSetting.startPrice,
      nextPrice: reverseDutchAuctionSetting.startPrice,
      dropAt: null,
    };
  }

  public static windowBack() {
    if (window.history.length > 1) {
      history.back();
    } else {
      window.location.href = '/';
    }
  }

  public static getMarketplacePrefixURL(blockchain: Blockchain): string {
    switch (blockchain) {
      case Blockchain.Ethereum: {
        return (
          'https://' +
          (environment.serverMode === ServerMode.Release.toString()
            ? ''
            : 'testnets.') +
          'opensea.io/assets/' +
          (environment.serverMode === ServerMode.Release.toString()
            ? ETHEREUM_MAINNET.name
            : ETHEREUM_SEPOLIA.name
          ).toLowerCase()
        );
      }

      case Blockchain.Tezos: {
        return (
          'https://' +
          (environment.serverMode === ServerMode.Release.toString()
            ? ''
            : NetworkType.GHOSTNET + '.') +
          'objkt.com/asset'
        );
      }

      default: {
        return '';
      }
    }
  }

  public static getSecondaryLink(
    artwork: ArtworkDetail,
    series: SeriesDetail,
    exhibition: Exhibition,
  ): [string, string] {
    if (artwork && !artwork.series) {
      artwork.series = series;
    }

    if (
      !artwork ||
      !exhibition ||
      artwork?.virgin ||
      (exhibition?.mintBlockchain === Blockchain.Bitmark &&
        !artwork.series?.onchainID)
    ) {
      return [null, null];
    }

    const openseaLinkPrefix = 'https://opensea.io/assets/ethereum/';
    const objktLinkPrefix = 'https://objkt.com/asset/';
    let secondaryMarketLink: string;
    let secondaryMarketName: string;
    let convertedArtworkID = artwork.id;
    if (exhibition?.mintBlockchain === Blockchain.Bitmark) {
      convertedArtworkID = (
        BigInt('0x' + artwork.series.onchainID) + BigInt(artwork.index)
      ).toString(10);
    }

    const blockchains = new Set([
      exhibition?.mintBlockchain,
      artwork?.swap?.blockchainType,
    ]);
    if (blockchains.has(Blockchain.Tezos)) {
      const tezosContract = exhibition?.contracts?.filter(
        (contract) => contract.blockchainType === Blockchain.Tezos,
      )[0];
      if (tezosContract) {
        secondaryMarketLink =
          objktLinkPrefix + tezosContract.address + '/' + convertedArtworkID;
        secondaryMarketName = 'Objkt';
      }
    } else if (blockchains.has(Blockchain.Ethereum)) {
      const ethereumContract = exhibition?.contracts?.filter(
        (contract) => contract.blockchainType === Blockchain.Ethereum,
      )[0];
      if (ethereumContract) {
        secondaryMarketName = 'OpenSea';
        secondaryMarketLink =
          openseaLinkPrefix +
          ethereumContract.address +
          '/' +
          convertedArtworkID;
      }
    } else {
      secondaryMarketLink = null;
      secondaryMarketName = null;
    }

    return [secondaryMarketName, secondaryMarketLink];
  }

  public static roundUp(num: number, precision: number) {
    precision = Math.pow(10, precision);
    return Math.ceil(num * precision) / precision;
  }

  public static convertContractTime(timestamp: string | number): string {
    return timestamp
      ? new Date((timestamp as number) * 1000).toISOString()
      : timestamp?.toString();
  }

  public static convertWeb3Amount(amount: string): number {
    return parseFloat(Web3.utils.fromWei(amount, 'gwei'));
  }

  public static openUrlInNewTab(url: string) {
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      document.body.append(link);
      link.click();
      link.remove();
    }
  }

  public static removeArtistCuratorAliasSuffixes(value: string): string {
    return value
      .replace(new RegExp(`${AppSetting.a2pSuffix}$`), '')
      .replace(new RegExp(`${AppSetting.custodySuffix}$`), '')
      .replace(new RegExp(`${AppSetting.tezosSuffix}$`), '');
  }

  /**
   * @returns {string} - The query string: ...&...&... | ''
   */
  public static getQueryString(
    parameters: Record<string, string | number | boolean | undefined>,
  ): string {
    const results: string[] = [];
    for (const key of Object.keys(parameters)) {
      const element = parameters[key];
      if (element !== undefined && element !== '' && element !== null) {
        results.push(`${key}=${element}`);
      }
    }

    return results.join('&');
  }

  public static isValidUUID(uuid: string): boolean {
    const regexExp = /^[\da-f]{8}(?:\b-[\da-f]{4}){3}\b-[\da-f]{12}$/gi;
    return regexExp.test(uuid);
  }

  public static modifyURLParameter(
    url: string,
    key: string,
    value: string,
  ): string {
    let result = url;
    try {
      const urlComponent = new URL(url);
      const urlParameters = new URLSearchParams(urlComponent.search);
      urlParameters.set(key, value);
      result = `${urlComponent.origin}${
        urlComponent.pathname
      }?${urlParameters.toString()}`;
    } catch {
      console.log('Failed to parse url', url);
    }

    return result;
  }

  public static validateTabHandler(
    tabRecord: Record<string, number>,
  ): Record<string, number> {
    let counter = 0;
    for (const key in tabRecord) {
      if (tabRecord[key] !== AppSetting.hiddenTabCode) {
        tabRecord[key] = counter++;
      }
    }

    return tabRecord;
  }

  public static getNonNegativeNumber(value: number): number {
    return value >= 0 ? value : 0;
  }

  public static removeNonAsciiChars(_string: string): string {
    // Matches any character that is not in the ASCII range (0-127)
    // eslint-disable-next-line no-control-regex
    const nonAsciiRegex = /[^\u0000-\u007F]/g;
    return _string.replaceAll(nonAsciiRegex, '');
  }

  public static async canDownloadFile(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Range: 'bytes=0-1',
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Error checking file URL:', error);
      return false;
    }
  }

  // TokenIDv2Shards computes token ID for v2.0 with shards
  private static tokenIDv2Shards(
    seriesOnchainID: string,
    exhibitionID: string,
    artworkIndex: number,
  ): [string, string] {
    // Convert seriesOnchainID to a BigInt
    const si = BigInt(seriesOnchainID);

    // Multiply seriesOnchainID by 1000000
    let msi = si * BigInt(1000000);

    // Add artworkIndex to the result
    msi += BigInt(artworkIndex);

    // Remove dashes from exhibitionID
    const part1 = exhibitionID.replace(/-/g, '');

    // Get artwork index in hex
    const part2 = msi.toString(16);

    return [part1, part2];
  }

  private static hexToDec(hex: string) {
    if (!hex.startsWith('0x')) {
      hex = `0x${hex}`;
    }

    // Convert the hex string to a BigInt
    const n = BigInt(hex);

    // Convert the BigInt to a decimal string
    return n.toString(10);
  }

  private static decToHex(dec: string) {
    // Convert the decimal string to a BigInt
    const n = BigInt(dec);

    // Convert the BigInt to a hex string
    return n.toString(16);
  }
}
