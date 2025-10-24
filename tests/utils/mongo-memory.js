import { MongoMemoryServer } from "mongodb-memory-server";
import odm, { connect as connectDB, disconnect as disconnectDB } from "../../config/mongoose.js";

let mongod;

export async function connectInMemory() {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await connectDB(uri);
}

export async function clearDatabase() {
  const { collections } = odm.connection;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
}

export async function closeInMemory() {
  await odm.connection.dropDatabase();
  await disconnectDB();
  if (mongod) await mongod.stop();
}
