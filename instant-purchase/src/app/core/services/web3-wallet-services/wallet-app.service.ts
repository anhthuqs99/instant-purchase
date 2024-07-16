import { Injectable } from '@angular/core';
import {
  CommonAction,
  SignMessageParameters,
  WalletName,
  Web3SignRequest,
} from '@core/models';
import { APIService } from '../api.service';
import { firstValueFrom } from 'rxjs';

export class DepositReceipt {
  transactionHash?: string;
}

type CommonActionMessage = {
  message: string;
};

@Injectable({
  providedIn: 'root',
})
export class WalletAppService {
  constructor(private apiService: APIService) {}

  public async getLoginWeb3Messages(
    address: string
  ): Promise<{ message: string }> {
    return firstValueFrom(
      this.apiService.post<{ message: string }>(
        'web3/messages/login',
        { address },
        {}
      )
    );
  }

  public async loginWithWeb3Token(
    addresses: string[],
    message: string,
    signatures: string[],
    publicKeys?: string[],
    walletName?: WalletName
  ) {
    const web3Logins = addresses.map((address, index) => {
      return {
        address: address,
        message: message,
        walletName,
        signature: signatures[index],
        publicKey: publicKeys ? publicKeys[index] : null,
      };
    });
    return firstValueFrom(
      this.apiService.post('web3/login', { web3Logins }, {})
    );
  }

  public async getCommonActionMessage(
    address: string,
    action: CommonAction
  ): Promise<string> {
    try {
      const data = await firstValueFrom(
        this.apiService.post<CommonActionMessage>(
          'web3/messages/action',
          { address, action },
          { withCredentials: true }
        )
      );
      return data?.message;
    } catch (error) {
      console.log('Get message error:', error);
      throw error;
    }
  }

  public async getAuthTransactionMessage(
    address: string,
    tokenOf: string
  ): Promise<string> {
    try {
      const data = await firstValueFrom(
        this.apiService.post<CommonActionMessage>(
          'web3/messages/auth-transaction',
          {
            address,
            tokenOf,
          }
        )
      );
      return data?.message;
    } catch (error) {
      console.log('Get message error:', error);
      throw error;
    }
  }

  public getWalletSignMessage(
    request: Web3SignRequest,
    params?: SignMessageParameters
  ): Promise<string> {
    switch (request) {
      case Web3SignRequest.Common: {
        return this.getCommonActionMessage(params.address, params.action);
      }

      case Web3SignRequest.Custom: {
        return Promise.resolve(params.customMessage || null);
      }

      default: {
        return null;
      }
    }
  }
}
