import { CompletedTask, FactTask } from '../types';

export async function process(task: FactTask): Promise<CompletedTask> {
  const fact = factorial(task.payload.n);

  return {
    ...task,
    result: {
      value: fact,
    },
  };
}

function factorial(n: number): number {
  if (n <= 1) {
    return 1;
  }

  return n * factorial(n - 1);
}
