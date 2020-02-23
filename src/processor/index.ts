import { Task, FiboTask, CompletedTask, FactTask } from '../types';
import * as fibo from './fibo';
import * as fact from './fact';

export async function process(task: Task): Promise<CompletedTask> {
  switch (task.type) {
    case 'FIBO':
      return await fibo.process(task as FiboTask);
    case 'FACT':
      return await fact.process(task as FactTask);
  }
}
