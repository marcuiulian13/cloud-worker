import { readEnv } from './config';

describe('config', () => {
  describe('readEnv', () => {
    it('throws an error if key is not found in env', () => {
      const key = 'FOOBAR_NO_CHANCE_TO_BE_IN_ENV';
      expect(() => readEnv(key)).toThrowErrorMatchingSnapshot();
    });
  });
});
