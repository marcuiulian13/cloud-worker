import * as fibo from './fibo';
import { FiboTask } from '../types';

describe('Processor: fibo', () => {
  it('processes a FIBO task and resolves with a CompletedTask', () => {
    const task: FiboTask = {
      id: 'random-id',
      type: 'FIBO',
      payload: {
        n: 10,
      },
    };

    expect(fibo.process(task)).resolves.toMatchSnapshot();
  });
});
