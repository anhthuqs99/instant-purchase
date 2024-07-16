import { Injectable } from '@angular/core';
import { environment } from '@environment';
import {
  SignMessageParameters,
  SignMessageResponse,
  WalletName,
  Web3SignRequest,
} from '@core/models/web3.model';
import { WalletAppService } from './wallet-app.service';
import { IndexedDbService } from '../indexed-db.service';
import { Web3Modal, createWeb3Modal, defaultConfig } from '@web3modal/ethers';
import { BrowserProvider, JsonRpcProvider, Signer, formatUnits } from 'ethers';
// import * as Sentry from '@sentry/angular-ivy';
import { Subject } from 'rxjs';
import { Blockchain } from '@core/models';
import { Utils } from '@shared/utils';
import { ETHEREUM_MAINNET, ETHEREUM_SEPOLIA } from '@shared/ethereum-chains';
import { AppSetting } from '@shared/constants';

export enum ConnectionError {
  WrongAddress = 'The selected wallet account doesn’t match the one in FeralFile. Please double-check and use the correct address.',
  Disconnected = 'Disconnected',
  WrongNetwork = 'You are attempting to transfer over unsupported network',
}

const metadata = {
  name: 'Feral File',
  description: 'Feral File - Exhibiting, Curating, and Collecting Digital Art',
  url: 'https://feralfile.com',
  icons: ['https://feralfile.com/assets/FeralFile.png'],
};

@Injectable({
  providedIn: 'root',
})
export class WalletConnectService {
  public $connectedSuccess = new Subject<boolean>();

  private provider: BrowserProvider;
  private signer: Signer;
  private modal: Web3Modal;
  private jsonRpcProviderOnlyRead: JsonRpcProvider;
  private isFirstRetrievingTools = false;
  private providerUnsubscribe: () => void;
  private providerFirstRetrievingUnsubscribe: () => void;
  private providerSecondaryRetrievingUnsubscribe: () => void;

  constructor(
    private readonly walletAppService: WalletAppService,
    private readonly indexedDBService: IndexedDbService,
  ) {
    // Temporary solution: For a Dapp, we should have a switch network button.
    // Currently we don't have a switch network button, so we will ask the user to connect to the correct network.
    // TODO: Switch network button, on disconnect account.
  }

  public async connectWallet() {
    try {
      await this.resetBeforeLogin();
      this.initWeb3Modal();
      this.providerUnsubscribe = this.modal.subscribeProvider(async (event) => {
        if (event.isConnected) {
          this.providerUnsubscribe();
          await this.initProviderAndSigner();
          this.$connectedSuccess.next(true);
        }
      });

      await this.modal.open();
    } catch (error) {
      console.log('Connect wallet error:', error);
      // Sentry.captureMessage('Wallet connect service: Can not connect wallet');
    }
  }

  public async signMessage(message: string): Promise<string> {
    try {
      if (!this.signer) {
        await this.retrieveTools();
      }

      const signature = await this.signer.signMessage(message);
      return signature;
    } catch (error) {
      console.log('Sign message error:', error);
      // Sentry.captureMessage('Wallet connect service: Can not get signature');
      throw error;
    }
  }

  public async signRequest(
    request: Web3SignRequest,
    address: string,
    parameters?: SignMessageParameters,
  ): Promise<SignMessageResponse> {
    try {
      if (!this.signer) {
        await this.retrieveTools();
      }

      parameters.address = address;
      const message = await this.walletAppService.getWalletSignMessage(
        request,
        parameters,
      );
      const signature = await this.signer.signMessage(message);
      const signMessageResponse: SignMessageResponse = {
        message,
        signature,
        publicKey: address,
      };
      return signMessageResponse;
    } catch (error) {
      console.log('Sign request error:', error);
      throw error;
    }
  }

  public async sendTransaction(tx: {
    from: string;
    value: string;
    to: string;
    data;
  }): Promise<string> {
    try {
      const connectionError = await this.checkConnection(tx.from);
      if (connectionError) {
        throw new Error(connectionError);
      }

      if (!this.signer) {
        await this.retrieveTools();
      }

      const transaction = {
        account: tx.from,
        to: tx.to,
        value: tx.value,
        chainId: await this.getCurrentChain(),
        data: tx.data,
      };
      const response = await this.signer?.sendTransaction(transaction);
      return response?.hash || '';
    } catch (error) {
      console.log('Send transaction error:', error);
      // Sentry.captureMessage('Wallet connect service: Can not send transaction');
      throw error;
    }
  }

  public async getWCConnectedWalletName(type: Blockchain): Promise<WalletName> {
    try {
      if (type === Blockchain.Ethereum) {
        if (!this.modal) {
          await this.retrieveTools();
        }

        const walletName = this.modal?.getWalletInfo()?.name;
        return walletName
          ? (Utils.removeNonAsciiChars(walletName) as WalletName)
          : WalletName.Unknown;
      }

      return WalletName.Unknown;
    } catch (error) {
      console.log(error);
      return WalletName.Unknown;
    }
  }

  public async getCurrentChain(): Promise<number> {
    await this.retrieveTools();
    const network = await this.provider.getNetwork();
    return Number(network.chainId);
  }

