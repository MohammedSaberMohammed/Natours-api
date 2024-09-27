const dotenv = require('dotenv');
const { connectDB } = require('./db/connectDB');

dotenv.config();

const app = require('./app');

// Configs
const Port = process.env.PORT || 3000;

process.on('uncaughtException', (err, origin) => {
  console.log('Uncaught Exception at:', origin, 'reason:', err);

  process.exit(1);
});

async function start() {
  try {
    await connectDB();

    const server = app.listen(Port, () => {
      console.log(`App is listening on port ${Port}...`);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.log('Unhandled Rejection at:', promise, 'reason:', reason);

      server.close(() => {
        process.exit(1);
      });
    });
  } catch (error) {
    console.log(error);
  }
}

start();
