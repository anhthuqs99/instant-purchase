import { Injectable } from '@angular/core';
import { Blockchain } from '@core/models/exhibition.model';
import { User } from '@core/models/user.model';
import { TezosWalletService } from './web3-wallet-services/tezos-wallet.service';
import { WalletConnectService } from './web3-wallet-services/wallet-connect.service';

const Web3DomainNameLocalStorageKey = 'web3-domain-names';
const EXPIRED_THRESHOLD = 1; // Day Number

export class Web3DomainName {
  domainName: string;
  expired: number;
}

type WDNDictionary = Map<string, Web3DomainName>;
@Injectable({
  providedIn: 'root',
})
export class Web3DomainNameService {
  private web3DomainNames: WDNDictionary;

  constructor(
    private tezosWalletService: TezosWalletService,
    private walletConnectService: WalletConnectService
  ) {
    this.loadDomainNames();
    this.removeExpiredDomainNames();
  }

  public async getWeb3DomainName(
    address: string,
    chain: Blockchain
  ): Promise<string> {
    const now = Date.now();
    let web3DomainName = this.web3DomainNames[address] as Web3DomainName;
    if (!web3DomainName || web3DomainName.expired < now) {
      let result: string;
      try {
        switch (chain) {
          case Blockchain.Tezos:
            result = await this.tezosWalletService.getDomainName(address);
            break;
          case Blockchain.Ethereum:
            result = await this.walletConnectService.getDomainName(address);
            break;
          default:
            break;
        }
      } catch (e) {
        console.log('getWeb3DomainName', chain, address);
      }
      if (result) {
        web3DomainName = this.setDomainName(address, result);
      }
    }
    return web3DomainName?.domainName;
  }

  public async getUserDomainName(user: User): Promise<string> {
    return this.getWeb3DomainName(user.ID, user.type);
  }

  public saveDomainNames() {
    localStorage.setItem(
      Web3DomainNameLocalStorageKey,
      JSON.stringify(this.web3DomainNames)
    );
  }

  private setDomainName(address: string, domainName: string): Web3DomainName {
    const today = new Date();
    const expired = today.setDate(today.getDate() + EXPIRED_THRESHOLD);

    const web3DomainName: Web3DomainName = { domainName, expired };
    this.web3DomainNames[address] = web3DomainName;
    return web3DomainName;
  }

  private loadDomainNames() {
    this.web3DomainNames = JSON.parse(
      localStorage.getItem(Web3DomainNameLocalStorageKey) || '{}'
    ) as WDNDictionary;
  }

  private removeExpiredDomainNames() {
    const web3DomainNames = this.web3DomainNames;
    const newWeb3DomainNames = {} as WDNDictionary;
    if (web3DomainNames) {
      const now = Date.now();
      for (const [key, value] of Object.entries(web3DomainNames)) {
        const web3DomainName = value as Web3DomainName;
        if (now < web3DomainName.expired) {
          newWeb3DomainNames[key] = web3DomainName;
        }
      }
    }
    this.web3DomainNames = newWeb3DomainNames;
  }
}
