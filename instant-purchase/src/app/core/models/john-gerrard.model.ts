export interface BeforeMintingArtworkInfo {
  id: number;
  index: number;
  viewableAt: string;
  artworkTitle: string;
}

export enum AttributeTraitTypeLabel {
  'Number of rays' = 'Rays', // eslint-disable-line @typescript-eslint/naming-convention
  'Number of crystals' = 'Crystals', // eslint-disable-line @typescript-eslint/naming-convention
  'Robot colour' = 'Robot color', // eslint-disable-line @typescript-eslint/naming-convention
  Archetype = 'Archetype',
  Vibration = 'Vibration',
  Season = 'Season',
  'Crystalline day' = 'Crystalline Day', // eslint-disable-line @typescript-eslint/naming-convention
  'Crystalline month' = 'Crystalline Month', // eslint-disable-line @typescript-eslint/naming-convention
  'Gregorian day' = 'Gregorian Day', // eslint-disable-line @typescript-eslint/naming-convention
  'Gregorian month' = 'Gregorian Month', // eslint-disable-line @typescript-eslint/naming-convention
}

export class SeriesAttribute {
  traitType: AttributeTraitType;
  values: string[];
}

export enum AttributeTraitType {
  a = 'Archetype',
  gm = 'Gregorian month',
  gd = 'Gregorian day',
  c = 'Number of crystals',
  r = 'Number of rays',
  rc = 'Robot colour',
  s = 'Season',
  v = 'Vibration',
  cd = 'Crystalline day',
  cm = 'Crystalline month',
}

export enum AttributeQueryParametersKey {
  Archetype = 'a',
  'Gregorian month' = 'gm', // eslint-disable-line @typescript-eslint/naming-convention
  'Gregorian day' = 'gd', // eslint-disable-line @typescript-eslint/naming-convention
  'Number of crystals' = 'c', // eslint-disable-line @typescript-eslint/naming-convention
  'Number of rays' = 'r', // eslint-disable-line @typescript-eslint/naming-convention
  'Robot colour' = 'rc', // eslint-disable-line @typescript-eslint/naming-convention
  Season = 's',
  Vibration = 'v',
  'Crystalline day' = 'cd', // eslint-disable-line @typescript-eslint/naming-convention
  'Crystalline month' = 'cm', // eslint-disable-line @typescript-eslint/naming-convention
}

export const GregorianMonths = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const Season = ['Spring', 'Summer', 'Autumn', 'Winter'];

export enum ThumbnailVariantSuffix {
  xsmall = 'xsmall',
  small = 'small',
  medium = 'medium',
  large = 'large',
}

export enum ThumbnailSelector {
  small = 'small',
  medium = 'medium',
  large = 'large',
}

export enum PaginationItemVariant {
  small = 25,
  medium = 48,
  large = 96,
}
