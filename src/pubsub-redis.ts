import Redis from 'ioredis';

export type PubSubRedisConfig = {
  host: string;
  port: number;
  password: string;
};

class PubSubRedis {
  pubRedis: Redis.Redis;
  subRedis: Redis.Redis;
  subChannels: Array<string>;

  constructor(config: PubSubRedisConfig) {
    this.pubRedis = new Redis({ ...config, name: 'publisher' });
    this.subRedis = new Redis({ ...config, name: 'subscriber' });
    this.subChannels = [];
  }

  public async push(list: string, message: string) {
    return this.pubRedis.lpush(list, message);
  }

  public async pop(list: string) {
    return this.pubRedis.rpop(list);
  }

  public async publish(channel: string, message: string) {
    return this.pubRedis.publish(channel, message);
  }

  public async subscribe(...channels: Array<string>) {
    this.subChannels.push(...channels);
    return this.subRedis.subscribe(...channels);
  }

  public async unsubscribe() {
    this.subRedis.removeAllListeners('message');

    const result = await this.subRedis.unsubscribe(...this.subChannels);
    this.subChannels = [];

    return result;
  }

  public onMessage(cb: (channel: string, message: string) => void) {
    this.subRedis.on('message', cb);
  }

  public async disconnect() {
    this.pubRedis.disconnect();
    this.subRedis.disconnect();
  }
}

export default PubSubRedis;
