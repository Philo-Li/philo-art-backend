import dotenv from 'dotenv';
import { createApp } from './app.js';
import config from './config.js';
import createLogger from './utils/logger.js';

dotenv.config();

const logger = createLogger();

const main = async () => {
  const app = await createApp();

  app.listen(config.port, () => {
    logger.info(`Server listening on port ${config.port}`);
    logger.info(`GraphQL endpoint: http://localhost:${config.port}/graphql`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
  });
};

main().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
