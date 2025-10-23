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

test('connectDB should not create multiple connections if called again', async () => {
    const initialConnection = mongoose.connection;

    await connectDB();
    const newConnection = mongoose.connection;

    expect(newConnection).toBe(initialConnection);
    expect(mongoose.connection.readyState).toBe(1);
});


test('connectDB handles invalid URL and keeps connection closed', async () => {
    const originalUrl = process.env.MONGO_URL;
    process.env.MONGO_URL = "invalid-url";

    try {
        await connectDB();
    } catch (error) {
        // Expected to fail
    }

    expect(mongoose.connection.readyState).not.toBe(1);
    process.env.MONGO_URL = originalUrl;
});


test('connectDB should keep connection alive for multiple DB calls', async () => {
    const TestSchema = new mongoose.Schema({ name: String });
    const TestModel = mongoose.model('Test', TestSchema);

    await TestModel.create({ name: 'Alive' });
    const result = await TestModel.findOne({ name: 'Alive' });

    expect(result).not.toBeNull();
    expect(result.name).toBe('Alive');
});


test('DB should properly save and retrieve multiple documents after connection', async () => {
    const AnimalSchema = new mongoose.Schema({ type: String });
    const Animal = mongoose.model('Animal', AnimalSchema);

    await Animal.insertMany([{ type: 'cat' }, { type: 'dog' }]);

    const count = await Animal.countDocuments();
    expect(count).toBe(2);
});



test('disconnecting and reconnecting keeps DB functional', async () => {
    await mongoose.disconnect();
    expect(mongoose.connection.readyState).toBe(0);

    await connectDB();
    expect(mongoose.connection.readyState).toBe(1);

    const FoodSchema = new mongoose.Schema({ item: String });
    const Food = mongoose.model('Food', FoodSchema);

    await Food.create({ item: 'Pizza' });
    const found = await Food.findOne({ item: 'Pizza' });

    expect(found.item).toBe('Pizza');
});
