import { server as _server } from '@hapi/hapi'
import ClientError from './exceptions/ClientError.js'
import albums from './api/albums/index.js'
import config from './utils/config.js'

const init = async () => {
  const server = _server({
    host: config.app.host,
    port: config.app.port,
    routes: {
      cors: {
        origin: ['*']
      }
    }
  })

  await server.register([
    albums,
    songs
  ])

  server.ext('onPreResponse', (request, h) => {
    const { response } = request

    if (response instanceof Error) {
      let errRes = {}
      let errCode = 500

      if (response instanceof ClientError) {
        errCode = response.statusCode ?? 400
        errRes = {
          status: 'fail',
          message: response.message
        }
      } else if (!response.isServer) {
        errCode = response.output.statusCode ?? 400
        errRes = {
          status: 'fail',
          message: response.message
        }
      } else {
        errRes = {
          status: 'error',
          message: 'Server Cannot Process Your Request!'
        }
        if (config.app.env === 'development') {
          console.log(response.stack)
          errRes.data = response.message
        }
      }

      return h.response(errRes).code(errCode)
    }

    return h.continue
  })

  await server.start()
  console.log('Server running on %s', server.info.uri)
}

init()
