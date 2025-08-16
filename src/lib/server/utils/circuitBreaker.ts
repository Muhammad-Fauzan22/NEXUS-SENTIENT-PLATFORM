export class CircuitBreaker {
  private failures = 0;
  private lastFailure = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF' = 'CLOSED';
  constructor(private maxFailures = 5, private intervalMs = 30_000, private halfOpenAfterMs = 10_000) {}

  canProceed() {
    const now = Date.now();
    if (this.state === 'OPEN' && now - this.lastFailure > this.halfOpenAfterMs) {
      this.state = 'HALF';
    }
    return this.state !== 'OPEN';
  }

  succeed() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  fail() {
    this.failures += 1;
    this.lastFailure = Date.now();
    if (this.failures >= this.maxFailures) {
      this.state = 'OPEN';
      setTimeout(() => {
        // keep OPEN for interval then allow HALF on next canProceed
      }, this.intervalMs);
    }
  }

  status() {
    return { state: this.state, failures: this.failures };
  }
}

