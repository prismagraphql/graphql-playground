
export type Endpoint = 'SIMPLE' | 'RELAY'
export type Viewer = 'ADMIN' | 'EVERYONE' | 'USER'

export interface Session {
  id: string

  query: string
  variables: string
  // result: string
  operationName?: string
  subscriptionActive: boolean

  // additional props that are interactive in graphiql, these are not represented in graphiqls state
  selectedEndpoint: Endpoint
  selectedViewer: Viewer
  queryTypes: QueryTypes
  starred?: boolean
  date: Date
}

export interface QueryTypes {
  firstOperationName: string | null
  subscription: boolean
  query: boolean
  mutation: boolean
}

export type HistoryFilter = 'HISTORY' | 'STARRED'
