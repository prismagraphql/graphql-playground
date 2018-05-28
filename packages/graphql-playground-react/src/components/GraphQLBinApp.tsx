import * as React from 'react'
import { Provider, connect } from 'react-redux'
import createStore from '../state/createStore'
import 'isomorphic-fetch'
import EndpointPopup from './EndpointPopup'
import { ThemeProvider, theme as styledTheme } from '../styled'
import { Store } from 'redux'
import PlaygroundWrapper from './PlaygroundWrapper'
import { injectState } from '../state/workspace/actions'

export const store: Store<any> = createStore()

function getParameterByName(name: string): string {
  const url = window.location.href
  name = name.replace(/[\[\]]/g, '\\$&')
  const regexa = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
  const results = regexa.exec(url)
  if (!results || !results[2]) {
    return ''
  }
  return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

export interface Props {
  endpoint?: string
  subscriptionEndpoint?: string
  history?: any
  match?: any
}

export interface State {
  endpoint?: string
  subscriptionEndpoint?: string
  query?: string
  shareUrl?: string
  loading: boolean
}

export interface ReduxProps {
  injectState: (state: any) => void
}

class GraphQLBinApp extends React.Component<Props & ReduxProps, State> {
  constructor(props: Props & ReduxProps) {
    super(props)

    this.state = {
      endpoint: props.endpoint,
      subscriptionEndpoint: props.subscriptionEndpoint,
      loading: false,
    }
  }

  componentWillMount() {
    if (this.props.match.params.id) {
      if (this.props.match.params.id === 'new') {
        return
      }
      this.setState({ loading: true })

      // DOM side-effect:
      // #loading-wrapper is a hardcoded DOM element in the HTML entrypoint
      const loadingWrapper = document.getElementById('loading-wrapper')

      if (loadingWrapper) {
        loadingWrapper.classList.remove('fadeOut')
      }

      setTimeout(() => {
        if (loadingWrapper) {
          loadingWrapper.remove()
        }
      }, 1000)

      fetch('https://api.graph.cool/simple/v1/cj81hi46q03c30196uxaswrz2', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query ($id: String!) {
              session(id: $id) {
                session
                endpoint
              }
            }
          `,
          variables: { id: this.props.match.params.id },
        }),
      })
        .then(res => res.json())
        .then(res => {
          if (loadingWrapper) {
            loadingWrapper.classList.add('fadeOut')
          }

          if (!res.data || res.data.session === null) {
            location.href = `${location.origin}/v2/new`
          }
          const state = JSON.parse(res.data.session.session)
          this.props.injectState(state)
          this.setState({
            endpoint: res.data.session.endpoint,
            loading: false,
          })
        })
    }
  }

  render() {
    let { endpoint, subscriptionEndpoint, query } = this.state
    // If no  endpoint passed tries to get one from url
    if (!query) {
      query = getParameterByName('query')
    }
    if (!endpoint) {
      endpoint = getParameterByName('endpoint')
    }
    if (!subscriptionEndpoint) {
      subscriptionEndpoint = getParameterByName('subscription')
    }

    return (
      <div className={'wrapper'}>
        <style jsx={true}>{`
          .wrapper {
            @p: .w100, .h100;
          }
          .loading {
            @p: .f20, .white, .flex, .w100, .h100, .bgDarkBlue, .itemsCenter,
              .justifyCenter;
          }
        `}</style>

        {this.state.loading ? null : !this.state.endpoint ||
        this.state.endpoint.length === 0 ? (
          <ThemeProvider theme={styledTheme}>
            <EndpointPopup
              onRequestClose={this.handleChangeEndpoint}
              endpoint={this.state.endpoint || ''}
            />
          </ThemeProvider>
        ) : (
          <PlaygroundWrapper
            endpoint={endpoint}
            subscriptionEndpoint={subscriptionEndpoint}
            query={query}
          />
        )}
      </div>
    )
  }

  private handleChangeEndpoint = endpoint => {
    this.setState({ endpoint })
    localStorage.setItem('last-endpoint', endpoint)
  }
}

const ConnectedGraphQLBinApp = connect(null, { injectState })(GraphQLBinApp)

// tslint:disable
export default class GraphQLBinAppHOC extends React.Component<Props> {
  render() {
    return (
      <Provider store={store}>
        <ConnectedGraphQLBinApp {...this.props} />
      </Provider>
    )
  }
}
