import PubSubRedis from './pubsub-redis';
import { Task, CompletedTask } from './types';

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
    await this.pubSubRedis.disconnect();
  }

  async sendTask(task: Task) {
    const { tasksQueue } = this.config;

    console.log(`SENDING TASK ${task.id}`);

    // publish task
    await this.pubSubRedis.push(tasksQueue, JSON.stringify(task));

    // maybe store the task in Redis for future reference?
    // definitely needed for serial execution
  }

  private async onResult(result: CompletedTask) {
    const { resultsList } = this.config;

    console.log(`Got result:`);
    console.log(JSON.stringify(result, undefined, 2));
    console.log(`===========`);

    await this.pubSubRedis.push(resultsList, JSON.stringify(result));
  }
}

export default Master;
