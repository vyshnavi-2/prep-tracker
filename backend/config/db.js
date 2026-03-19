const mongoose = require("mongoose");

const getMongoUri = () => {
  return process.env.MONGODB_URI || process.env.MONGO_URI;
};

const connectDB = async () => {
  const mongoUri = getMongoUri();

  if (!mongoUri) {
    throw new Error("MONGODB_URI or MONGO_URI is missing in the .env file");
  }

  const connection = await mongoose.connect(mongoUri);

  console.log(`MongoDB connected: ${connection.connection.host}`);
};

module.exports = connectDB;
