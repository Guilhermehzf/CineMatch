require('dotenv').config();
const { MongoClient } = require('mongodb');
const MongoStore = require('connect-mongo');

const url = process.env.dbUrl;
const dbName = process.env.dbName;

let client;

const connectToDatabase = async () => {
    if (client && client.isConnected && client.isConnected()) {
        return client.db(dbName);
    }
    try {
        client = new MongoClient(url);
        await client.connect();
        console.log('Conectado ao MongoDB');
        return client.db(dbName);
    } catch (err) {
        console.error('Erro ao conectar ao MongoDB:', err);
        throw err;
    }
};

const getClient = () => client;

const createMongoStore = () => {
    return MongoStore.create({
        mongoUrl: url,
        dbName: dbName,
        collectionName: 'Sessions',
    });
};

module.exports = { connectToDatabase, getClient, createMongoStore };