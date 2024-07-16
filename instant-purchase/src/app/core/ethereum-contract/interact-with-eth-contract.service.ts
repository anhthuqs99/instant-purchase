import { Injectable } from '@angular/core';
import { Blockchain, ContractEvent, SaleData, Signature } from '@core/models';
import { AutonomyWalletService } from '@core/services/web3-wallet-services/autonomy-wallet.service';
import { WalletConnectService } from '@core/services/web3-wallet-services/wallet-connect.service';
import { AppSetting } from '@shared/constants';
import Web3 from 'web3';
import { FeralfileExhibitionV4 } from './constants/V4.constant';
import { FeralFileExhibitionV4_2 } from './constants/V4_2.constant';
import { FeralFileExhibitionV4_3 } from './constants/V4_3.constant';

enum ContractVersion {
  FeralFileExhibitionV4 = 'FeralfileExhibitionV4',
  FeralFileExhibitionV4_2 = 'FeralfileExhibitionV4_2',
  FeralFileExhibitionV4_3 = 'FeralfileExhibitionV4_3',
}

@Injectable({
  providedIn: 'root',
})
export class InteractWithETHContractService {
  private web3: Web3;
  private contract;
  private contractAddress: string;
  private contractVersion: ContractVersion;

  constructor(
    private readonly autonomyWalletService: AutonomyWalletService,
    private readonly walletConnectService: WalletConnectService,
  ) {}

  public async setContract(
    contractAddress: string,
    contractVersion: string,
    networkID: string,
  ) {
    this.contractAddress = contractAddress;
    this.web3 = new Web3(AppSetting.ethPRCEndpoint[networkID]);

    this.contractVersion = contractVersion as ContractVersion;
    let contractABI;
    switch (this.contractVersion) {
      case ContractVersion.FeralFileExhibitionV4: {
        contractABI = FeralfileExhibitionV4.ABI;
        break;
      }

      case ContractVersion.FeralFileExhibitionV4_2: {
        contractABI = FeralFileExhibitionV4_2.ABI;
        break;
      }

      case ContractVersion.FeralFileExhibitionV4_3: {
        contractABI = FeralFileExhibitionV4_3.ABI;
        break;
      }

      default: {
        throw new Error('Contract version not supported');
      }
    }

    this.contract = new this.web3.eth.Contract(contractABI, contractAddress);
  }

  public getContract() {
    return this.contract;
  }

  public getReceipt(tHash: string) {
    return this.web3.eth.getTransactionReceipt(tHash);
  }

  public async buyArtworksWithAutonomy(
    user: string,
    amount: number,
    signature: Signature,
    saleData: SaleData,
  ) {
    let builder;
    switch (this.contractVersion) {
      case ContractVersion.FeralFileExhibitionV4_3:
      case ContractVersion.FeralFileExhibitionV4: {
        builder = this.buyArtworksTransactionBuilder(
          user,
          amount,
          signature,
          saleData,
        );
        break;
      }

      case ContractVersion.FeralFileExhibitionV4_2: {
        builder = this.buyBulkArtworksTransactionBuilder(
          user,
          amount,
          signature,
          saleData,
        );
        break;
      }

      default: {
        throw new Error('Contract version not supported');
      }
    }

    return this.autonomySendTransaction(user, builder);
  }

  public async buyArtworksWithEthWallet(
    user: string,
    amount: number,
    signature: Signature,
    saleData: SaleData,
  ) {
    let builder;
    switch (this.contractVersion) {
      case ContractVersion.FeralFileExhibitionV4_3:
      case ContractVersion.FeralFileExhibitionV4: {
        builder = this.buyArtworksTransactionBuilder(
          user,
          amount,
          signature,
          saleData,
        );
        break;
      }

      case ContractVersion.FeralFileExhibitionV4_2: {
        builder = this.buyBulkArtworksTransactionBuilder(
          user,
          amount,
          signature,
          saleData,
        );
        break;
      }

      default: {
        throw new Error('Contract version not supported');
      }
    }

    return this.walletConnectSendTransaction(builder);
  }

  public async getTokenOwner(tokenId: string): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return this.contract.methods.ownerOf(tokenId).call() as Promise<string>;
  }

  public async getLogs(
    eventName: string,
    filter: Record<string, string | string[]>,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return (await this.contract.getPastEvents(eventName, {
      filter,
      fromBlock: 0,
      toBlock: 'latest',
    })) as Promise<ContractEvent[]>;
  }

  public async getTotalSupply(): Promise<number> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return this.contract.methods.totalSupply().call() as Promise<number>;
  }

  public async getBalanceOf(user: string): Promise<number> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return this.contract.methods.balanceOf(user).call() as Promise<number>;
  }

  public getBuyArtworksBuilder(
    user: string,
    amount: number,
    signature: Signature,
    saleData: SaleData,
  ): { from: string; value: string; to: string; data } {
    let builder;
    switch (this.contractVersion) {
      case ContractVersion.FeralFileExhibitionV4:
      case ContractVersion.FeralFileExhibitionV4_3: {
        builder = this.buyArtworksTransactionBuilder(
          user,
          amount,
          signature,
          saleData,
        );
        break;
      }

      case ContractVersion.FeralFileExhibitionV4_2: {
        builder = this.buyBulkArtworksTransactionBuilder(
          user,
          amount,
          signature,
          saleData,
        );
        break;
      }

      default: {
        throw new Error('Contract version not supported');
      }
    }

    return builder;
  }

  private buyArtworksTransactionBuilder(
    user: string,
    amount: number,
    signature: Signature,
    saleData: SaleData,
  ): { from: string; value: string; to: string; data } {
    return {
      from: user,
      value: Web3.utils.toWei(amount.toString(), 'gwei'),
      to: this.contractAddress,
      data: this.contract.methods
        .buyArtworks(signature.r, signature.s, signature.v, [
          saleData.price,
          saleData.cost,
          saleData.expiryTime,
          saleData.destination,
          saleData.tokenIds,
          saleData.revenueShares.map((revenueShareOfArtwork) => {
            return revenueShareOfArtwork.map((pair) => [
              pair.recipient,
              pair.bps,
            ]);
          }),
          saleData.payByVaultContract,
        ])
        .encodeABI(),
    };
  }

  private buyBulkArtworksTransactionBuilder(
    user: string,
    amount: number,
    signature: Signature,
    saleData: SaleData,
  ): { from: string; value: string; to: string; data } {
    return {
      from: user,
      value: Web3.utils.toWei(amount.toString(), 'ether'),
      to: this.contractAddress,
      data: this.contract.methods
        .buyBulkArtworks(signature.r, signature.s, signature.v, [
          saleData.price,
          saleData.cost,
          saleData.expiryTime,
          saleData.destination,
          saleData.nonce,
          saleData.seriesId,
          saleData.quantity,
          saleData.revenueShares,
          saleData.payByVaultContract,
        ])
        .encodeABI(),
    };
  }

  // Send to wallet methods
  private async autonomySendTransaction(user: string, tx: object) {
    const transactionHash =
      await this.autonomyWalletService.requestSendTransaction(
        Blockchain.Ethereum,
        user,
        [tx],
      );
    return transactionHash;
  }

  private async walletConnectSendTransaction(tx: {
    from: string;
    value: string;
    to: string;
    data;
  }) {
    const transactionHash = await this.walletConnectService.sendTransaction(tx);
    return transactionHash;
  }
}
