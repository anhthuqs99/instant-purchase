import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CreditPurchaseState } from '@core/services';
import { environment } from '@environment';
import { ErrorCodes } from '@shared/constants';
import { loadStripe } from '@stripe/stripe-js/pure';

@Component({
  selector: 'app-pay-with-card',
  templateUrl: './pay-with-card.component.html',
  styleUrls: ['./pay-with-card.component.scss'],
})
export class PayWithCardComponent {
  @Input() error: Record<string, string | object>;
  @Input() formDisabled: boolean;
  @Output() checkoutStart = new EventEmitter<void>();
  @Output() paymentMethodID = new EventEmitter<string>();
  @Output() cancelPurchasing = new EventEmitter<boolean>();

  // auction
  @Input() biddingOnAuc: boolean;

  @ViewChild('cardErrors') public cardErrors: ElementRef;
  @ViewChild('cardExpiryErr') public cardExpiryErr: ElementRef;
  @ViewChild('cardCvcErr') public cardCvcErr: ElementRef;
  @ViewChild('cardNameErr') public cardNameErr: ElementRef;

  isCardDeclined: boolean;
  // eslint-disable-next-line
  stripe: any; // from stripe card element
  // eslint-disable-next-line
  card: any; // from stripe card element
  // eslint-disable-next-line
  cardNumberEl: any; // from stripe card element
  // eslint-disable-next-line
  cardExpiryEl: any; // from stripe card element
  // eslint-disable-next-line
  cardCvcEl: any; // from stripe card element
  CreditPurchaseState = CreditPurchaseState;
  creditPurchaseState: CreditPurchaseState;
  hasSubmittedPayment: boolean;
  isMobileBreak: boolean;

  public creditCardFormGroup: FormGroup<{
    cardName: FormControl<string>;
  }>;
  stripePaymentID: string;

  isCardNumberError: boolean;
  isCardExpiryError: boolean;
  isCardCvcError: boolean;

  constructor() {
    this.initData();
    this.renderStripe();
  }

