type Config = {
  debug: boolean;
  isSlave: boolean;
  redis: {
    host: string;
    port: number;
    password: string;
    tasksQueue: string;
    resultsChannel: string;
    resultsList: string;
  };
};

export function readEnv(key: string): string {
  const value = process.env[key];
  if (value == null) {
    throw new Error(`"${key}" not found in environment`);
  }

  return value;
}

let config: Config = {
  debug: process.env.DEBUG === 'true',
  isSlave: readEnv('TYPE') === 'slave',
  redis: {
    host: readEnv('REDIS_HOST'),
    port: parseInt(readEnv('REDIS_PORT')),
    password: readEnv('REDIS_PASSWORD'),
    tasksQueue: readEnv('REDIS_TASKS_QUEUE'),
    resultsChannel: readEnv('REDIS_RESULTS_CHANNEL'),
    resultsList: readEnv('REDIS_RESULTS_LIST'),
  },
};

export default config;
