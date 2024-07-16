export interface PageRequest {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: string;
  continuation?: string;
}

export interface PageResponse {
  continuation?: string;
  limit?: number;
  offset?: number;
}
