import { Blockchain } from '@core/models/exhibition.model';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Identity, Me, UserDetail, WalletApp } from '@core/models/user.model';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { APIService } from './api.service';
import { map } from 'rxjs/operators';
import { WalletConnectService } from './web3-wallet-services/wallet-connect.service';
import { TezosWalletService } from './web3-wallet-services/tezos-wallet.service';
import { AutonomyWalletService } from './web3-wallet-services/autonomy-wallet.service';
import { environment } from '@environment';
import { AppSetting, ErrorCodes } from '@shared/constants';
import { EventEmitterService } from './event-emitter.service';
import { Utils } from '@shared/utils';
import { UserValidator } from '@core/logic/user.logic';
// import mixpanel from 'mixpanel-browser';

const didFormat = 'did:key:';
@Injectable({
  providedIn: 'root',
})
export class UserService {
  public userValidator: UserValidator = new UserValidator();
  private statusSubject = new BehaviorSubject(false);
  private me!: Me;

  constructor(
    private apiService: APIService,
    private tezosWalletService: TezosWalletService,
    private walletConnectService: WalletConnectService,
    private autonomyWalletService: AutonomyWalletService,
    private httpClient: HttpClient,
  ) {
    this.init();
  }

  public getStatus = () => this.statusSubject;
  public getMe = () => this.me;

  public async updateMe(): Promise<Me> {
    return firstValueFrom<Me>(
      this.apiService.get<Me>('accounts/me', { withCredentials: true }).pipe(
        map((data) => {
          this.me = Object.assign(this.me, data);
          return this.me;
        }),
      ),
    );
  }

  public async signIn(email: string, redirectURL?: string) {
    redirectURL = redirectURL || '/';
    return firstValueFrom(
      this.apiService.post('accounts', { email, redirectURL }),
    );
  }

