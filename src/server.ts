import colors from 'colors'; // Ensure correct import
import { createServer, Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './app/config';
import initializeSocketIO from './socketio';
import createDefaultAdmin from './app/DB/createDefaultAdmin';
import cronJob from './app/utils/cronJob';
import { logger } from './app/utils/logger';

let server: Server;
export const io = initializeSocketIO(createServer(app));

async function main() {
  try {

    const dbStartTime = Date.now();
    const loadingFrames = ["🌍", "🌎", "🌏"]; // Loader animation frames
    let frameIndex = 0;

    // Start the connecting animation
    const loader = setInterval(() => {
      process.stdout.write(
        `\rMongoDB connecting ${loadingFrames[frameIndex]} Please wait 😢`,
      );
      frameIndex = (frameIndex + 1) % loadingFrames.length;
    }, 300); // Update frame every 300ms

        // Connect to MongoDB with a timeout
    await mongoose.connect(config.database_url as string, {
      connectTimeoutMS: 10000, // 10 seconds timeout
    });


    // Stop the connecting animation
    clearInterval(loader);
    
    logger.info(`\r✅ Mongodb connected successfully in ${Date.now() - dbStartTime}ms`);

    createDefaultAdmin();
  
    // Initialize cron job (ensure it runs immediately)
    cronJob(); // Cron job will be scheduled and run here.

    // Start Express server
    // server = app.listen(Number(config.port), config.ip as string, () => {
    server = app.listen(Number(config.port), () => {
      console.log(
        colors.green(`---> Guide server is listening on  : http://${config.ip}:${config.port}`).bold,
      );
    });


    // Start Socket server
    io.listen(Number(config.socket_port));
    console.log(
      //@ts-ignore
      `---> Socket server is listening on : http://${config.ip}:${config.socket_port}`.yellow
        .bold,
    );


  } catch (err) {
    console.error('Error starting the server:', err);
    console.log(err);
  }
}

main();

// Graceful shutdown for unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled rejection detected: ${err}`);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1); // Ensure process exits
});

// Graceful shutdown for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Uncaught exception detected: ${err}`);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
});
