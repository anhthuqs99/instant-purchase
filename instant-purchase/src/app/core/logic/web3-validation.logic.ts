import { isAddress } from 'web3-validator';
import { validateAddress, ValidationResult } from '@taquito/utils';
import { Blockchain } from '@core/models';

export function isAddressValid(address: string, blockchain: Blockchain) {
  return blockchain === Blockchain.Ethereum
    ? isAddress(address)
    : validateAddress(address) === ValidationResult.VALID;
}

export function getAddressType(address: string): Blockchain {
  if (address.startsWith('tz')) {
    return Blockchain.Tezos;
  }

  if (address.startsWith('0x')) {
    return Blockchain.Ethereum;
  }

  if (address.startsWith('did:')) {
    return Blockchain.Autonomy;
  }

  return null;
}
