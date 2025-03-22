import { CacheMetrics } from "./metrics";

export interface ScalingConfig {
  minScale: number;
  maxScale: number;
  scaleUpThreshold: number;
  scaleDownThreshold: number;
  cooldownPeriod: number;
  resourceCheckInterval: number;
}

export class ScalingManager {
  private readonly config: ScalingConfig;
  private readonly metrics: CacheMetrics;
  private readonly lastScaleTime: number;
  private readonly resourceCheckInterval: NodeJS.Timeout;

  constructor(config: ScalingConfig, metrics: CacheMetrics) {
    this.config = config;
    this.metrics = metrics;
    this.lastScaleTime = Date.now();
    this.resourceCheckInterval = setInterval(
      () => this.checkResources(),
      config.resourceCheckInterval
    );
  }

  private checkResources(): void {
    const currentScale = this.metrics.scaling.currentScale;
    const resourceUsage = this.metrics.scaling.resourceUsage;

    // Calculate resource utilization
    const cpuUtilization = resourceUsage.cpu / 100;
    const memoryUtilization = resourceUsage.memory / 100;
    const operationsUtilization =
      resourceUsage.operations / this.config.maxScale;

    // Determine if scaling is needed
    const shouldScaleUp = this.shouldScaleUp(
      cpuUtilization,
      memoryUtilization,
      operationsUtilization
    );
    const shouldScaleDown = this.shouldScaleDown(
      cpuUtilization,
      memoryUtilization,
      operationsUtilization
    );

    // Check cooldown period
    const timeSinceLastScale = Date.now() - this.lastScaleTime;
    if (timeSinceLastScale < this.config.cooldownPeriod) {
      return;
    }

    // Perform scaling if needed
    if (shouldScaleUp && currentScale < this.config.maxScale) {
      this.scaleUp();
    } else if (shouldScaleDown && currentScale > this.config.minScale) {
      this.scaleDown();
    }
  }

  private shouldScaleUp(
    cpuUtilization: number,
    memoryUtilization: number,
    operationsUtilization: number
  ): boolean {
    return (
      cpuUtilization > this.config.scaleUpThreshold ||
      memoryUtilization > this.config.scaleUpThreshold ||
      operationsUtilization > this.config.scaleUpThreshold
    );
  }

  private shouldScaleDown(
    cpuUtilization: number,
    memoryUtilization: number,
    operationsUtilization: number
  ): boolean {
    return (
      cpuUtilization < this.config.scaleDownThreshold &&
      memoryUtilization < this.config.scaleDownThreshold &&
      operationsUtilization < this.config.scaleDownThreshold
    );
  }

  private scaleUp(): void {
    const newScale = Math.min(
      this.metrics.scaling.currentScale + 1,
      this.config.maxScale
    );

    if (newScale !== this.metrics.scaling.currentScale) {
      this.updateScale(newScale, "Scale up due to high resource utilization");
    }
  }

  private scaleDown(): void {
    const newScale = Math.max(
      this.metrics.scaling.currentScale - 1,
      this.config.minScale
    );

    if (newScale !== this.metrics.scaling.currentScale) {
      this.updateScale(newScale, "Scale down due to low resource utilization");
    }
  }

  private updateScale(scale: number, reason: string): void {
    this.metrics.scaling.currentScale = scale;
    this.metrics.scaling.lastScaleTime = Date.now();
    this.metrics.scaling.scaleHistory.push({
      timestamp: Date.now(),
      scale,
      reason,
    });
  }

  public stop(): void {
    clearInterval(this.resourceCheckInterval);
  }
}
