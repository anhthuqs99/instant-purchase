import { Exhibition } from '.';

export enum PostType {
  Event = 'event',
  News = 'news',
  CloseUp = 'close-up',
  Schedule = 'schedule',
  WhitePaper = 'white-paper',
}

export enum PostMediaType {
  Image = 'image',
  Video = 'video',
}

export class Post {
  id?: string;
  exhibitionID?: string;
  type?: PostType;
  title?: string;
  content?: string;
  dateTime?: string;
  createdAt?: string;
  updatedAt?: string;
  displayIndex?: number;
  slug?: string;
  description?: string;
  author?: string;
  exhibition?: Exhibition;
  coverURI?: string;

  // Custom fields
  mediaType?: PostMediaType;
  thumbUrls?: string[];
  videoUrl?: string;
}
