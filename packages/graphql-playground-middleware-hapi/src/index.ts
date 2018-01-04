import { Server } from 'hapi'
import {
  MiddlewareOptions,
  RenderPageOptions,
  renderPlaygroundPage,
} from 'graphql-playground-html'

// tslint:disable-next-line
const pkg = require('../package.json')

export interface Register {
  (server: Server, options: MiddlewareOptions): void
}

export interface Plugin {
  pkg?: any
  register: Register
}

// tslint:disable-next-line only-arrow-functions
const plugin: Plugin = {
  pkg,
  register: function (server, options: any) {
    if (arguments.length !== 2) {
      throw new Error(
        `Playground middleware expects exactly 2 arguments, got ${
          arguments.length
        }`,
      )
    }

    const { path, route: config = {}, ...rest } = options

    const middlewareOptions: RenderPageOptions = {
      ...rest,
      version: '1.3.6' || pkg.version,
    }

    server.route({
      method: 'GET',
      path,
      config,
      handler: async (request, h) => h.response(await renderPlaygroundPage(middlewareOptions)).type('text/html')
    })
  }
}

export default plugin
