import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  ElementRef,
  HostListener,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { displayModal } from '@core/logic/modal.logic';
import { isAddressValid } from '@core/logic/web3-validation.logic';
import {
  ArtworkDetail,
  AuctionDetail,
  BidAskDetail,
  Blockchain,
  ContractVersion,
  Exhibition,
  FullSaleDetail,
  Me,
  Mode,
  Payment,
  PaymentMethods,
  PaymentStatus,
  SaleData,
  SaleStatus,
  SaleType,
  SeriesDetail,
  Signature,
  SupportCurrencies,
} from '@core/models';
import {
  CreditPurchaseState,
  CryptoPurchaseState,
  CurrencyService,
  DevicesService,
  InstantPurchaseService,
  SeriesService,
  ShoppingService,
  TransactionService,
} from '@core/services';
import {
  ExchangeRateService,
  PriceConvertPairs,
} from '@core/services/exchange-rate.service';
import { WalletAppService } from '@core/services/web3-wallet-services/wallet-app.service';
import { ConnectionError } from '@core/services/web3-wallet-services/wallet-connect.service';
import * as moment from 'moment';
import {
  Observable,
  Subject,
  Subscription,
  debounceTime,
  takeUntil,
  timer,
} from 'rxjs';
import { loadStripe } from '@stripe/stripe-js';
import { Location } from '@angular/common';
import { environment } from '@environment';
import { AppSetting, ErrorCodes } from '@shared/constants';
import { ErrorsMessage } from '@shared/errors-definition';
import { InteractWithETHContractService } from '@core/ethereum-contract/interact-with-eth-contract.service';
import { AutonomyIRL } from 'autonomy-irl-js';

enum AddressOf {
  CurrentAddress,
  OtherAddress,
}

enum Step {
  Collect = 'collect',
  Checkout = 'checkout',
  Receipt = 'receipt',
}

const debounceTimeDuration = 300;

const AUTONOMY_IRL_METADATA = {
  name: 'Feral File',
  url: 'https://feralfile.com',
  icons: ['https://feralfile.com/assets/FeralFile.png'],
  description: 'Feral File',
};

@Component({
  selector: 'app-instant-purchase',
  templateUrl: './instant-purchase.component.html',
  styleUrls: ['./instant-purchase.component.scss'],
})
export class InstantPurchaseComponent {
  public anything: object;

  public ask: BidAskDetail;
  public artworks: ArtworkDetail[];
  public auction: AuctionDetail;
  public exhibition: Exhibition;
  public sale: FullSaleDetail;
  public isCanGoBack: boolean;
  public differentChain: boolean;
  public targetBlockchain: Blockchain;
  public isEditionSale: boolean;
  public collectingTitle: string;
  public Step = Step;
  public currentStep = Step.Collect;
  public PaymentMethod = PaymentMethods;

  public autonomyIRL = new AutonomyIRL();
  @ViewChild('paymentProcessingModal') paymentProcessingModal: ElementRef;
  public isShowPaymentProcessingModal: boolean;

  public series: SeriesDetail;
  public quantity: number;
  public price = 0;
  public buyerAddress: string;
  @ViewChild('errorModal') errorModal: ElementRef;
  @ViewChild('inputRecipient') inputRecipient: ElementRef;

  // RDA data
  public isReverseDutchAuction: boolean;
  public currentPrice: number;
  public nextDropPrice: number;
  public isDroppingLocked: boolean;
  public dropAt: string;
  public seriesID: string;
  public askID: string;
  public web3Token: string;

  public isDifferentPaymentMethod: boolean;

  public me: Me;
  public Mode = Mode;
  public Blockchain = Blockchain;
  public AppSetting = AppSetting;
  public Object = Object;
  public ContractVersion = ContractVersion;
  public contractVersion: string;
  public errorCode: number;
  public errorCustomMessage: string;
  public ErrorsMessage = ErrorsMessage;
  public SaleType = SaleType;
  public cryptoRoundFormat: string;
  public SaleStatus = SaleStatus;
  public PaymentMethods = PaymentMethods;
  public paymentMethod: PaymentMethods;
  public addressOf = AddressOf.CurrentAddress;
  public AddressOf = AddressOf;
  public otherTargetRecipient: string;
  public inputRecipientForm: FormControl;
  public availableBalance: number;
  public bidID: string;
  public saleID: string;
  public expiredAt: string;
  public bufferTimeForBidOnServer = AppSetting.bufferTimeForBidOnServer;
  public bid: BidAskDetail;
  public payment: Payment;
  public bidTimerCountdown: string;
  public oldSaleTimerCountdown: string;
  public web3TransactionHash: string;
  public CryptoPurchaseState = CryptoPurchaseState;
  public cryptoPurchaseState: CryptoPurchaseState;
  public isPaymentBeingProcessed: boolean;
  public isCreateSaleProgressing: boolean;
  public isBidTimeout: boolean;
  public purchaseCompleted: boolean;
  public isPurchaseProgressing: boolean;
  public saleFailed: boolean;
  public saleCancelled: boolean;
  public paymentFailed: boolean;
  public isPaymentExpired: boolean;
  public isBidCancelled: boolean;
  public isWaitingForBlockchainResponse: boolean;
  public isWalletRejected: boolean;
  public isCreatingSale: boolean;
  public isShowError: boolean;
  public isSelectMethodsPeriod: boolean;
  public isEnteredADomain: boolean;
  public isNotAnAddressOrDomain: boolean;
  public isBlockConfirmRecipient: boolean;
  public isContinueCryptoPayment: boolean;
  public expanded: boolean;

  // Sale info
  public currency: string;
  public isPrivate: boolean;

  // card payment variables
  public equivalentPrices: number;
  public CreditPurchaseState = CreditPurchaseState;
  public creditPurchaseState: CreditPurchaseState;
  public isCardMethodCreating: boolean;
  public cardErrorCode: Record<string, string | object>;
  public cardPriceIncludeFee: number;
  public isContinueAfterPayment: boolean;
  public isContinueBeforePayment: boolean;
  public walletResponseMessage: string;

  // eslint-disable-next-line
  stripe: any; // from stripe card element

  // Series random bundle data
  public destroyAsk: Subject<void>;
  public askTimer;
  public askTimerCountdown: string;
  public isAskTimeout: boolean;
  public SupportCurrencies = SupportCurrencies;
  public usdCryptoExchangeRate = 0;

  // card payment variables
  private isWaitingFor3DSecure: boolean;
  // timer for order submitted and no payment
  private destroyBid: Subject<void>;
  private destroyOldSaleCountDown: Subject<void>;
  private bidTimer;
  private transferRequestAbort: boolean;
  private insufficientBalances: boolean;
  private destroyPaymentProgress: Subject<unknown>;
  private destroySaleProgress: Subject<unknown>;
  private paymentTimer: Observable<number>;
  private saleTimer: Observable<number>;
  private onDestroying: boolean;
  private isMobile: boolean;
  private saleData: SaleData;
  private signature: Signature;
  private newSaleSucceededSubscription: Subscription;
  private isSaleCompleted: boolean;
  private handleTxIDRetryCount: number;
  private instantToken: string;

