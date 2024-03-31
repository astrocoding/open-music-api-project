import * as dotenv from 'dotenv'

dotenv.config()

const config = {
  app: {
    env: process.env.NODE_ENV || 'development',
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 8080
  }
}

export default config