  ngAfterViewInit() {
    this.isMobileBreak = window.innerWidth <= 768;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes['error']?.currentValue) {
      this.cardErrorHandler();
      this.formDisabled = false;
      this.cardFormDisabledToggle();
    }
    if (changes && changes['formDisabled']?.currentValue) {
      this.cardFormDisabledToggle();
    }
  }

  public cancel() {
    this.cancelPurchasing.emit(true);
  }

  public checkout() {
    if (!this.hasSubmittedPayment) {
      this.creditPurchaseState = CreditPurchaseState.InitiatingPurchase;
      if (!this.cardErrors.nativeElement.textContent) {
        this.createPaymentMethod();
      } else {
        this.creditPurchaseState = null;
      }
    }
  }

  private initData() {
    this.creditCardFormGroup = new FormGroup({
      cardName: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^[a-zA-Z\s]*$/),
      ]),
    });

    this.creditCardFormGroup.valueChanges.subscribe(() => {
      if (
        this.isCardCvcError ||
        this.isCardExpiryError ||
        this.isCardNumberError
      ) {
        this.creditCardFormGroup.setErrors({ invalid: true });
      } else {
        this.creditCardFormGroup.setErrors(null);
      }
    });
  }

  private createPaymentMethod() {
    if (!this.hasSubmittedPayment && this.creditCardFormGroup.valid) {
      this.checkoutStart.emit();
      this.creditPurchaseState = CreditPurchaseState.SendingPayment;
      this.hasSubmittedPayment = true;
      this.stripe
        .createPaymentMethod({
          type: 'card',
          card: this.cardNumberEl,
          billing_details: {
            name: this.creditCardFormGroup.get('cardName')?.value,
            address: {
              city: this.creditCardFormGroup.get('city')?.value,
              line1: this.creditCardFormGroup.get('address')?.value,
              postal_code: this.creditCardFormGroup.get('postalCode')?.value,
            },
          },
        })
        .then((result) => {
          if (result.error) {
            this.hasSubmittedPayment = false;
            this.cardErrors.nativeElement.textContent = result.error.message;
            this.isCardNumberError = true;
            this.creditPurchaseState = null;
          } else {
            this.stripePaymentID = result.paymentMethod.id;
            this.creditPurchaseState =
              CreditPurchaseState.WaitingForPaymentConfirm;
            this.paymentMethodID.emit(this.stripePaymentID);
            this.cardFormDisabledToggle();
          }
        });
    }
  }

  private cardErrorHandler() {
    switch (this.error['code'] as ErrorCodes) {
      case ErrorCodes.StripePaymentError:
        // Show error to your customer (e.g., insufficient funds)
        this.cardErrors.nativeElement.textContent =
          this.error['data'] && this.error['data']['message'];
        if (
          this.error['data'] &&
          this.error['data']['code'] === ErrorCodes.StripeCardDeclined
        ) {
          this.isCardDeclined = true;
        }
        break;
      case ErrorCodes.StripePaymentConfirmFailed:
      case ErrorCodes.InvalidBillingDetail:
        this.cardErrors.nativeElement.textContent = this.error['message'];
        break;
      default:
        this.cardErrors.nativeElement.textContent = 'Unknown error';
        break;
    }
    this.isCardNumberError = true;
    this.hasSubmittedPayment = false;
    this.creditPurchaseState = null;
  }

  private cardFormDisabledToggle() {
    this.cardNumberEl?.update({
      disabled: this.formDisabled,
    });
    this.cardCvcEl?.update({
      disabled: this.formDisabled,
    });
    this.cardExpiryEl?.update({
      disabled: this.formDisabled,
    });
    if (this.formDisabled) {
      this.creditCardFormGroup?.disable();
    } else {
      this.creditCardFormGroup?.enable();
    }
  }

  // render Stripe element
  private renderStripe() {
    (async () => {
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

      const style = {
        base: {
          color: '#000000',
          fontFamily: 'PP Mori, Helvetica, sans-serif',
          fontSmoothing: 'antialiased',
          fontSize: '14px',
          '::placeholder': {
            color: '#B7B7B7',
          },
        },
        invalid: {
          color: '#000000',
          iconColor: '#000000',
        },
      };

      const classes = { base: 'StripeElement' };

      if (!this.cardNumberEl) {
        const elements = await this.stripe.elements();
        this.cardNumberEl = elements.create('cardNumber', {
          style,
          classes: classes,
          showIcon: true,
        });
        this.cardCvcEl = elements.create('cardCvc', { style });
        this.cardExpiryEl = elements.create('cardExpiry', { style });
      }

      if (this.cardNumberEl && document.getElementById('card-number-el')) {
        this.cardNumberEl.mount('#card-number-el');

        this.cardNumberEl.on('change', ({ error }) => {
          if (error) {
            this.isCardNumberError = true;
            this.cardErrors.nativeElement.textContent = error.message;
          } else {
            this.isCardNumberError = false;
            this.cardErrors.nativeElement.textContent = '';
          }
          this.isCardDeclined = false;
        });
      }

      if (this.cardCvcEl && document.getElementById('card-cvc-el')) {
        this.cardCvcEl.mount('#card-cvc-el');
        this.cardCvcEl.on('change', ({ error }) => {
          if (error) {
            this.isCardCvcError = true;
            this.cardCvcErr.nativeElement.textContent = error.message;
          } else {
            this.isCardCvcError = false;
            this.cardCvcErr.nativeElement.textContent = '';
          }
        });
      }

      if (this.cardExpiryEl && document.getElementById('card-expiry-el')) {
        this.cardExpiryEl.mount('#card-expiry-el');

        this.cardExpiryEl.on('change', ({ error }) => {
          if (error) {
            this.isCardExpiryError = true;
            this.cardExpiryErr.nativeElement.textContent = error.message;
          } else {
            this.isCardExpiryError = false;
            this.cardExpiryErr.nativeElement.textContent = '';
          }
        });
      }
    })();
  }
}