  public async signOut(reloadPage = true) {
    try {
      await firstValueFrom(
        this.apiService.post(
          'accounts/me/logout',
          {},
          { withCredentials: true },
        ),
      );
      await this.removeConnectIfExisted();
      // mixpanel.reset();
      if (reloadPage) {
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
    }
  }

  public async removeConnectIfExisted() {
    try {
      this.me = undefined;
      EventEmitterService.get(EventEmitterService.Events.UpdateMe).emit(
        this.me,
      );
      const walletApp = localStorage.getItem(AppSetting.ffWalletName);
      if (walletApp) {
        switch (walletApp) {
          case WalletApp.WalletConnect:
            await this.walletConnectService.disconnect();
            break;
          case WalletApp.Autonomy:
            await this.autonomyWalletService.disconnect();
            break;
          case WalletApp.Beacon:
            await this.tezosWalletService.disconnectWallet();
            break;
          default:
            break;
        }
      }
      localStorage.removeItem(AppSetting.ffWalletName);
      localStorage.removeItem(AppSetting.walletconnect);
    } catch (error) {
      console.log(error);
    }
  }

  public async getUser(
    id: string,
    includeLinkedAccounts?: boolean,
    includeCollaborationAccounts?: boolean,
  ): Promise<UserDetail> {
    const query = Utils.getQueryString({
      includeLinkedAccounts,
      includeCollaborationAccounts,
    });
    return firstValueFrom(
      this.apiService
        .get<UserDetail>(
          `accounts/${encodeURIComponent(id)}${query ? `?${query}` : ''}`,
        )
        .pipe(
          map((user) => {
            return includeLinkedAccounts
              ? this.formatUserHasLinkedAccounts(user)
              : user;
          }),
        ),
    );
  }

  public async getBranchIODeepLink(uri: string): Promise<{ link: string }> {
    return firstValueFrom(
      this.apiService.post<{ link: string }>(`web3/deeplink`, { uri }, {}),
    );
  }

  public getAddressByChain(chain: Blockchain): string {
    if (!this.me.childs) {
      return this.me.ID;
    }
    return this.me.childs.find((child) => child.type === chain)?.ID;
  }

  public getWeb3OwnerAddress(me: Me): string {
    switch (me.type) {
      case Blockchain.Autonomy:
        return me.childs.map((child) => child.ID).join(',');
      default:
        return me.ID;
    }
  }

  public async getAutonomyAccountBalance(child: Me): Promise<number> {
    if (this.me) {
      let balance = 0;
      try {
        switch (child.type) {
          case Blockchain.Ethereum:
            balance = await this.walletConnectService.getBalance(child.ID);
            break;
          case Blockchain.Tezos:
            balance = await this.tezosWalletService.getBalance(child.ID);
            break;
          default:
        }
        this.me.childs.filter((c) => c.ID === child.ID)[0].web3Balance =
          balance;
        return balance;
      } catch (e) {
        return 0;
      }
    } else {
      return null;
    }
  }

  public uploadAvatar(file: File, web3Token?: string) {
    const formData = new FormData();
    formData.append('file', file, file.name);
    if (!web3Token) {
      return this.httpClient.put<{ result: string }>(
        `${environment.api_prefix}accounts/me/avatar`,
        formData,
        {
          reportProgress: true,
          observe: 'events',
          withCredentials: true,
        },
      );
    } else {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Web3Token', web3Token);
      return this.httpClient.put<{ result: string }>(
        `${environment.api_prefix}accounts/me/avatar`,
        formData,
        {
          headers,
          reportProgress: true,
          observe: 'events',
          withCredentials: true,
        },
      );
    }
  }

  public async getWeb3AccountBalance() {
    if (this.me) {
      let balance = 0;
      switch (this.me.type) {
        case Blockchain.Tezos:
          balance = await this.tezosWalletService.getBalance(this.me.ID);
          break;
        case Blockchain.Ethereum:
          balance = await this.walletConnectService.getBalance(this.me.ID);
          break;
        default:
          break;
      }

      this.me.web3Balance = balance;
      return balance;
    } else {
      return 0;
    }
  }

  public isDefaultAlias(user: UserDetail | Me) {
    return user.type === Blockchain.Autonomy
      ? user.ID === `${didFormat}${user.alias}`
      : user.alias === user.ID;
  }

  private formatUserHasLinkedAccounts(user: UserDetail): UserDetail {
    if (user?.linkedAccounts?.length) {
      const mainAccount = this.getMainAccountAmongLinkedAccounts(user);
      const cloneUserID = user.ID;

      // Reassign if main account is not current account
      if (mainAccount?.alias !== user.alias) {
        user = Object.assign(user, mainAccount);
        user.ID = cloneUserID; // Keep current account ID
      }
    }

    // Format alias support only one truth profile URL
    if (user.isArtist || user.isCurator) {
      user.alias = Utils.removeArtistCuratorAliasSuffixes(user.alias);
    }

    return user;
  }

  private getMainAccountAmongLinkedAccounts(user: UserDetail): UserDetail {
    if (user?.linkedAccounts?.length) {
      const groupAccounts = [user, ...user.linkedAccounts];
      const mainAccounts = groupAccounts.filter(
        (account) => account.isArtist || account.isCurator,
      );

      // If user has 2 artist/curator accounts, get the main account type is Ethereum
      const mainAccount =
        mainAccounts.length > 1
          ? mainAccounts.find((a) => a.type === Blockchain.Ethereum)
          : mainAccounts[0];

      return mainAccount;
    }

    return user;
  }

  private async init() {
    try {
      this.me = await firstValueFrom(
        this.apiService.get<Me>('accounts/me', { withCredentials: true }),
      );
      this.statusSubject.complete();
    } catch (error) {
      if (
        error instanceof HttpErrorResponse &&
        error?.error?.error?.code === ErrorCodes.AccountNotFound
      ) {
        await this.signOut();
      }

      this.statusSubject.complete();
    }
  }
}
