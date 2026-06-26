/**
 * A single step in an execution plan.
 */
export interface PlanStep {
  /** Unique step identifier */
  id: string;
  /** Human-readable description of what this step does */
  description: string;
  /** Tool or pipeline name to execute */
  action: string;
  /** Parameters to pass to the action */
  params: Record<string, unknown>;
  /** Step IDs that must complete before this step can run */
  dependsOn: string[];
  /** Current execution status */
  status: 'pending' | 'running' | 'done' | 'failed' | 'skipped';
  /** Result from executing this step */
  result?: unknown;
  /** Error message if step failed */
  error?: string;
}

/**
 * A full execution plan created by the Planning Agent.
 */
export interface ExecutionPlan {
  /** The original user goal */
  goal: string;
  /** Ordered list of steps to execute */
  steps: PlanStep[];
  /** Overall plan status */
  status: 'planning' | 'executing' | 'completed' | 'failed';
  /** Final summary generated after execution */
  summary?: string;
}

/**
 * Response shape for the planning endpoint.
 */
export interface PlannerResponse {
  plan: ExecutionPlan;
  message: string;
}
