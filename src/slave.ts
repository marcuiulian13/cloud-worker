import PubSubRedis from './pubsub-redis';
import { Task, CompletedTask } from './types';
import { process } from './processor';
import logger from './logger';

export type SlaveConfig = {
  tasksQueue: string;
  resultsChannel: string;
};

class Slave {
  config: SlaveConfig;
  pubSubRedis: PubSubRedis;
  taskInProgress: boolean;

  constructor(pubSubRedis: PubSubRedis, config: SlaveConfig) {
    this.pubSubRedis = pubSubRedis;
    this.config = config;
    this.taskInProgress = false;
  }

  async start() {
    logger.info('Starting slave');
    await this.tryProcessTask();
  }

  async stop() {
    logger.info('Stopping slave');
    await this.pubSubRedis.disconnect();
  }

  private async tryProcessTask() {
    if (this.taskInProgress) {
      return;
    }

    const { tasksQueue } = this.config;
    const message = await this.pubSubRedis.pop(tasksQueue);

    if (message) {
      await this.processTask(JSON.parse(message));
    } else {
      setTimeout(() => {
        this.tryProcessTask();
      }, 100);
    }
  }

  private async processTask(task: Task) {
    this.taskInProgress = true;

    logger.info(`Processing task "${task.id}"`);
    logger.debug(JSON.stringify(task));

    // do task
    const result = await process(task);
    await this.sendResult(result);

    this.taskInProgress = false;

    // resume consuming tasks
    setImmediate(() => {
      this.tryProcessTask();
    });
  }

  private async sendResult(result: CompletedTask) {
    const { resultsChannel } = this.config;

    logger.info(`Sending result "${result.id}"`);
    logger.debug(JSON.stringify(result));

    await this.pubSubRedis.publish(resultsChannel, JSON.stringify(result));
  }
}

export default Slave;
