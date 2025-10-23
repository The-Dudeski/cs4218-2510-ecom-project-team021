import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import connectDB from './db.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URL = mongoServer.getUri();
  await connectDB();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test('connectDB should connect successfully', async () => {
  expect(mongoose.connection.readyState).toBe(1); // 1 = connected
});

test('should reconnect successfully after disconnect', async () => {
  await mongoose.disconnect();
  expect(mongoose.connection.readyState).toBe(0); // 0 = disconnected

  process.env.MONGO_URL = mongoServer.getUri();
  await connectDB();

  expect(mongoose.connection.readyState).toBe(1); // back to connected
});