  private signMessageTime: Date;

  constructor(
    private transactionService: TransactionService,
    private shoppingService: ShoppingService,
    private router: Router,
    private location: Location,
    private currencyService: CurrencyService,
    private interactWithETHContractService: InteractWithETHContractService,
    private readonly route: ActivatedRoute,
    private readonly exchangeRateService: ExchangeRateService,
    private readonly seriesService: SeriesService,
    private readonly walletAppService: WalletAppService,
    private readonly instantPurchaseService: InstantPurchaseService,
  ) {
    type QueryParameter = Params & {
      ask?: string;
      ba?: string;
      s?: string;
      stp?: string;
      it?: string;
      sr?: string;
      qty?: string;
    };
    this.route.queryParams.subscribe((params: QueryParameter) => {
      this.askID = params.ask;
      this.buyerAddress = params.ba;
      this.saleID = params.s;
      if (params.stp) {
        this.currentStep = params.stp as Step;
      }
      this.instantToken = params?.it;
      this.seriesID = params.sr;
      if (params.qty) {
        this.quantity = Number(params.qty);
      }

      this.initData();
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(e) {
    if (
      ((this.bid?.id && !this.isBidCancelled) || this.payment) &&
      !this.isWaitingFor3DSecure &&
      !(
        this.cryptoPurchaseState === CryptoPurchaseState.SaleComplete ||
        this.creditPurchaseState === CreditPurchaseState.PurchaseComplete
      )
    ) {
      e.preventDefault();
      e.returnValue = 'Your order will be cancelled. Are you sure to leave?';
      return false;
    } else {
      return true;
    }
  }
  @HostListener('window:unload', ['$event'])
  async unloadHandler() {
    if (
      this.bid?.id &&
      !this.isBidCancelled &&
      !(
        this.isPurchaseProgressing ||
        this.purchaseCompleted ||
        (this.sale?.bid?.payment?.status as PaymentStatus) !==
          PaymentStatus.failed ||
        this.web3TransactionHash
      ) &&
      !(
        this.isMobile &&
        [
          CryptoPurchaseState.AwaitingPayment,
          CryptoPurchaseState.PaymentConfirmation,
          CryptoPurchaseState.ReceivePayment,
          CryptoPurchaseState.PaymentComplete,
          CryptoPurchaseState.SaleComplete,
        ].includes(this.cryptoPurchaseState)
      )
    ) {
      try {
        await this.cancelBid();
      } catch (error) {
        console.log(error);
      }
    }
  }

  ngOnInit() {
    this.isMobile = DevicesService.isMobile();
    this.checkIfContinueOldSale();
    this.initSaleInfo().catch((error) => {
      console.log(error);
    });
    this.initInputForm();
  }

  ngOnChanges(change: SimpleChanges) {
    if (change?.['exhibition']?.currentValue) {
      this.contractVersion = this.exhibition.contracts?.length
        ? this.exhibition.contracts[0].version
        : ContractVersion.V1;
      this.addressOf =
        change['differentChain']?.currentValue || !this.me?.ID
          ? AddressOf.OtherAddress
          : AddressOf.CurrentAddress;
      this.setETHContract();
      this.cryptoRoundFormat = this.currencyService.currencyRoundFormat(
        this.targetBlockchain,
      );
    }
  }

  async ngOnDestroy() {
    this.onDestroying = true;
    this.stopBidTimer();
    this.stopPaymentProgress();
    this.stopSaleProgress();
    this.newSaleSucceededSubscription?.unsubscribe();
    if (
      this.bid?.id &&
      !this.isBidCancelled &&
      !(
        this.isPurchaseProgressing ||
        this.purchaseCompleted ||
        (this.sale?.bid?.payment?.status as PaymentStatus) !==
          PaymentStatus.failed ||
        this.web3TransactionHash
      ) &&
      !(
        this.isMobile &&
        [
          CryptoPurchaseState.AwaitingPayment,
          CryptoPurchaseState.PaymentConfirmation,
          CryptoPurchaseState.ReceivePayment,
          CryptoPurchaseState.PaymentComplete,
          CryptoPurchaseState.SaleComplete,
        ].includes(this.cryptoPurchaseState)
      )
    ) {
      try {
        await this.cancelBid();
      } catch (error) {
        console.log(error);
      }
    }
  }

  public nextStep() {
    switch (this.currentStep) {
      case Step.Collect:
        this.currentStep = Step.Checkout;
        break;
      case Step.Checkout:
        this.currentStep = Step.Receipt;
        break;
      default:
    }
  }

  public async backStep() {
    switch (this.currentStep) {
      case Step.Collect:
        this.cancelBid().catch((error) => {
          // Sentry.captureMessage(error);
          console.log(error);
        });
        this.autonomyIRL.closeWebview();
        break;
      case Step.Checkout:
        this.isCreatingSale = false;
        this.currentStep = Step.Collect;
        break;
      case Step.Receipt:
        this.currentStep = Step.Checkout;
        break;
      default:
    }
  }

  public async close() {
    if (window.flutter_inappwebview) {
      try {
        if (this.paymentMethod === PaymentMethods.crypto) {
          return window.flutter_inappwebview.callHandler('passData', {
            type: 'instant_purchase',
            data: {
              token_ids: [],
              close: true,
              is_non_crypto_payment: false,
              address: this.inputRecipientForm?.value || this.buyerAddress,
            },
          });
        }

        this.ask = await this.transactionService.getAsk(this.sale?.askID);
        const contract = this.exhibition?.contracts?.find(
          (contract) => contract.blockchainType === this.targetBlockchain,
        );

        const tokenIDs =
          this.ask?.artworks?.map((artwork) => {
            return `eth-${contract?.address}-${artwork.id}`;
          }) || [];

        return window.flutter_inappwebview.callHandler('passData', {
          type: 'instant_purchase',
          data: {
            token_ids: tokenIDs,
            close: true,
            is_non_crypto_payment: true,
            address: this.inputRecipientForm?.value || this.buyerAddress,
          },
        });
      } catch (error) {
        this.errorCode = (error as HttpErrorResponse).error.error.code;
        this.openErrorModal();
      }
    }

    this.autonomyIRL.closeWebview();
  }

  public closePaymentProcessingModal() {
    this.isShowPaymentProcessingModal = false;
    displayModal(this.paymentProcessingModal, false);
  }

  public openPaymentProcessingModal() {
    this.isShowPaymentProcessingModal = true;
    setTimeout(() => {
      displayModal(this.paymentProcessingModal, true);
    }, 100);
  }

  public reload() {
    window.location.reload();
  }

  public tryBiddingAgain() {
    if (this.paymentMethod === PaymentMethods.card && this.paymentFailed) {
      this.paymentFailed = false;
    } else {
      window.location.reload();
    }
  }

  public back() {
    if (
      this.sale &&
      this.sale.bid?.payment?.status === PaymentStatus.failed &&
      this.sale.bid?.payment?.metadata?.redirectToURL
    ) {
      if (window.history.length >= 5) {
        window.history.go(-5);
      } else {
        this.router.navigate(['/']);
      }
    } else {
      window.history.back();
    }
  }

  public closeErrorModal() {
    displayModal(this.errorModal, false);
    this.errorCustomMessage = '';
    this.isCreatingSale = false;
    setTimeout(() => {
      this.isShowError = false;
    }, AppSetting.modalDismissTime);
  }

  public async retryCryptoPayment() {
    this.isPurchaseProgressing = false;
    this.isContinueCryptoPayment = false;
    await this.submitCryptoPayment();
  }

  public async onSelectPaymentMethod(method: PaymentMethods) {
    try {
      if (this.isCreatingSale) {
        return;
      }

      this.isDifferentPaymentMethod = false;

      if (
        this.payment?.source === PaymentMethods.crypto &&
        method === PaymentMethods.card
      ) {
        this.isDifferentPaymentMethod = true;
        this.openErrorModal();
        return;
      }

      this.isCreatingSale = true;
      this.paymentMethod = method;
      this.isContinueAfterPayment = false;
      this.isContinueBeforePayment = false;
      this.isBidTimeout = false;
      this.isPaymentExpired = false;

      if (method === PaymentMethods.crypto) {
        this.openPaymentProcessingModal();
      }

      if (!this.bid) {
        await this.createNewBid();
      }

      switch (method) {
        case PaymentMethods.card:
          this.nextStep();
          break;
        case PaymentMethods.crypto:
          this.payWithCrypto();
          break;
        default:
          this.errorCustomMessage = 'Payment method is not supported.';
          this.openErrorModal();
          break;
      }
    } catch (error) {
      console.log(error);
      // Sentry.captureMessage('Payment: onSelectPaymentMethod error', error);
      this.errorCustomMessage =
        'Error occurred while selecting payment method.';
      this.openErrorModal();
    }
  }

  // payment with crypto
  public async submitCryptoPayment() {
    this.transferRequestAbort = false;
    if (
      this.bid?.id &&
      !this.isPurchaseProgressing &&
      !this.insufficientBalances
    ) {
      this.isPurchaseProgressing = true;
      this.isSelectMethodsPeriod = false;
      this.cryptoPurchaseState = CryptoPurchaseState.InitiatingPurchase;
      const recipientAddress =
        this.inputRecipientForm.value || this.buyerAddress;

      try {
        const paymentResponse = await this.shoppingService.createPayment(
          PaymentMethods.crypto,
          this.bid.id,
          recipientAddress,
          null,
          null,
          this.web3Token,
          this.buyerAddress,
        );
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.setTimerExpiryToNewSale();
        this.payment = paymentResponse.payment;
        this.paymentFailed = false;
        this.isWaitingForBlockchainResponse = true;
        this.saleData =
          this.bid?.saleType === SaleType.seriesSequenceBundle
            ? paymentResponse.buyBulkArtworksSaleData
            : paymentResponse.buyArtworksSaleData;
        this.signature = paymentResponse.signature;
        this.sale.bid.payment = this.payment;
        this.cryptoPurchaseState = CryptoPurchaseState.AwaitingPayment;
        await this.sendCryptoTransaction();
      } catch (error) {
        this.isPurchaseProgressing = false;
        if (error instanceof HttpErrorResponse) {
          switch (error.error.error.code) {
            case ErrorCodes.OrderCancelled: {
              this.stopBidTimer();
              this.errorCode = ErrorCodes.OrderCancelled;
              this.openErrorModal();
              break;
            }

            case ErrorCodes.SaleBeingProcessed: {
              this.stopBidTimer();
              this.errorCode = ErrorCodes.SaleBeingProcessed;
              this.openErrorModal();
              break;
            }

            case ErrorCodes.FailedPaymentCreation: {
              this.stopBidTimer();
              this.errorCode = ErrorCodes.FailedPaymentCreation;
              this.openErrorModal();
              break;
            }

            case ErrorCodes.NotLoggedIn: {
              this.stopBidTimer();
              this.errorCode = ErrorCodes.NotLoggedIn;
              this.openErrorModal();
              break;
            }

            default: {
              this.errorCode = -1;
              this.openErrorModal();
              break;
            }
          }
        }
      }
    }
  }

  public async cancelBid() {
    this.isSelectMethodsPeriod = true;
    this.paymentMethod = null;
    this.isPurchaseProgressing = false;
    this.isCardMethodCreating = false;
    if (this.bid?.saleType === SaleType.seriesSequenceBundle) {
      this.isContinueBeforePayment = true;
      return;
    }
    await this.transactionService.cancelBid(
      this.bid?.id,
      this.web3Token,
      this.buyerAddress,
    );
    this.instantPurchaseService.putInstantPurchase({
      id: this.instantToken,
      params: {
        saleID: '',
        saleStatus: '',
      },
    });
    this.sale = null;
    this.isWalletRejected = false;
    this.expiredAt = null;
    this.isBidCancelled = true;
    this.isCreatingSale = false;
    this.bid = null;
    this.stopPaymentProgress();
    this.stopSaleProgress();
  }

  private async createBid() {
    try {
      switch (this.series?.settings?.initialSaleType) {
        case SaleType.single: {
          this.bid = await this.transactionService.createShoppingBidOfArtwork(
            this.ask?.id,
            this.seriesID,
            this.exhibition,
            this.paymentMethod,
            this.isEditionSale,
            this.web3Token,
            this.buyerAddress,
          );
          break;
        }

        case SaleType.seriesSequenceBundle: {
          this.sale =
            await this.transactionService.createSeriesSequenceBundleShoppingSale(
              this.series.id,
              this.quantity,
              this.web3Token,
              this.buyerAddress,
            );
          this.bid = await this.transactionService.getBid(this.sale?.bidID);
          break;
        }

        case SaleType.seriesRandomBundle: {
          this.sale =
            (await this.transactionService.createSeriesRandomBundleShoppingSale(
              this.series.id,
              this.quantity,
              this.web3Token,
              this.buyerAddress,
            )) as FullSaleDetail;
          this.bid = await this.transactionService.getBid(this.sale?.bidID);
          break;
        }
      }

      if (this.bid) {
        this.sale = await this.shoppingService.getSale(
          this.bid?.sale?.id || this.sale?.id,
          [],
          this.web3Token,
          this.buyerAddress,
        );

        this.instantPurchaseService
          .putInstantPurchase({
            id: this.instantToken,
            params: {
              saleID: this.sale.id,
              saleStatus: this.sale.status,
            },
          })
          .catch((error) => {
            // Sentry.captureMessage(error);
            console.log(error);
          });

        if (
          this.series?.settings?.initialSaleType ===
          SaleType.seriesSequenceBundle
        ) {
          this.quantity = this.sale?.ask?.metadata?.bundleQuantity || 0;
          this.price = this.sale?.bid?.price || 0;
        }

        const payment = this?.sale?.bid?.payment;
        // Payment is not exist, so we continue the purchase.
        if (!payment) {
          this.cardPriceIncludeFee =
            this.getUsdPriceFromSale() +
            (this.sale?.metadata?.creditCardCost || 0);
          this.isBidCancelled = false;
          this.isSelectMethodsPeriod = false;
          this.expiredAt = moment(this.sale.expiredAt)
            .subtract(this.bufferTimeForBidOnServer, 'minutes')
            .format();
          this.startBidTimer();
        } else if (
          (payment?.status as PaymentStatus) === PaymentStatus.failed
        ) {
          // Try to create new bid when payment failed but there is an active bid. Handle case mismatch cancel bid on destroy component.
          // Force to cancel the bid and create a new one.
          await this.cancelBid();
          this.createBid().catch((error) => {
            console.log(error);
          });
        } else {
          this.isPaymentBeingProcessed = true;
          /**
           * Countdown until the old sale expired, if the sale is already expired,
           * it actually being handled by the continueOldSale. Or the startOldSaleCountDown is also handling it.
           */
          if (this.sale?.expiredAt || this.bid.sale?.expiredAt) {
            this.expiredAt = this.sale?.expiredAt || this.bid?.sale?.expiredAt;
            this.startBidTimer();
          }

          if (payment.source === PaymentMethods.crypto) {
            if (this.paymentMethod === PaymentMethods.crypto) {
              this.submitCryptoPayment();
              return;
            }

            if ([PaymentMethods.card].includes(this.paymentMethod)) {
              this.isDifferentPaymentMethod = true;
              this.openErrorModal();
            }
          }

          return;
        }
      } else {
        this.errorCustomMessage = 'Bid is empty!';
        this.openErrorModal();
      }
    } catch (e) {
      this.isSelectMethodsPeriod = true;
      if (e['status'] === 401) {
        this.isCreatingSale = false;
        this.handleCreateBidError(e);
        return;
      }
      this.isCreatingSale =
        e['error'].error.code === ErrorCodes.AuctionHasEnded;
      this.handleCreateBidError(e);
    }
  }

  private async payWithCrypto() {
    try {
      this.setExpiryToCurrentSale();
      this.sale = await this.shoppingService.getSale(
        this.bid?.sale?.id || this.sale?.id,
        [],
        this.web3Token,
        this.buyerAddress,
      );
      if (this.sale?.status === SaleStatus.submitted) {
        this.closeErrorModal();
        await this.submitCryptoPayment();
      } else {
        this.errorCustomMessage = this.sale
          ? `The sale has been ${this.sale.status}`
          : 'This sale is not exist.';
        this.openErrorModal();
      }
    } catch (e) {
      console.log(e);
      this.closePaymentProcessingModal();
      this.errorCustomMessage = 'Can not get sale.';
      this.openErrorModal();
    }
  }

  private getUsdPriceFromSale(): number {
    return this.bid?.currency?.toUpperCase() === String(SupportCurrencies.USD)
      ? this.sale.price
      : this.sale.metadata?.equivalentPrices?.USD || 0;
  }

  private openErrorModal() {
    // First time out is make sure we are not closing a
    setTimeout(() => {
      this.isShowError = true;
      // Second timeout make sure the error modal has been rendered, then add class for animating.
      setTimeout(() => {
        displayModal(this.errorModal, true);
      }, 50);
    }, 100);
  }

  private removeCurrentTxID() {
    if (this.sale?.id) {
      localStorage.removeItem(AppSetting.txHashPrefix + this.sale?.id);
      this.web3TransactionHash = '';
    }
  }

  private storeSaleTransactionHash() {
    if (this.sale && this.sale.id && this.sale.expiredAt) {
      const saleTxHashObject = {
        value: this.web3TransactionHash,
        expireAt: this.sale.expiredAt,
      };
      localStorage.setItem(
        AppSetting.txHashPrefix + this.sale.id,
        JSON.stringify(saleTxHashObject),
      );
    }
  }

  private stopBidTimer() {
    if (this.destroyBid) {
      this.destroyBid.next();
      this.destroyBid.complete();
    }
  }

  private async isTxIDSucceed(tHash: string): Promise<boolean> {
    try {
      let transactionReceipt = null;
      while (!transactionReceipt) {
        transactionReceipt =
          await this.interactWithETHContractService.getReceipt(tHash);
        if (transactionReceipt?.status) {
          return true;
        } else if (transactionReceipt) {
          return false;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      return null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  private async handleTxID(txID: string) {
    if (!txID || !/^0x([A-Fa-f0-9]{64})$/.test(txID)) {
      this.onTransactionFailed();
      return;
    }
    try {
      this.cryptoPurchaseState = CryptoPurchaseState.ReceivePayment;
      const isSuccess = await this.isTxIDSucceed(txID);
      if (isSuccess) {
        this.removeCurrentTxID();
        this.stopBidTimer();
        this.isBidTimeout = false;
        this.purchaseCompleted = true;
        this.isPurchaseProgressing = false;
        this.isWaitingForBlockchainResponse = false;
        this.cryptoPurchaseState = CryptoPurchaseState.SaleComplete;
        this.creditPurchaseState = CreditPurchaseState.PurchaseComplete;
        this.closePaymentProcessingModal();
        this.currentStep = Step.Receipt;
      } else if (isSuccess === false) {
        this.onTransactionFailed();
      } else {
        this.handleTxIDRetryCount += 1;
        if (this.handleTxIDRetryCount < 20) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
          this.handleTxID(txID);
        } else {
          this.onTransactionFailed();
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  private onTransactionFailed() {
    this.removeCurrentTxID();
    this.isWaitingForBlockchainResponse = false;
    this.cryptoPurchaseState = CryptoPurchaseState.InitiatingPurchase;
    if (!this.isBidTimeout) {
      this.paymentFailed = true;
      this.isPurchaseProgressing = false;
    }
  }

  private sendCryptoFailedHandler(e) {
    console.log(e);
    if (this.isPurchaseProgressing) {
      this.walletResponseMessage = [
        ConnectionError.WrongAddress,
        ConnectionError.Disconnected,
        ConnectionError.WrongNetwork,
      ].includes(e.message as ConnectionError)
        ? e.message
        : 'Transaction denied by wallet.';
      this.isWalletRejected = true;
      this.errorCustomMessage = this.walletResponseMessage;
      this.openErrorModal();
    }
    this.isShowPaymentProcessingModal = false;
    this.isWaitingForBlockchainResponse = false;
    this.transferRequestAbort = true;
    this.isPurchaseProgressing = false;
    this.isCreatingSale = false;
    this.cryptoPurchaseState = CryptoPurchaseState.InitiatingPurchase;
  }

  private async sendCryptoTransaction() {
    if (
      this.payment &&
      this.saleData &&
      this.signature &&
      this.payment.status === PaymentStatus.submitted &&
      this.isPurchaseProgressing
    ) {
      try {
        let txID;
        this.isWalletRejected = false;
        switch (this.targetBlockchain) {
          case Blockchain.Tezos:
            return; // Change to break after implementing Tezos.
          case Blockchain.Ethereum:
            await this.setETHContract();
            const builder =
              this.interactWithETHContractService.getBuyArtworksBuilder(
                this.buyerAddress,
                this.payment.amount,
                this.signature,
                this.saleData,
              );
            const { result, errorMessage } =
              (await this.autonomyIRL.sendTransaction(
                this.autonomyIRL.chain.eth,
                this.buyerAddress,
                [builder],
                AUTONOMY_IRL_METADATA,
              )) as { result: string; errorMessage: string };

            if (errorMessage) {
              this.sendCryptoFailedHandler(errorMessage);
              return;
            }

            txID = result;
            break;
          default:
            this.isPurchaseProgressing = false;
            return;
        }

        this.web3TransactionHash = txID;
        this.storeSaleTransactionHash();
        this.handleTxIDRetryCount = 0;
        this.stopBidTimer();
        this.handleTxID(txID);
      } catch (error) {
        console.log(error);
        this.isWaitingForBlockchainResponse = false;
        this.sendCryptoFailedHandler(error);
      }
    }
  }

  private async setETHContract() {
    if (!this.interactWithETHContractService.getContract()) {
      const contract = this.exhibition?.contracts?.find(
        (contract) => contract.blockchainType === this.targetBlockchain,
      );
      if (contract) {
        await this.interactWithETHContractService.setContract(
          contract.address,
          contract.name,
          environment.walletChainID,
        );
      } else {
        // Sentry.captureMessage('Payment: Can not get contract address');
      }
    }
  }

  private checkIfContinueOldSale() {
    if (
      [
        SaleStatus.processing,
        SaleStatus.canceled,
        SaleStatus.failed,
        SaleStatus.succeeded,
      ].includes(this.sale?.status as SaleStatus)
    ) {
      this.backFrom3DSecure();
      this.saleHandler();
    } else if (this.sale) {
      if (this.sale.bid?.payment) {
        this.continueSaleAfterPayment();
      } else {
        const saleExpireTime = new Date(this.sale?.expiredAt).getTime();
        if (Date.now() < saleExpireTime) {
          this.continueSaleBeforePayment();
        } else {
          this.sale.status = SaleStatus.canceled;
          this.isSelectMethodsPeriod = true;
        }
      }
    } else {
      this.isSelectMethodsPeriod = true;
    }
  }

  private async continueSaleBeforePayment() {
    if (
      this.sale.status === SaleStatus.submitted ||
      this.sale.status === SaleStatus.processing
    ) {
      this.isContinueBeforePayment = true;
      try {
        this.bid = this.sale.bid;
        this.isBidCancelled = false;
        this.isSelectMethodsPeriod = true;
        this.expiredAt = moment(this.sale.expiredAt)
          .subtract(this.bufferTimeForBidOnServer, 'minutes')
          .format();
        this.startBidTimer();
      } catch (e) {
        this.isSelectMethodsPeriod = true;
        this.handleCreateBidError(e);
      }
    } else {
      this.errorCustomMessage = `Your sale has been ${this.sale.status}.`;
      this.openErrorModal();
      this.isSelectMethodsPeriod = true;
      this.initInputForm();
    }
  }

  private continueSaleAfterPayment() {
    this.isPurchaseProgressing = true;
    this.isContinueAfterPayment = true;
    if (this.sale.bid?.payment?.source === PaymentMethods.card) {
      if (
        (this.sale.bid?.payment?.status as PaymentStatus) ===
        PaymentStatus.failed
      ) {
        // If payment failed, allow user to retry on new payment
        this.paymentMethod = PaymentMethods.card;
        this.backFromActiveBidButPaymentFailed();
      } else {
        this.backFrom3DSecure();
        this.startPaymentProgress();
      }
    } else {
      if (this.sale.bid.payment.status === PaymentStatus.submitted) {
        try {
          const oldTransactionObject = JSON.parse(
            localStorage.getItem(AppSetting.txHashPrefix + this.sale.id),
          );
          this.web3TransactionHash = oldTransactionObject?.value;
          const txExpiredAt = oldTransactionObject?.expireAt;
          // If payment existing and we got a transaction, just watch the transaction's status.
          if (this.web3TransactionHash && txExpiredAt) {
            if (Date.now() < new Date(txExpiredAt).getTime()) {
              this.web3TransactionHash = oldTransactionObject.value;
              this.handleTxIDRetryCount = 0;
              this.handleTxID(this.web3TransactionHash);
            } else {
              this.isPaymentExpired = true;
              this.isPurchaseProgressing = false;
              this.removeCurrentTxID();
            }
            // Otherwise, the payment existing but we don't have any transaction, just handle the payment status.
            // => If payment expired, show expiration.
          } else {
            // If payment is still activating, call createPayment to get signature and saleData again.
            this.processOnCryptoPaymentSubmitted().catch((error) => {
              console.log(error);
            });
          }
        } catch (e) {
          console.log(e);
        }
      }
    }
  }

  private backFromActiveBidButPaymentFailed() {
    this.sale.bid.payment = null;
    this.bid = this.sale.bid;
    this.cardPriceIncludeFee =
      this.getUsdPriceFromSale() + (this.sale?.metadata?.creditCardCost || 0);

    this.isPurchaseProgressing = false;
    this.isBidCancelled = false;
    this.isSelectMethodsPeriod = false;
    this.paymentFailed = true;
    this.creditPurchaseState = null;

    this.expiredAt = moment(this.sale.expiredAt)
      .subtract(this.bufferTimeForBidOnServer, 'minutes')
      .format();
    this.startBidTimer();
  }

  private async processOnCryptoPaymentSubmitted() {
    if (this.sale?.bid?.payment?.status === PaymentStatus.submitted) {
      const saleExpireTime = new Date(this.sale.expiredAt).getTime();
      if (Date.now() < saleExpireTime) {
        this.bid = this.sale.bid;
        this.paymentMethod = PaymentMethods.crypto;
        this.isPurchaseProgressing = false;
        this.isContinueCryptoPayment = true;
        this.setExpiryToCurrentSale();
      } else {
        // If sale expired
        this.isPaymentExpired = true;
        this.isPurchaseProgressing = false;
      }
    }
  }

  public async validateRecipientInput(value: string) {
    this.inputRecipientForm.disable({ emitEvent: false });
    this.isEnteredADomain = false;
    this.otherTargetRecipient = value;
    switch (this.targetBlockchain) {
      case Blockchain.Tezos:
        // Later
        if (value) {
          if (
            isAddressValid(this.otherTargetRecipient, this.targetBlockchain)
          ) {
            this.isEnteredADomain = value !== this.otherTargetRecipient;
            this.isNotAnAddressOrDomain = false;
          } else {
            this.isNotAnAddressOrDomain = true;
            this.isEnteredADomain = false;
          }
        } else {
          this.isNotAnAddressOrDomain = true;
          this.isEnteredADomain = false;
        }
        break;
      case Blockchain.Ethereum:
        if (value) {
          if (
            isAddressValid(this.otherTargetRecipient, this.targetBlockchain)
          ) {
            this.isNotAnAddressOrDomain = false;
          } else {
            this.isNotAnAddressOrDomain = true;
          }
        } else {
          this.isNotAnAddressOrDomain = true;
        }
        break;
      default:
    }
    this.inputRecipientForm.enable({ emitEvent: false });
  }

  private initInputForm() {
    this.inputRecipientForm = new FormControl(this.buyerAddress);
    this.inputRecipientForm.valueChanges.subscribe(() => {
      this.isBlockConfirmRecipient = true;
      this.isNotAnAddressOrDomain = false;
    });
    this.inputRecipientForm.valueChanges
      .pipe(debounceTime(debounceTimeDuration))
      .subscribe((value) => {
        this.validateRecipientInput(value);
      });
  }

  private async initSaleInfo() {
    if (this.isEditionSale) {
      const series = this.artworks[0].series;
      this.price = series.settings?.saleSettings?.shopping?.price;
      this.currency = series.settings?.baseCurrency;
      this.isPrivate = false;
    } else {
      this.price = this.ask?.price;
      this.currency = this.ask?.currency;
      this.isPrivate = this.ask?.isPrivate;
    }

    if (
      (this.currency?.toUpperCase() as SupportCurrencies) ===
      SupportCurrencies.USD
    ) {
      await this.getUsdCryptoExchangeRate();
    }
  }

  private async getUsdCryptoExchangeRate() {
    try {
      this.usdCryptoExchangeRate =
        await this.exchangeRateService.getExchangeRate(
          this.exhibition?.mintBlockchain === Blockchain.Tezos
            ? PriceConvertPairs.USD2XTZ
            : PriceConvertPairs.USD2ETH,
        );
    } catch (error) {
      console.log(error);
      this.usdCryptoExchangeRate = 0;
    }
  }

  private stopOldSaleCountDown() {
    if (this.destroyOldSaleCountDown) {
      this.destroyOldSaleCountDown.next();
      this.destroyOldSaleCountDown.complete();
    }
  }

  private startOldSaleCountDown(expiredAt: string) {
    this.stopOldSaleCountDown();
    this.destroyOldSaleCountDown = new Subject();
    const oldSaleCountDownTimer = timer(0, 1000);
    this.oldSaleTimerCountdown = '';

    oldSaleCountDownTimer
      .pipe(takeUntil(this.destroyOldSaleCountDown))
      .subscribe(async () => {
        const difference = moment.duration(moment(expiredAt).diff(moment()));
        this.oldSaleTimerCountdown =
          ('0' + difference.minutes()).slice(-2) +
          ':' +
          ('0' + difference.seconds()).slice(-2);
        if (difference.asSeconds() <= 0) {
          this.oldSaleTimerCountdown = '00:00';
          this.destroyOldSaleCountDown.next();
          this.destroyOldSaleCountDown.complete();
          this.oldSaleTimerCountdown = '';
          this.isCreatingSale = false;
          this.isPaymentBeingProcessed = false;
          this.isPurchaseProgressing = false;
        }
      });
  }

  private startBidTimer() {
    this.stopBidTimer();
    if (!this.expiredAt) {
      return;
    }

    this.destroyBid = new Subject();
    this.bidTimer = timer(0, 1000);
    this.bidTimerCountdown = '';

    this.bidTimer.pipe(takeUntil(this.destroyBid)).subscribe(async () => {
      if (!this.expiredAt) {
        return;
      }

      const difference = moment.duration(moment(this.expiredAt).diff(moment()));

      this.bidTimerCountdown =
        ('0' + difference.minutes()).slice(-2) +
        ':' +
        ('0' + difference.seconds()).slice(-2);

      if (difference.asSeconds() <= 0) {
        this.destroyBid.next();
        this.destroyBid.complete();

        // If not progressing purchase or current selected method is crypto or current payment is crypto or the payment of the old sale (on reload) is crypto
        if (
          !this.isPurchaseProgressing ||
          this.paymentMethod === PaymentMethods.crypto ||
          this.payment?.source === PaymentMethods.crypto ||
          this.sale.bid?.payment?.source === PaymentMethods.crypto
        ) {
          try {
            await this.cancelBid();
          } catch (e) {
            this.sale = null;
            this.expiredAt = null;
            this.isSelectMethodsPeriod = false;
            this.isCardMethodCreating = false;
            this.isBidCancelled = true;
            this.cryptoPurchaseState = CryptoPurchaseState.InitiatingPurchase;
            console.log(e);
          }
          this.paymentFailed = false;
          this.isPaymentExpired = false;
          this.saleCancelled = false;
          this.saleFailed = false;
          this.isWalletRejected = false;
          this.isPurchaseProgressing = false;
          this.isSelectMethodsPeriod = false;
          this.isContinueCryptoPayment = false;
          this.isBidTimeout = true;
          this.isShowError = true;
          this.currentStep = Step.Collect;
          this.openErrorModal();
        }
      }
    });
  }

  // ----------- Submit payment -----------

  private startPaymentProgress() {
    if (!this.onDestroying) {
      this.stopPaymentProgress();
      this.destroyPaymentProgress = new Subject();
      this.paymentTimer = timer(0, 5 * 1000);
      this.paymentTimer
        .pipe(takeUntil(this.destroyPaymentProgress))
        .subscribe(() => {
          this.purchaseLoading(true);
        });
    }
  }
  private stopPaymentProgress() {
    if (this.destroyPaymentProgress) {
      this.destroyPaymentProgress.next(false);
      this.destroyPaymentProgress.complete();
    }
  }

  private startSaleProgress() {
    if (!this.onDestroying) {
      this.stopSaleProgress();
      this.destroySaleProgress = new Subject();
      this.saleTimer = timer(0, 5 * 1000);
      this.saleTimer.pipe(takeUntil(this.destroySaleProgress)).subscribe(() => {
        this.purchaseLoading(false);
      });
    }
  }
  private stopSaleProgress() {
    if (this.destroySaleProgress) {
      this.destroySaleProgress.next(false);
      this.destroySaleProgress.complete();
    }
  }

  private async purchaseLoading(paymentWatching?: boolean) {
    if (this.sale?.id || this.bid?.sale?.id) {
      try {
        this.sale = await this.shoppingService.getSale(
          this.sale?.id || this.bid?.sale?.id,
          [],
          this.web3Token,
          this.buyerAddress,
        );
        this.creditPurchaseState = CreditPurchaseState.WaitingForPaymentConfirm;
        if (paymentWatching && this.sale.bid?.payment) {
          this.payment = this.sale.bid.payment;
          this.paymentHandler();
        } else {
          this.saleHandler();
        }
      } catch (error) {
        this.creditPurchaseState = null;
        console.log(error);
        // Sentry.captureMessage('Payment: purchaseLoading error');
      }
    }
  }

  private paymentHandler() {
    const saleExpiredTime = new Date(this.sale.expiredAt).getTime();
    switch (this.sale.bid?.payment?.status as PaymentStatus) {
      case PaymentStatus.authorized: {
        this.cryptoPurchaseState = CryptoPurchaseState.PaymentConfirmation;
        this.stopPaymentProgress();
        this.startSaleProgress();
        break;
      }

      case PaymentStatus.succeeded: {
        if (this.paymentMethod === PaymentMethods.crypto) {
          this.cryptoPurchaseState = CryptoPurchaseState.PaymentComplete;
        }
        this.stopPaymentProgress();
        this.startSaleProgress();
        break;
      }

      case PaymentStatus.failed: {
        this.stopPaymentProgress();
        if (!this.isBidTimeout) {
          this.paymentFailed = true;
          this.isPurchaseProgressing = false;
        }
        this.isPurchaseProgressing = false;
        this.creditPurchaseState = null;
        break;
      }

      case PaymentStatus.require_action: {
        this.handle3DSecurePayment();
        this.stopPaymentProgress();
        this.startSaleProgress();
        break;
      }

      case PaymentStatus.processing:
      case PaymentStatus.submitted: {
        // Checking sale expired time to determine transaction failed
        if (Date.now() > saleExpiredTime) {
          this.sale.status = SaleStatus.canceled;
          this.isSelectMethodsPeriod = false;
          this.isPurchaseProgressing = false;
          if (!this.isBidTimeout) {
            this.isPaymentExpired = true;
          }
          this.stopPaymentProgress();
        }
        break;
      }

      default: {
        break;
      }
    }
  }

  private saleHandler() {
    if (this.isSaleCompleted) {
      return;
    }
    switch (this.sale.status) {
      case SaleStatus.submitted:
        {
          const saleExpiredTime = new Date(this.sale.expiredAt).getTime();
          if (Date.now() > saleExpiredTime) {
            this.sale.status = SaleStatus.canceled;
            this.isSelectMethodsPeriod = false;
            this.isPurchaseProgressing = false;
            if (!this.isBidTimeout) {
              this.isPaymentExpired = true;
            }
            this.stopSaleProgress();
          }
        }
        break;
      case SaleStatus.processing:
      case SaleStatus.succeeded:
        this.removeCurrentTxID();
        this.purchaseCompleted = true;
        this.isPurchaseProgressing = false;
        this.stopSaleProgress();
        this.cryptoPurchaseState = CryptoPurchaseState.SaleComplete;
        this.creditPurchaseState = CreditPurchaseState.PurchaseComplete;
        this.isShowPaymentProcessingModal = false;
        this.nextStep();
        break;
      case SaleStatus.canceled:
        this.stopSaleProgress();
        if (!this.isBidTimeout) {
          this.saleCancelled = true;
        }
        this.isPurchaseProgressing = false;
        break;
      case SaleStatus.failed:
        {
          const saleExpiredTime = new Date(this.sale.expiredAt).getTime();
          if (Date.now() < saleExpiredTime) {
            this.stopSaleProgress();
            if (!this.isBidTimeout) {
              this.saleFailed = true;
            }
            this.isPurchaseProgressing = false;
          } else {
            this.isSelectMethodsPeriod = true;
            this.initInputForm();
          }
        }
        break;
      default:
    }
  }

  private handleCreateBidError(error) {
    this.isCreateSaleProgressing = false;
    if (error['status'] === 401) {
      this.errorCode = ErrorCodes.NotLoggedIn;
      this.openErrorModal();
      return;
    }

    if (
      [
        ErrorCodes.PurchasingLimited,
        ErrorCodes.LimitOneActiveOrder,
        ErrorCodes.OrderCreationTooQuick,
        ErrorCodes.SaleNotFound,
        ErrorCodes.SaleIsNotReady,
        ErrorCodes.AllSaleSlotsOccupied,
        ErrorCodes.FirstSaleSoldOut,
        ErrorCodes.CanNotFindSlotInTime,
        ErrorCodes.NotLoggedIn,
        ErrorCodes.BidAskCreationNotPermitted,
        ErrorCodes.OrderNotReady,
        ErrorCodes.ArtworkNotReady,
        ErrorCodes.OperationIsNotPermitted,
        ErrorCodes.AuctionHasEnded,
        ErrorCodes.AuctionHasPaused,
      ].includes(error.error.error.code)
    ) {
      this.errorCode = error.error.error.code;
      this.openErrorModal();
      return;
    }

    this.errorCode = -1;
    this.openErrorModal();
  }

  public onCCStartCheckout() {
    this.setExpiryToCurrentSale();
  }

  // Stripe card payment
  public async createPlatformCardPayment(paymentMethodID: string) {
    if (paymentMethodID && this.bid) {
      this.sale = await this.shoppingService.getSale(
        this.sale?.id || this.bid?.sale?.id,
        [],
        this.web3Token,
        this.buyerAddress,
      );
      if (this.sale && this.sale.status === SaleStatus.submitted) {
        await this.submitCCPayment(paymentMethodID);
      }
    }
  }

  public async changeAddress() {
    const { result } = await this.autonomyIRL.getAddress(
      this.targetBlockchain,
      AUTONOMY_IRL_METADATA,
      null,
    );
    if (result && result !== this.buyerAddress) {
      this.cancelBid().catch((error) => {
        console.log(error);
      });
      this.web3Token = null;
      this.buyerAddress = result;
      await this.signMessage();
      await this.createBid();
    }
  }

  public async createNewBid() {
    try {
      this.closeErrorModal();
      this.isBidTimeout = false;
      this.web3Token = null;
      await this.signMessage();
      await this.createBid();
    } catch (error) {}
  }

  private setExpiryToCurrentSale() {
    this.expiredAt = this.sale?.expiredAt || this.bid?.sale?.expiredAt;
    this.startBidTimer();
  }

  private async setTimerExpiryToNewSale() {
    try {
      this.sale = await this.shoppingService.getSale(
        this.sale?.id || this.bid?.sale?.id,
        [],
        this.web3Token,
        this.buyerAddress,
      );
      this.expiredAt = this.sale.expiredAt;
      this.startBidTimer();
    } catch (e) {
      console.log(e);
    }
  }

  private async submitCCPayment(paymentMethodID: string) {
    if (!this.isPurchaseProgressing) {
      this.isPurchaseProgressing = true;
      this.creditPurchaseState = CreditPurchaseState.SendingPayment;
      this.isShowPaymentProcessingModal = true;
      this.openPaymentProcessingModal();
      const returnURL = window.location.href;
      const recipientAddress =
        this.inputRecipientForm.value || this.buyerAddress;

      try {
        const paymentResponse = await this.shoppingService.createPayment(
          PaymentMethods.card,
          this.bid.id,
          recipientAddress,
          paymentMethodID,
          returnURL,
          this.web3Token,
          this.buyerAddress,
        );
        this.payment = paymentResponse.payment;
        this.sale.bid.payment = this.payment;
        this.stopBidTimer();
        if (this.payment.status === (PaymentStatus.failed as string)) {
          this.isPurchaseProgressing = false;
          this.creditPurchaseState = null;
        } else {
          this.isCardMethodCreating = false;
          this.startPaymentProgress();
        }
      } catch (error) {
        this.isPurchaseProgressing = false;
        this.creditPurchaseState = null;
        if (error instanceof HttpErrorResponse) {
          switch (error.error.error.code) {
            case ErrorCodes.StripePaymentError:
            case ErrorCodes.StripePaymentConfirmFailed:
            case ErrorCodes.InvalidBillingDetail: {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              this.cardErrorCode = error.error?.error;
              break;
            }

            case ErrorCodes.OrderCancelled:
            case ErrorCodes.SaleBeingProcessed: {
              this.stopBidTimer();
              break;
            }

            case ErrorCodes.FailedPaymentCreation: {
              this.stopBidTimer();
              this.cardErrorCode = { error: 'unknown' };
              break;
            }

            case ErrorCodes.NotLoggedIn: {
              this.errorCode = ErrorCodes.NotLoggedIn;
              this.cardErrorCode = { error: 'unknown' };
              this.openErrorModal();
              break;
            }

            default: {
              break;
            }
          }
        }
      }
    }
  }

  private handle3DSecurePayment() {
    if (
      this.payment &&
      this.payment.status === PaymentStatus.require_action &&
      !this.isWaitingFor3DSecure
    ) {
      const redirectToURL = this.payment.metadata?.redirectToURL;
      if (redirectToURL) {
        this.isWaitingFor3DSecure = true;
        location.href = redirectToURL;
      } else {
        // To do: show error message but keep processing
        this.cardErrorCode['data']['code'] === ErrorCodes.StripeCardDeclined;
      }
    }
  }

  private backFrom3DSecure() {
    if (
      this.sale.bid?.payment?.status === PaymentStatus.require_action ||
      this.sale.bid?.payment?.metadata?.redirectToURL
    ) {
      this.location.replaceState(`collect/${this.sale.id}`);
    }
  }
  // end Stripe card payment

  private async initData() {
    try {
      this.quantity ||= 1;

      if (this.seriesID) {
        this.series = await this.seriesService.getSeriesDetail(this.seriesID, [
          'includeArtist',
          'includeExhibition',
        ]);

        this.exhibition = this.series?.exhibition;
        this.targetBlockchain = this.exhibition?.mintBlockchain;

        if (this.series?.settings?.initialSaleType === SaleType.single) {
          this.quantity = 1;
          this.isEditionSale = true;
        }

        this.price =
          (this.series?.settings?.basePrice || 0) * (this.quantity || 0);
      }

      this.paymentMethod = PaymentMethods.card;

      const message = await this.signMessage();
      if (message) {
        await this.createBid();
        await this.renderStripe();
        await this.createApplePayPaymentRequest();
      }
    } catch (error) {
      console.log(error);
    }
  }

  private async signMessage(): Promise<string> {
    try {
      if (
        this.web3Token &&
        this.signMessageTime?.getTime() > new Date().getTime() - 300000
      ) {
        return this.web3Token;
      }

      const message = await this.walletAppService.getAuthTransactionMessage(
        this.buyerAddress,
        this.series?.title,
      );

      let signedData: { result: string; errorMessage: string };

      signedData = (await this.autonomyIRL.signMessage(
        message,
        this.buyerAddress,
        this.autonomyIRL.chain.eth,
        AUTONOMY_IRL_METADATA,
      )) as { result: string; errorMessage: string };

      if (signedData.errorMessage) {
        this.isCreatingSale = false;
        this.errorCode = ErrorCodes.UserRejected;
        this.openErrorModal();
        return '';
      }

      if (signedData.result) {
        this.signMessageTime = new Date();
        this.web3Token = btoa(
          `${message}|${signedData?.result}|${this.buyerAddress}|FeralFile`,
        );
        return this.web3Token;
      } else {
        return '';
      }
    } catch (error) {
      this.errorCode = -1;
      this.openErrorModal();
      return '';
    }
  }

  private async renderStripe() {
    try {
      if (!this.stripe) {
        if (window.Stripe) {
          this.stripe = window.Stripe(`${environment.stripe_pk}`, {
            locale: 'en',
          });
        } else {
          this.stripe = await loadStripe(`${environment.stripe_pk}`, {
            locale: 'en',
          });
        }
      }
    } catch (error) {
      window.alert(error);
    }
  }

  private async createApplePayPaymentRequest() {
    try {
      let amount =
        this.cardPriceIncludeFee || this.sale?.metadata?.equivalentPrices?.USD;
      const appearance = {
        /* appearance */
      };
      const options = {
        /* options */
      };

      const elements = this.stripe.elements({
        mode: 'payment',
        amount: Number((amount * 100).toFixed(0)),
        currency: 'usd',
        appearance,
      });

      const expressCheckoutElement = elements.create(
        'expressCheckout',
        options,
      );
      expressCheckoutElement.mount('#express-checkout-element');
    } catch (error) {
      // Sentry.captureMessage(
      //   'Payment: createApplePayPaymentRequest error',
      //   error,
      // );

      this.errorCode = -1;
      this.openErrorModal();
    }
  }
}