  public async getAddress(): Promise<string> {
    try {
      await this.retrieveTools();

      return await this.signer?.getAddress();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public async getBalance(address: string): Promise<number> {
    // Usage by FFConnect and WalletConnect
    try {
      this.initJsonRpcProviderOnlyRead();
      const balance = await this.jsonRpcProviderOnlyRead.getBalance(address);
      return Number(formatUnits(balance || 0, 18));
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public async resolvesENStoAddress(domainName: string): Promise<string> {
    try {
      this.initJsonRpcProviderOnlyRead();
      return (
        (await this.jsonRpcProviderOnlyRead?.resolveName(domainName)) ||
        domainName
      );
    } catch (error) {
      console.log(error);
      return domainName;
    }
  }

  public async getDomainName(address: string): Promise<string> {
    try {
      this.initJsonRpcProviderOnlyRead();
      return (
        (await this.jsonRpcProviderOnlyRead?.lookupAddress(address)) || address
      );
    } catch (error) {
      console.log(error);
      return address;
    }
  }

  public async isValidProviderAndSigner(): Promise<boolean> {
    if (!this.provider || !this.signer) {
      await this.retrieveTools();
    }

    return Boolean(this.provider) && Boolean(this.signer);
  }

  public async checkConnection(loggedInAddress: string) {
    try {
      if (!(await this.isValidProviderAndSigner())) {
        return ConnectionError.Disconnected;
      }

      if ((await this.getAddress()) !== loggedInAddress) {
        return ConnectionError.WrongAddress;
      }

      if (await this.isDifferentNetwork()) {
        return ConnectionError.WrongNetwork;
      }

      return null;
    } catch (error) {
      return JSON.stringify(error);
    }
  }

  public async isDifferentNetwork(): Promise<boolean> {
    const dappChainID = Number.parseInt(environment.walletChainID, 10);
    const connectingChainID = await this.getCurrentChain();
    return dappChainID !== connectingChainID;
  }

  public async switchToCurrentNetwork() {
    return this.modal.switchNetwork(
      Number.parseInt(environment.walletChainID, 10),
    );
  }

  public async disconnect() {
    try {
      if (!this.modal) {
        await this.retrieveTools();
      }

      await this.modal.disconnect();
      await this.indexedDBService.clearTable();
      this.clearLocalStorage();
    } catch (error) {
      console.log(error);
    }
  }

  private async initProviderAndSigner() {
    try {
      const walletProvider = this.modal.getWalletProvider();
      if (!walletProvider) {
        throw new Error('Wallet provider is undefined');
      }

      this.provider = new BrowserProvider(walletProvider);
      this.signer = await this.provider?.getSigner();
    } catch (error) {
      console.error('Init provider and signer error:', error);
      throw error;
    }
  }

  private initWeb3Modal() {
    try {
      const chainID = Number.parseInt(environment.walletChainID, 10);
      let currentChain = ETHEREUM_MAINNET;
      switch (chainID) {
        case ETHEREUM_SEPOLIA.chainId: {
          currentChain = ETHEREUM_SEPOLIA;
          break;
        }

        default: {
          currentChain = ETHEREUM_MAINNET;
        }
      }

      const ethersConfig = defaultConfig({
        /*  Required  */
        metadata,
        /*  Optional  */
        defaultChainId: chainID,
      });
      this.modal = createWeb3Modal({
        ethersConfig,
        chains: [currentChain],
        projectId: environment.walletConnectV2ProjectID,
        defaultChain: currentChain,
        allowUnsupportedChain: true,
        enableAnalytics: false,
        featuredWalletIds: [
          // Feral File
          'f593f4eb9755ff047681a37ebc46706e0e915cf1c2fe0102f5ae47c9f6aa4082',
          // MetaMask
          'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
          // Coinbase
          'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa',
          // Wallet Connect
          'e7c4d26541a7fd84dbdfa9922d3ad21e936e13a7a0e44385d44f006139e44d3b',
          // Safe
          '225affb176778569276e484e1b92637ad061b01e13a048b35a9d280c3b58970f',
        ],
      });
    } catch (error) {
      console.log('Init web3 modal error:', error);
      // Sentry.captureMessage('Wallet connect service: Can not init web3 modal');
    }
  }

  private async retrieveTools() {
    try {
      if (this.isFirstRetrievingTools) {
        await new Promise<void>((resolve) => {
          this.providerFirstRetrievingUnsubscribe =
            this.modal.subscribeProvider(async (event) => {
              if (event.isConnected) {
                this.providerFirstRetrievingUnsubscribe();
                resolve();
              }
            });
        });
      } else if (this.modal) {
        await this.initProviderAndSigner();
      } else {
        this.isFirstRetrievingTools = true;
        this.initWeb3Modal();
        await new Promise<void>((resolve) => {
          this.providerSecondaryRetrievingUnsubscribe =
            this.modal.subscribeProvider(async (event) => {
              if (event.isConnected) {
                this.providerSecondaryRetrievingUnsubscribe();
                await this.initProviderAndSigner();
                this.isFirstRetrievingTools = false;
                resolve();
              }
            });
        });
      }
    } catch (error) {
      console.log('Retrieve tools error:', error);
      // Sentry.captureMessage('Wallet connect service: Can not retrieve tools');
    }
  }

  private initJsonRpcProviderOnlyRead() {
    if (!this.jsonRpcProviderOnlyRead) {
      this.jsonRpcProviderOnlyRead = new JsonRpcProvider(
        AppSetting.ethPRCEndpoint[
          Number.parseInt(environment.walletChainID, 10)
        ],
      );
    }
  }

  private async resetBeforeLogin() {
    if (this.modal) {
      await this.disconnect();
    }

    this.provider = null;
    this.signer = null;
    this.isFirstRetrievingTools = false;

    if (this.providerUnsubscribe) {
      this.providerUnsubscribe();
    }

    if (this.providerFirstRetrievingUnsubscribe) {
      this.providerFirstRetrievingUnsubscribe();
    }

    if (this.providerSecondaryRetrievingUnsubscribe) {
      this.providerSecondaryRetrievingUnsubscribe();
    }
  }

  private clearLocalStorage() {
    for (const key of Object.keys(localStorage).filter((key) =>
      key.startsWith('@w3m/'),
    )) {
      localStorage.removeItem(key);
    }
  }
}
