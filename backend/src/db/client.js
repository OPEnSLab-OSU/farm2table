import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB

if (!uri || !dbName) {
  throw new Error('MONGODB_URI and MONGODB_DB must be set in backend/.env')
}

// One client for the whole app. The driver pools connections internally,
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 })

let db = null

//ping db, and save
export const connect = async () => {
  if (db) return db
  await client.connect()
  db = client.db(dbName)
  await db.command({ ping: 1 })
  return db
}

//Give other files the Db
export const getDb = () => {
  if (!db) throw new Error('Database not connected. Call connect() first.')
  return db
}

//Is Db reachable
export const ping = () => getDb().command({ ping: 1 })

//Close Connection
export const close = () => client.close()
