export interface ShortUrlEvent {
  body: string;
  requestContext: {
    domainName: string;
    stage: string;
  };
}

export interface RedirectUrlEvent {
  pathParameters: {
    shortId: string;
  };
}

export interface ShortUrlEventBody {
  url: string;
}

export interface RedirectUrlEventBody {
  shortId: string;
}

export interface UrlResponseHeaders {
  Location?: string;
}

export interface UrlResponse {
  statusCode: number;
  body: string;
  headers?: UrlResponseHeaders;
}

export interface PutItemResponse {
  status: 'success' | 'keyAlreadyExists' | 'error';
  message?: string;
}

export interface GetByOriginalUrlResponse {
  error: boolean;
  item: Record<string, any> | null;
}
