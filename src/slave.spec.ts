import PubSubRedis from './pubsub-redis';
import Slave from './slave';
import { FiboTask } from './types';
import { process } from './processor';

jest.mock('./pubsub-redis');
jest.mock('./processor');

const resultsChannel = 'results-channel';
const tasksQueue = 'tasks-queue';

describe('Slave', () => {
  let slave: Slave;
  let mockPubSubRedis: PubSubRedis;

  beforeEach(() => {
    jest.resetAllMocks();

    mockPubSubRedis = new PubSubRedis({
      host: 'host',
      port: 1234,
      password: 'pw',
    });
    slave = new Slave(mockPubSubRedis, {
      resultsChannel,
      tasksQueue,
    });
  });

  describe('start', () => {
    it('immediately tries to process a task', async () => {
      // cast to any as tryProcessTask is a private method
      const tryProcessTaskSpy = jest.spyOn(slave as any, 'tryProcessTask');
      await slave.start();

      expect(tryProcessTaskSpy).toHaveBeenCalled();
    });
  });

  describe('stop', () => {
    it('disconnects the pubsub redis client', async () => {
      await slave.stop();

      expect(mockPubSubRedis.disconnect).toHaveBeenCalled();
    });
  });

  describe('tryProcessTask', () => {
    it('does nothing if a task is in progress inside the worker', async () => {
      slave.taskInProgress = true;

      await (slave as any).tryProcessTask();
      expect(mockPubSubRedis.pop).not.toHaveBeenCalled();
    });

    it('pops the tasks queue', async () => {
      await (slave as any).tryProcessTask();
      expect(mockPubSubRedis.pop).toHaveBeenCalled();
    });

    it('parses the task message JSON and processes the task if one is found in the queue', async () => {
      const taskMessage: string = '"some-task"';

      const processTaskSpy = jest.spyOn(slave as any, 'processTask');
      processTaskSpy.mockImplementation(() => null);

      (mockPubSubRedis.pop as jest.Mock).mockResolvedValue(taskMessage);

      await (slave as any).tryProcessTask();
      expect(processTaskSpy).toHaveBeenCalled();
    });

    it('schedules a new try to process a task if no task was found in the queue', async () => {
      const processTaskSpy = jest.spyOn(slave as any, 'processTask');
      processTaskSpy.mockImplementation(() => null);

      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
      setTimeoutSpy.mockImplementation(() => null as any);

      (mockPubSubRedis.pop as jest.Mock).mockResolvedValue(null);

      await (slave as any).tryProcessTask();
      expect(processTaskSpy).not.toHaveBeenCalled();
      expect(setTimeoutSpy).toHaveBeenCalled();
    });
  });

  describe('processTask', () => {
    const task: FiboTask = {
      id: 'some-task-id',
      payload: { n: 7 },
      type: 'FIBO',
    };

    it('calls the processor with the received task', async () => {
      await (slave as any).processTask(task);
      expect(process).toHaveBeenCalledWith(task);
    });

    it('sends the processing result', async () => {
      const result = 'some-result';
      const sendResultSpy = jest.spyOn(slave as any, 'sendResult');

      (process as jest.Mock).mockResolvedValue(result);

      await (slave as any).processTask(task);
      expect(sendResultSpy).toHaveBeenCalledWith(result);
    });

    it('schedules a new check for tasks', async () => {
      const setImmediateSpy = jest.spyOn(global, 'setImmediate');

      await (slave as any).processTask(task);
      expect(setImmediateSpy).toHaveBeenCalled();
    });
  });

  describe('sendResult', () => {
    it('pusblishes the stringified result on the results channel', async () => {
      const result = 'some-result';
      await (slave as any).sendResult(result);

      expect(mockPubSubRedis.publish).toHaveBeenCalledWith(
        resultsChannel,
        JSON.stringify(result),
      );
    });
  });
});
