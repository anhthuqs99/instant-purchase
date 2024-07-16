import { Blockchain } from '.';
import { TokenIndexer } from './series.model';

export interface IndexerCollection {
  id?: string;
  artistURL?: string;
  blockchain?: Blockchain;
  description?: string;
  externalID?: string;
  contracts?: string[];
  imageURL?: string;
  thumbnailURL?: string;
  items?: number;
  name?: string;
  owner?: string;
  published?: boolean;
  source?: string;
  sourceURL?: string;
  projectURL?: string;
  createdAt?: string;
}

export interface IndexerCollections {
  collections: IndexerCollection[];
}

export interface IndexerTokens {
  tokens: TokenIndexer[];
}
