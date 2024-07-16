export enum UploadStatus {
  received = 'received',
  processing = 'processing',
  succeeded = 'succeeded',
  failed = 'failed',
}

export interface ArtworkMedia {
  thumbnailUrl?: string;
  previewUrl?: string;
  thumbnailProcess?: number;
  previewProcess?: number;
  sourceProcess?: number;
  isPreparingThumbnailFile?: boolean;
  isPreparingPreviewFile?: boolean;
  isPreparingSourceFile?: boolean;
  index?: number;
  name?: string;
  category?: string;
}

export interface FileExtended extends File {
  sourceType?: string;
  artworkIndex?: number;
}

export enum SubFolders {
  source = 'artwork',
  preview = 'artwork_web',
  thumbnail = 'artwork_thumbnail',
}

export interface UploadSeries {
  name: string;
  size: number;
  md5: string;
  sourceType: string;
  artworkIndex: number;
}
