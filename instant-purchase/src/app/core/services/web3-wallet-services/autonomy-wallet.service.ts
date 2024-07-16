import { Blockchain } from '@core/models/exhibition.model';
import { Injectable } from '@angular/core';
import Client, { SignClient } from '@walletconnect/sign-client';
import { environment } from '@environment';
import {
  SignMessageParameters,
  SignMessageResponse,
  Web3SignRequest,
} from '@core/models/web3.model';
import { WalletAppService } from './wallet-app.service';
import { AuMethod, Chain } from '@core/models/wallet-connect-autonomy.model';
import { parseEther } from 'viem';
import { IndexedDbService } from '../indexed-db.service';

@Injectable({
  providedIn: 'root',
})
export class AutonomyWalletService {
  public signClient: Client;

  constructor(
    private readonly walletAppService: WalletAppService,
    private readonly indexedDBService: IndexedDbService
  ) {}

  public async initSignClient() {
    if (this.signClient) {
      return;
    }
    this.signClient = await SignClient.init({
      projectId: environment.walletConnectV2ProjectID,
      metadata: {
        name: 'Feral File',
        description:
          'Feral File - Exhibiting, Curating, and Collecting Digital Media',
        url: '#',
        icons: ['https://feralfile.com/assets/FeralFile.png'],
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.signClient.on('session_event', () => {
      // Handle session events, such as "chainChanged", "accountsChanged", etc.
    });

    this.signClient.on('session_update', () => {
      // const { namespaces } = params;
      // const _session = this.signClient.session.get(topic);
      // // Overwrite the `namespaces` of the existing session with the incoming one.
      // const updatedSession = { ..._session, namespaces };
      // // Integrate the updated session state into your dapp state.
    });

    this.signClient.on('session_delete', () => {
      // Session was deleted -> reset the dapp state, clean up from user session, etc.
    });
  }

  public connectWallet(permissions: string[]) {
    return this.signClient.connect({
      // Optionally: pass a known prior pairing (e.g. from `client.pairing.values`) to skip the `uri` step.
      pairingTopic: this.signClient.pairing?.values[0]?.topic,
      // Provide the namespaces and chains (e.g. `eip155` for EVM-based chains) we want to use in this session.
      requiredNamespaces: {
        autonomy: {
          methods: permissions,
          chains: [environment.autonomyChainID],
          events: [],
        },
      },
    });
  }

  public requestPermission(
    session,
    account: string,
    message: string,
    chains: string[],
    includeLinkedAccount = false
  ) {
    try {
      return this.signClient.request({
        topic: session.topic,
        chainId: environment.autonomyChainID,
        request: {
          method: AuMethod.permissions,
          params: {
            account: account,
            message: message,
            permissions: [
              {
                type: 'chains_request',
                includeLinkedAccount: includeLinkedAccount,
                request: {
                  chains: chains,
                },
              },
            ],
          },
        },
      });
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  public async sign(
    chain: Blockchain,
    address: string,
    message: string
  ): Promise<string> {
    try {
      await this.initSignClient();
      let topic: string;
      if (this.signClient?.session?.values?.length) {
        topic = this.signClient.session.values[0].topic;
      }

      if (topic === undefined) {
        throw new Error('topic is undefined');
      }

      return await this.signClient.request<string>({
        topic,
        chainId: environment.autonomyChainID,
        request: {
          method: AuMethod.sign,
          params: {
            chain: Chain[chain],
            address: address,
            message: message,
          },
        },
      });
    } catch (e: unknown) {
      console.log(e);
      const error = new Error('Failed to sign message');
      throw error;
    }
  }

  public async signRequest(
    request: Web3SignRequest,
    address: string,
    chain: Blockchain,
    params?: SignMessageParameters
  ): Promise<SignMessageResponse> {
    try {
      params.address = address;
      const signMessage = await this.walletAppService.getWalletSignMessage(
        request,
        params
      );
      const signature = await this.sign(chain, address, signMessage);
      const signMessageResponse: SignMessageResponse = {
        message: signMessage,
        signature: signature,
        publicKey: address,
      };
      return signMessageResponse;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public async sendTransaction(
    chain: Blockchain,
    from: string,
    to: string,
    amount: number
  ) {
    const round = Math.pow(10, 6);
    amount = Math.ceil(amount * round);
    const transaction =
      chain === Blockchain.Ethereum
        ? [
            {
              kind: 'transaction',
              source: from,
              destination: to,
              amount: amount,
            },
          ]
        : [
            {
              to: to,
              from: from,
              value: parseEther(`${amount}`),
              data: '',
            },
          ];
    try {
      const transactionHash = await this.requestSendTransaction(
        chain,
        from,
        transaction
      );
      return transactionHash;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public async requestSendTransaction(
    chain: Blockchain,
    address: string,
    transactions: object
  ) {
    try {
      await this.initSignClient();
      let topic: string;
      if (this.signClient?.session?.values?.length) {
        topic = this.signClient.session.values[0].topic;
      }

      if (topic === undefined) {
        throw new Error('topic is undefined');
      }

      return this.signClient.request({
        topic,
        chainId: environment.autonomyChainID,
        request: {
          method: AuMethod.sendTransaction,
          params: {
            chain: Chain[chain],
            address: address,
            transactions: transactions,
          },
        },
      });
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  public async disconnect() {
    try {
      await this.initSignClient();
      const sessions = this.signClient.session.values;
      const activeSessions = sessions.filter(
        session => Math.floor(Date.now() / 1000) < session.expiry
      );
      const promises = activeSessions.map(async session =>
        this.signClient
          .disconnect({
            topic: session.topic,
            reason: {
              code: 4000,
              message: 'User closed session',
            },
          })
          .catch(error => {
            console.error(
              `Failed to disconnect session ${session.topic}:`,
              error
            );
          })
      );
      await Promise.all(promises);
      await this.indexedDBService.clearTable();
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}
