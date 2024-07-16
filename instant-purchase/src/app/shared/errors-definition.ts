import { ErrorCodes } from './constants';

export const ErrorsMessage = {
  [ErrorCodes.OrderCancelled]: {
    title: 'Payment has been canceled.',
    message: '',
  },
  [ErrorCodes.SaleBeingProcessed]: {
    title: 'Payment has been processed.',
    message: '',
  },
  [ErrorCodes.FailedPaymentCreation]: {
    title: 'Payment creation failed.',
    message: '',
  },
  [ErrorCodes.NotLoggedIn]: {
    title: 'You are not logged in.',
    message: '',
  },
  [ErrorCodes.PurchasingLimited]: {
    title: 'Purchasing limited.',
    message: '',
  },
  [ErrorCodes.LimitOneActiveOrder]: {
    title: 'Limit one active order.',
    message: '',
  },
  [ErrorCodes.OrderCreationTooQuick]: {
    title: 'Order creation too quick.',
    message: '',
  },
  [ErrorCodes.SaleNotFound]: {
    title: 'Sale not found.',
    message: '',
  },
  // Duplicated with ErrorCodes.BidAskNotCreationPermitted cause server define 2 different error codes for the same root cause
  [ErrorCodes.SaleIsNotReady]: {
    title: 'Sorry',
    message:
      'Another collector has just place an order for this set. Please select another set to collect.',
  },
  [ErrorCodes.AllSaleSlotsOccupied]: {
    title: 'All sale slots occupied.',
    message: '',
  },
  [ErrorCodes.FirstSaleSoldOut]: {
    title: 'First sale sold out.',
    message: '',
  },
  [ErrorCodes.CanNotFindSlotInTime]: {
    title: 'Cannot find slot in time.',
    message: '',
  },
  [ErrorCodes.BidAskCreationNotPermitted]: {
    title: 'Sorry.',
    message:
      'Another collector has just place an order for this set. Please select another set to collect.',
  },
  [ErrorCodes.OrderNotReady]: {
    title: 'Order is not ready.',
    message: '',
  },
  [ErrorCodes.ArtworkNotReady]: {
    title: 'Artworks are not ready.',
    message: '',
  },
  [ErrorCodes.OperationIsNotPermitted]: {
    title: 'Operation is not permitted.',
    message: '',
  },
  [ErrorCodes.WrongNetwork]: {
    title:
      'Please connect the <a class="light-link" href="https://app.feralfile.com/" target="_blank">Feral File app</a> or other {blockchain}-supporting wallet to collect.',
    message: ``,
  },
  [ErrorCodes.InternalServer]: {
    title:
      'Something went wrong...\nPlease contact the <a lass="light-link" href="https://feralfile.com/docs/contact" target="_blank">support team</a> for help.',
    message: '',
  },
  [ErrorCodes.OrderBundleCreationTooQuick]: {
    title: 'Please complete your previous transaction in order to collect.',
    message: '',
  },
  [ErrorCodes.UserRejected]: {
    title: '',
    message: 'User rejected',
  },
  [-1]: {
    title: 'Something went wrong...',
    message: '',
  },
};
