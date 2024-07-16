import { Injectable } from '@angular/core';
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { WalletAppService } from './wallet-app.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environment';
import { BeaconSetting, ServerMode } from '@shared/constants';
import {
  SignMessageParameters,
  SignMessageResponse,
  Web3SignRequest,
} from '@core/models';
import { packData } from '@taquito/michel-codec';
import { SigningType } from '@airgap/beacon-sdk';
import { buf2hex, bytes2Char, char2Bytes } from '@taquito/utils';
import { firstValueFrom } from 'rxjs';

enum NetworkType {
  MAINNET = 'mainnet',
  DELPHINET = 'delphinet',
  EDONET = 'edonet',
  FLORENCENET = 'florencenet',
  GRANADANET = 'granadanet',
  HANGZHOUNET = 'hangzhounet',
  ITHACANET = 'ithacanet',
  JAKARTANET = 'jakartanet',
  CUSTOM = 'custom',
  GHOSTNET = 'ghostnet',
}
NetworkType['LIMANET'] = 'limanet';

const RPC_URL_Mainnet = [
  'https://mainnet.api.tez.ie',
  'https://rpc.tzbeta.net/',
  'https://mainnet-tezos.giganode.io',
  'https://mainnet.tezos.marigold.dev/',
];

const RPC_URL_Testnet = 'https://ghostnet.ecadinfra.com';
@Injectable({
  providedIn: 'root',
})
export class TezosWalletService {
  protected Tezos: TezosToolkit;
  protected tzWallet: BeaconWallet;
  protected contractAbstraction;

  private constructor(
    private walletAppService: WalletAppService,
    private httpClient: HttpClient,
  ) {}

  public async setupTezosDApp(wallet?: BeaconWallet): Promise<BeaconWallet> {
    try {
      if (wallet) {
        this.tzWallet = wallet;
      } else {
        this.tzWallet = new BeaconWallet({
          name: 'Feral File',
          iconUrl: 'https://feralfile.com/assets/FeralFile.png',
        });
      }
      console.log(this.tzWallet);

      await this.tzWallet.requestPermissions({
        network: {
          type:
            environment.serverMode === ServerMode.Debug
              ? NetworkType['GHOSTNET']
              : NetworkType.MAINNET,
        },
      });

      const randomIndex = Math.floor(Math.random() * RPC_URL_Mainnet.length);
      const tezosRPCNode =
        environment.serverMode === ServerMode.Release
          ? RPC_URL_Mainnet[randomIndex]
          : RPC_URL_Testnet;
      this.Tezos = new TezosToolkit(tezosRPCNode); // init for next actions
      this.Tezos.setWalletProvider(this.tzWallet);

      return this.tzWallet;
    } catch (error) {
      console.log('Got error:', error);
      this.disconnectWallet();
      return null;
    }
  }

  public async disconnectWallet() {
    try {
      if (this.tzWallet) {
        await this.tzWallet.clearActiveAccount();
        this.clearBeaconData();
      } else {
        this.clearBeaconData();
      }
    } catch (error) {
      console.log('Got error:', error);
    }
  }

  public async getBalance(address: string): Promise<number> {
    try {
      if (!this.Tezos) {
        const randomIndex = Math.floor(Math.random() * RPC_URL_Mainnet.length);
        const tezosRPCNode =
          environment.serverMode === ServerMode.Release
            ? RPC_URL_Mainnet[randomIndex]
            : RPC_URL_Testnet;
        this.Tezos = new TezosToolkit(tezosRPCNode); // init for next actions
      }
      const balance = await this.Tezos.tz.getBalance(address);
      return balance.toNumber() / 1000000;
    } catch (error) {
      this.resetPRCNode();
      this.getBalance(address);
      return null;
    }
  }

