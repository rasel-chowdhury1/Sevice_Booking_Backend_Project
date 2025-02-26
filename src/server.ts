import colors from 'colors'; // Ensure correct import
import { createServer, Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './app/config';
import initializeSocketIO from './socketio';
import createDefaultAdmin from './app/DB/createDefaultAdmin';

let server: Server;
export const io = initializeSocketIO(createServer(app));

async function main() {
  try {
    // Connect to MongoDB
    const result = await mongoose.connect(config.database_url as string);

    createDefaultAdmin();

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
