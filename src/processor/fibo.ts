import { FiboTask, CompletedTask } from '../types';

export async function process(task: FiboTask): Promise<CompletedTask> {
  const fibo = fibonacci(task.payload.n);

  return {
    ...task,
    result: {
      value: fibo,
    },
  };
}

function fibonacci(n: number): number {
  if (n <= 2) {
    return 1;
  }

  return fibonacci(n - 2) + fibonacci(n - 1);
}
