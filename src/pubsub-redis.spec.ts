import ioredis from 'ioredis';

import PubSubRedis from './pubsub-redis';

jest.mock('ioredis');

describe('PubSubRedis', () => {
  let pubSubRedis: PubSubRedis;

  beforeEach(() => {
    jest.resetAllMocks();
    pubSubRedis = new PubSubRedis({ host: 'host', port: 1337, password: 'pw' });
  });

  describe('constructor', () => {
    it('creates 2 Redis clients', async () => {
      const mockIoredis = (ioredis as unknown) as jest.Mock;
      expect(mockIoredis.mock.instances.length).toBe(2);
    });
  });

  describe('push', () => {
    it('calls underlying publisher lpush method', async () => {
      const list = 'some-list';
      const message = 'some-message';
      const lpushSpy = jest.spyOn(pubSubRedis.pubRedis, 'lpush');

      await pubSubRedis.push(list, message);
      expect(lpushSpy).toHaveBeenCalledWith(list, message);
    });
  });

  describe('pop', () => {
    it('calls underlying publisher rpop method', async () => {
      const list = 'some-list';
      const rpopSpy = jest.spyOn(pubSubRedis.pubRedis, 'rpop');

      await pubSubRedis.pop(list);
      expect(rpopSpy).toHaveBeenCalledWith(list);
    });
  });

  describe('publish', () => {
    it('calls underlying publisher publish method', async () => {
      const channel = 'some-channel';
      const message = 'some-message';
      const publishSpy = jest.spyOn(pubSubRedis.pubRedis, 'publish');

      await pubSubRedis.publish(channel, message);
      expect(publishSpy).toHaveBeenCalledWith(channel, message);
    });
  });

  describe('subscribe', () => {
    it('calls underlying subscriber subscribe method', async () => {
      const channel = 'some-channel';
      const subscribeSpy = jest.spyOn(pubSubRedis.subRedis, 'subscribe');

      await pubSubRedis.subscribe(channel);
      expect(subscribeSpy).toHaveBeenCalledWith(channel);
    });
  });

  describe('unsubscribe', () => {
    it('calls underlying subscriber unsubscribe method with all the previously subscribed channels', async () => {
      const channels = ['some-channel', 'some-other-channel'];
      const unsubscribeSpy = jest.spyOn(pubSubRedis.subRedis, 'unsubscribe');

      await pubSubRedis.subscribe(channels[0]);
      await pubSubRedis.subscribe(channels[1]);

      await pubSubRedis.unsubscribe();
      expect(unsubscribeSpy).toHaveBeenCalledWith(...channels);
    });

    it('removes all underlying subscriber message listeners', async () => {
      const removeAllListenersSpy = jest.spyOn(
        pubSubRedis.subRedis,
        'removeAllListeners',
      );

      await pubSubRedis.unsubscribe();
      expect(removeAllListenersSpy).toHaveBeenCalledWith('message');
    });
  });

  describe('onMessage', () => {
    it('adds a message listener on the underlying subscriber with the provided callback', async () => {
      const onSpy = jest.spyOn(pubSubRedis.subRedis, 'on');

      const cb = (_channel: string, _message: string) => null;
      pubSubRedis.onMessage(cb);

      expect(onSpy).toHaveBeenCalledWith('message', cb);
    });
  });

  describe('disconnect', () => {
    it('disconnects both instances of Redis cient', () => {
      const pubDisconnectSpy = jest.spyOn(pubSubRedis.pubRedis, 'disconnect');
      const subDisconnectSpy = jest.spyOn(pubSubRedis.subRedis, 'disconnect');

      pubSubRedis.disconnect();
      expect(pubDisconnectSpy).toHaveBeenCalled();
      expect(subDisconnectSpy).toHaveBeenCalled();
    });
  });
});
