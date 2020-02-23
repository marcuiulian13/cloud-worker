export type TaskType = 'FIBO' | 'FACT';

export type Task = {
  id: string;
  type: TaskType;
  payload: object;
};

export type CompletedTask = Task & {
  result: object;
};

export type FiboTask = Task & {
  type: 'FIBO';
  payload: {
    n: number;
  };
};

export type FactTask = Task & {
  type: 'FACT';
  payload: {
    n: number;
  };
};
