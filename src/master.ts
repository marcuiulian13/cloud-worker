import PubSubRedis from './pubsub-redis';
import { Task, CompletedTask } from './types';
import logger from './logger';

export type MasterConfig = {
  tasksQueue: string;
  resultsChannel: string;
  resultsList: string;
};

class Master {
  config: MasterConfig;
  pubSubRedis: PubSubRedis;

  constructor(pubSubRedis: PubSubRedis, config: MasterConfig) {
    this.pubSubRedis = pubSubRedis;
    this.config = config;
  }

  async start() {
    logger.info('Starting master');

    const { resultsChannel } = this.config;

    // this might fail or not subscribe to all channels
    await this.pubSubRedis.subscribe(resultsChannel);

    this.pubSubRedis.onMessage((channel, message) => {
      if (channel === resultsChannel) {
        this.onResult(JSON.parse(message));
      }
    });
  }

  async stop() {
    logger.info('Stopping master');
    await this.pubSubRedis.disconnect();
  }

  async sendTask(task: Task) {
    logger.info(`Sending task "${task.id}"`);
    logger.debug(JSON.stringify(task));

    const { tasksQueue } = this.config;

    // publish task
    await this.pubSubRedis.push(tasksQueue, JSON.stringify(task));

    // maybe store the task in Redis for future reference?
    // definitely needed for serial execution
  }

  private async onResult(result: CompletedTask) {
    logger.info(`Got result for task "${result.id}"`);
    logger.debug(JSON.stringify(result));

    const { resultsList } = this.config;

    await this.pubSubRedis.push(resultsList, JSON.stringify(result));
  }
}

export default Master;
