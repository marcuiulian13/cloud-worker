import * as fact from './fact';
import { FactTask } from '../types';

describe('Processor: fact', () => {
  it('processes a FACT task and resolves with a CompletedTask', () => {
    const task: FactTask = {
      id: 'random-id',
      type: 'FACT',
      payload: {
        n: 10,
      },
    };

    expect(fact.process(task)).resolves.toMatchSnapshot();
  });
});
