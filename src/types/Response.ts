export interface ResponseOK<T> {
  status: string
  data: T
}

export interface AccessTokenResponse<T> extends ResponseOK<T> {
  access_token: string
}

export interface PaginatedResponse<T> extends ResponseOK<T> {
  _metadata: {
    total: number
    length: number
    page: number
    limit: number
  }
}

export interface ResponseKO {
  message: string
  error: string
  statusCode: number
}