  private async sendTransaction(to: string, amount: number) {
    try {
      await this.connect();
      const round = Math.pow(10, 6);
      amount = Math.ceil(amount * round) / round;
      return await this.Tezos.wallet
        .transfer({ to: to, amount: amount })
        .send();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public async signRequest(
    request: Web3SignRequest,
    params?: SignMessageParameters,
  ): Promise<SignMessageResponse> {
    try {
      await this.connect();
      params.address = await this.tzWallet.getPKH();
      const signMessage = await this.walletAppService.getWalletSignMessage(
        request,
        params,
      );
      const payloadBytes = packData({ string: signMessage });
      const signPayloadResponse = await this.tzWallet.client.requestSignPayload(
        {
          signingType: SigningType.MICHELINE,
          payload: buf2hex(Buffer.from(payloadBytes)),
        },
      );
      const activeAccount = await this.tzWallet.client.getActiveAccount();
      const signMessageResponse: SignMessageResponse = {
        message: signMessage,
        signature: signPayloadResponse.signature,
        publicKey: activeAccount.publicKey,
      };
      return signMessageResponse;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  private async connect() {
    try {
      if (!this.Tezos) {
        const randomIndex = Math.floor(Math.random() * RPC_URL_Mainnet.length);
        const tezosRPCNode =
          environment.serverMode === ServerMode.Release
            ? RPC_URL_Mainnet[randomIndex]
            : RPC_URL_Testnet;
        this.Tezos = new TezosToolkit(tezosRPCNode); // init for next actions
      }
      if (!this.tzWallet) {
        const options = {
          name: 'Feral File',
          iconUrl: 'https://feralfile.com/assets/FeralFile.png',
        };
        this.tzWallet = new BeaconWallet(options);

        // request requestPermissions if loss connect
        const activeAccount = await this.tzWallet.client.getActiveAccount();
        if (!activeAccount) {
          await this.tzWallet.requestPermissions({
            network: {
              type:
                environment.serverMode === ServerMode.Debug
                  ? NetworkType['GHOSTNET']
                  : NetworkType.MAINNET,
            },
          });
        }
        this.Tezos.setWalletProvider(this.tzWallet);
      }
    } catch (error) {
      this.retryAnotherRPC();
      throw error;
    }
  }

  private async initContractAbstract() {
    if (!this.contractAbstraction) {
      const Tezos = new TezosToolkit(environment.tezosToolkit);
      this.contractAbstraction = await Tezos.wallet.at(
        environment.tezosDomainNameContract,
      );
    }
  }

  public async getDomainName(address: string): Promise<string> {
    try {
      await this.initContractAbstract();
      const storage = await this.contractAbstraction.storage();
      const domain = await storage.store.reverse_records.get(address);
      if (domain && domain.name && domain.name.Some) {
        return bytes2Char(domain.name.Some);
      } else {
        return null;
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public async resolvesTNStoAddress(domainName: string): Promise<string> {
    try {
      await this.initContractAbstract();
      const storage = await this.contractAbstraction.storage();
      const domain = await storage.store.records.get(char2Bytes(domainName));
      // If domainName applied as a TZ Address, this line will throw a undefine.
      return domain?.owner ?? domainName;
    } catch (error) {
      // throw error;
      return domainName;
    }
  }

  public getTokenDetail(tokenId: string, contractAddress: string) {
    try {
      return firstValueFrom(
        this.httpClient.get(
          `${environment.tzktAPIPrefix}/tokens?tokenId=${tokenId}&contract=${contractAddress}`,
        ),
      );
    } catch (error) {
      return null;
    }
  }

  public getCurrentHolders(id: string) {
    try {
      return firstValueFrom(
        this.httpClient.get(
          `${environment.tzktAPIPrefix}/tokens/balances?select.values=account%2Cbalance%2Cid%2ClastTime%2Ctoken&token.id=${id}&balance.gt=0&sort.desc=balance&limit=40&offset=0`,
        ),
      );
    } catch (error) {
      return null;
    }
  }

  private retryAnotherRPC() {
    this.resetPRCNode();
    if (this.tzWallet) {
      this.Tezos.setWalletProvider(this.tzWallet);
    } else {
      this.connect();
    }
  }

  private clearBeaconData() {
    localStorage.removeItem(BeaconSetting.Accounts);
    localStorage.removeItem(BeaconSetting.SdkVersion);
    localStorage.removeItem(BeaconSetting.MatrixSelectedNode);
    localStorage.removeItem(BeaconSetting.CommunicationPeersDapp);
    localStorage.removeItem(BeaconSetting.SdkSecretSeed);
    localStorage.removeItem(BeaconSetting.SdkMatrixPreservedState);
    localStorage.removeItem(BeaconSetting.ActivePeer);
    localStorage.removeItem(BeaconSetting.ActiveAccount);
    localStorage.removeItem(BeaconSetting.PostMessagenPeersDapp);
    localStorage.removeItem(BeaconSetting.AppMetadataList);
  }

  private resetPRCNode() {
    const randomIndex = Math.floor(Math.random() * RPC_URL_Mainnet.length);
    const tezosRPCNode =
      environment.serverMode === ServerMode.Release
        ? RPC_URL_Mainnet[randomIndex]
        : RPC_URL_Testnet;
    this.Tezos = new TezosToolkit(tezosRPCNode);
  }
}
