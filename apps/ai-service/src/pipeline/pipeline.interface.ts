import { Logger } from '@nestjs/common';

/**
 * Shared context passed through all pipeline steps.
 * Steps can read/write variables to share state across the chain.
 */
export interface PipelineContext {
  /** Shared key-value store for passing data between steps */
  readonly variables: Map<string, unknown>;
  /** Logger scoped to the pipeline */
  readonly logger: Logger;
  /** Unique run ID for tracing */
  readonly runId: string;
}

/**
 * A single step in a pipeline.
 * Each step transforms input → output, with access to shared context.
 */
export interface PipelineStep<TIn = unknown, TOut = unknown> {
  readonly name: string;
  execute(input: TIn, context: PipelineContext): Promise<TOut>;
}

/**
 * A step that only executes when its condition returns true.
 * When skipped, passes input through unchanged.
 */
export interface ConditionalStep<TIn = unknown, TOut = unknown> extends PipelineStep<TIn, TOut> {
  shouldRun(input: TIn, context: PipelineContext): boolean;
}

/**
 * Result of a single step execution with timing metadata.
 */
export interface StepResult {
  stepName: string;
  status: 'completed' | 'skipped' | 'failed';
  durationMs: number;
  error?: string;
}

/**
 * Full pipeline execution result.
 */
export interface PipelineResult<T = unknown> {
  output: T;
  steps: StepResult[];
  totalDurationMs: number;
  runId: string;
}

/**
 * Type guard: check if a step is conditional.
 */
export function isConditionalStep(step: PipelineStep): step is ConditionalStep {
  return 'shouldRun' in step && typeof (step as ConditionalStep).shouldRun === 'function';
}
