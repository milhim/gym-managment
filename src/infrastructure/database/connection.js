const mongoose = require('mongoose');

class DatabaseConnection {
    constructor() {
        this.connection = null;
    }

    async connect() {
        try {
            const mongoUri = process.env.MONGODB_URI;
            const dbName = process.env.DATABASE_NAME;

            if (!mongoUri) {
                throw new Error('MONGODB_URI is not defined in environment variables');
            }

            const options = {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                dbName: dbName
            };

            this.connection = await mongoose.connect(mongoUri, options);

            console.log('Connected to MongoDB successfully');
            console.log(`Database: ${dbName}`);

            return this.connection;
        } catch (error) {
            console.error('MongoDB connection error:', error);
            throw error;
        }
    }

    async disconnect() {
        if (this.connection) {
            await mongoose.disconnect();
            console.log('Disconnected from MongoDB');
        }
    }

    getConnection() {
        return this.connection;
    }
}

module.exports = new DatabaseConnection(); 