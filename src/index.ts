// Initialise the config
import uuid from 'uuid/v4';

import config from './config';
import Master from './master';
import Slave from './slave';
import PubSubRedis from './pubsub-redis';

export async function run() {
  const pubSubRedis = new PubSubRedis(config.redis);

  if (config.isSlave) {
    const slave = new Slave(pubSubRedis, config.redis);
    await slave.start();
    return;
  }

  const master = new Master(pubSubRedis, config.redis);
  await master.start();
  await sendFiboTasks(master);
}

async function sendFiboTasks(master: Master) {
  for (let n = 1; n <= 42; n++) {
    await master.sendTask({
      id: uuid(),
      type: 'FIBO',
      payload: {
        n,
      },
    });
  }
}

run().catch(e => {
  console.error(e);
});
