import { nanoid } from 'nanoid'
import pkg from 'pg'
import NotFoundError from '../exceptions/NotFoundError.js'
import InvariantError from '../exceptions/InvariantError.js'

const { Pool } = pkg

class AlbumService {
  constructor () {
    this._pool = new Pool()
  }

  async addAlbum (data) {
    const id = 'album-' + nanoid(16)
    const { name, year } = data
    const date = new Date().toISOString()

    const queryString = `INSERT INTO albums VALUES('${id}', '${name}', ${year}, '${date}', '${date}') RETURNING id`

    const result = await this._pool.query(queryString)

    if (!result.rows[0].id) {
      throw new InvariantError('Cannot add an Album')
    }
    return result.rows[0].id
  }

  async getAlbumById (id) {
    const queryAlbum = `SELECT id, name, year FROM albums WHERE id = '${id}'`

    const { rows, rowCount } = await this._pool.query(queryAlbum)

    if (!rowCount) {
      throw new NotFoundError('Album not found')
    }

    const querySong = `SELECT s.id, s.title, s.performer FROM albums JOIN songs s ON albums.id = s.album_id WHERE albums.id = '${id}'`

    const { rows: songs } = await this._pool.query(querySong)

    return {
      album: {
        ...rows[0],
        songs
      }
    }
  }

  async editAlbumById (id, data) {
    const { name, year } = data
    const updatedAt = new Date().toISOString()

    const queryString = `UPDATE albums SET name = '${name}', year = '${year}', updated_at = '${updatedAt}' WHERE id = '${id}' RETURNING id`

    const result = await this._pool.query(queryString)

    if (!result.rowCount) {
      throw new NotFoundError('Failed. Album Id not found')
    }

    return true
  }

  async deleteAlbumById (id) {
    const queryString = `DELETE FROM albums WHERE id = '${id}' RETURNING id`
    const result = await this._pool.query(queryString)

    if (!result.rowCount) {
      throw new NotFoundError('Album Id not found')
    }

    return true
  }
};

export default AlbumService
