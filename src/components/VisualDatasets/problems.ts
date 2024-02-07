import { Problem } from "./types.ts";

/**
 * Callback for when problems (warnings or errors) occur.
 */
type SetProblems = (problems: Problem[]) => void;

/**
 * `ProblemsManager` uses a React stateful hook to notify a component about
 * problems.
 */
class ProblemsManager {
  public readonly problems: Problem[];
  private readonly setProblems: SetProblems;

  /**
   * @param client ChRIS API client
   * @param problemsHook React hook for handling problems
   */
  public constructor(problemsHook: [Problem[], SetProblems]) {
    [this.problems, this.setProblems] = problemsHook;
  }

  /**
   * Notify component of a problem.
   */
  public push(problem: Problem) {
    this.setProblems(this.problems.concat([problem]));
  }

  /**
   * Notify component of a unique problem. Does nothing if problem
   * previously occurred.
   */
  public pushOnce(problem: Problem) {
    if (this.hasProblemWithSameTitle(problem)) {
      this.push(problem);
    }
  }

  /**
   * Has this problem happened before?
   */
  private hasProblemWithSameTitle(problem: Problem) {
    return (
      this.problems.findIndex((other) => other.title === problem.title) === -1
    );
  }
}

export default ProblemsManager;
