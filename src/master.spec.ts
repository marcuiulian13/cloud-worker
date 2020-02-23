import PubSubRedis from './pubsub-redis';
import Master from './master';
import { Task, FiboTask, CompletedTask } from './types';

jest.mock('./pubsub-redis');

const resultsChannel = 'results-channel';
const resultsList = 'results-list';
const tasksQueue = 'tasks-queue';

describe('Master', () => {
  let master: Master;
  let mockPubSubRedis: PubSubRedis;

  beforeEach(() => {
    jest.resetAllMocks();

    mockPubSubRedis = new PubSubRedis({
      host: 'host',
      port: 1234,
      password: 'pw',
    });
    master = new Master(mockPubSubRedis, {
      resultsChannel,
      resultsList,
      tasksQueue,
    });
  });

  describe('start', () => {
    it('subscribes to the results pub-sub channel and adds messages listener', async () => {
      await master.start();

      expect(mockPubSubRedis.subscribe).toHaveBeenCalledWith(resultsChannel);
      expect(mockPubSubRedis.onMessage).toHaveBeenCalled();
    });
  });

  describe('stop', () => {
    it('disconnects the pubsub redis client', async () => {
      await master.stop();

      expect(mockPubSubRedis.disconnect).toHaveBeenCalled();
    });
  });

  describe('sendTask', () => {
    it('adds the stringified task to the tasks queue', async () => {
      const task: FiboTask = {
        id: 'some-task-id',
        payload: {
          n: 100,
        },
        type: 'FIBO',
      };

      await master.sendTask(task);

      expect(mockPubSubRedis.push).toHaveBeenCalledWith(
        tasksQueue,
        JSON.stringify(task),
      );
    });
  });

  describe('onResult', () => {
    it('pushes the stringified completed task to the results list', async () => {
      const completedTask: CompletedTask = {
        id: 'some-task-id',
        payload: {
          n: 7,
        },
        type: 'FIBO',
        result: {
          value: 13,
        },
      };

      // need to cast to any because onResult is private
      await (master as any).onResult(completedTask);

      expect(mockPubSubRedis.push).toHaveBeenCalledWith(
        resultsList,
        JSON.stringify(completedTask),
      );
    });
  });
});
