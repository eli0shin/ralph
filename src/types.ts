export type RalphConfig = {
  promptFile: string;
  completionPromise: string;
  maxIterations: number;
  model?: string;
  cwd: string;
};

export type IterationResult = {
  iteration: number;
  output: string;
  completed: boolean;
  error?: string;
};

export type RalphResult = {
  iterations: number;
  completed: boolean;
  output: string;
  error?: string;
};
