const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const MONGO_URI = process.env.DATABASE.replace(
      '<PASSWORD>',
      process.env.DATABASE_PASSWORD,
    );

    await mongoose.connect(MONGO_URI, { autoIndex: true });
    console.log(`MongoDB Connected Successfully`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB };
