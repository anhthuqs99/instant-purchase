import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customCurrency',
})
export class CustomCurrencyPipe implements PipeTransform {
  transform(value: number, currency: string): string {
    let symbol = '';
    let maximumFractionDigits = 2;
    switch (currency.toUpperCase()) {
      case 'ETH':
      case 'WETH':
      case 'ETHEREUM': {
        symbol = 'Ξ';
        maximumFractionDigits = 6;
        break;
      }

      case 'USD':
      case 'USDC': {
        symbol = '$';
        break;
      }

      case 'XTZ':
      case 'TEZOS': {
        symbol = 'ꜩ';
        maximumFractionDigits = 6;
        break;
      }

      default: {
        return '';
      }
    }

    return `${symbol} ${value.toLocaleString(undefined, {
      maximumFractionDigits,
    })}`;
  }
}
