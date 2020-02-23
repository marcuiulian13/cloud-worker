import PubSubRedis from './pubsub-redis';
import { Task, CompletedTask } from './types';
import { process } from './processor';

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
    await this.tryProcessTask();
  }

  async stop() {
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

    console.log(`Processing task:`);
    console.log(JSON.stringify(task, undefined, 2));

    // do task
    const result = await process(task);
    await this.sendResult(result);

    this.taskInProgress = false;

    console.log(`DONE`);
    console.log(`================`);

    // resume consuming tasks
    setImmediate(() => {
      this.tryProcessTask();
    });
  }

  private async sendResult(result: CompletedTask) {
    const { resultsChannel } = this.config;

    await this.pubSubRedis.publish(resultsChannel, JSON.stringify(result));
  }
}

export default Slave;
