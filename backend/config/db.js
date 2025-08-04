import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        // Import the mongoose library
        const mongoose = await import('mongoose');

        // Check if MONGO_URI is defined
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI environment variable is not defined');
        }

        // Connect to the MongoDB database using the connection string from environment variables
        await mongoose.default.connect(process.env.MONGO_URI);

        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Exit the process with failure
    }
}
