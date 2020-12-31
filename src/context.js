import knex from 'knex';
import { knexSnakeCaseMappers } from 'objection';

import createLogger from './utils/logger';
// eslint-disable-next-line import/no-named-as-default
import bindModels from './models';

const createContext = ({ config }) => {
  const db = knex({
    ...config.database,
    ...knexSnakeCaseMappers(),
  });

  return {
    db,
    models: bindModels(db),
    logger: createLogger(),
  };
};

export default createContext;
