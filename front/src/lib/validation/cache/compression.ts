import { gzip, gunzip } from "zlib";
import { Strategy } from "@/types/api/endpoints/monitoring";

export interface CompressionConfig {
  threshold: number;
  minCompressionRatio: number;
  maxCompressionTime: number;
  adaptiveThresholds: {
    enabled: boolean;
    minEntrySize: number;
    maxEntrySize: number;
    targetCompressionRatio: number;
  };
  strategies: Strategy[];
}

export interface CompressionMetrics {
  totalSaved: number;
  compressionRatio: number;
  compressedEntries: number;
  averageCompressionTime: number;
  byStrategy: Map<
    string,
    {
      totalSize: number;
      compressedSize: number;
      compressionTime: number;
      successCount: number;
      failureCount: number;
    }
  >;
  adaptiveThreshold: number;
}

export class CompressionManager {
  private readonly config: CompressionConfig;
  private readonly metrics: CompressionMetrics;

  constructor(config: CompressionConfig) {
    this.config = config;
    this.metrics = {
      totalSaved: 0,
      compressionRatio: 0,
      compressedEntries: 0,
      averageCompressionTime: 0,
      byStrategy: new Map(),
      adaptiveThreshold: config.threshold,
    };
  }

  async compress(data: string): Promise<Buffer> {
    const startTime = Date.now();
    try {
      const buffer = Buffer.from(data);
      if (buffer.length < this.config.threshold) {
        return buffer;
      }

      const compressed = await new Promise<Buffer>((resolve, reject) => {
        gzip(buffer, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      const compressionTime = Date.now() - startTime;
      this.updateMetrics(buffer.length, compressed.length, compressionTime);

      return compressed;
    } catch (error) {
      console.error("Compression failed:", error);
      return Buffer.from(data);
    }
  }

  async decompress(data: Buffer): Promise<string> {
    try {
      const decompressed = await new Promise<Buffer>((resolve, reject) => {
        gunzip(data, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      return decompressed.toString();
    } catch (error) {
      console.error("Decompression failed:", error);
      return data.toString();
    }
  }

  private updateMetrics(
    originalSize: number,
    compressedSize: number,
    compressionTime: number
  ): void {
    const saved = originalSize - compressedSize;
    const ratio = compressedSize / originalSize;

    this.metrics.totalSaved += saved;
    this.metrics.compressedEntries++;
    this.metrics.compressionRatio =
      (this.metrics.compressionRatio * (this.metrics.compressedEntries - 1) +
        ratio) /
      this.metrics.compressedEntries;
    this.metrics.averageCompressionTime =
      (this.metrics.averageCompressionTime *
        (this.metrics.compressedEntries - 1) +
        compressionTime) /
      this.metrics.compressedEntries;

    if (this.config.adaptiveThresholds.enabled) {
      this.updateAdaptiveThreshold(ratio);
    }
  }

  private updateAdaptiveThreshold(ratio: number): void {
    const { minEntrySize, maxEntrySize, targetCompressionRatio } =
      this.config.adaptiveThresholds;
    const currentThreshold = this.metrics.adaptiveThreshold;

    if (ratio > targetCompressionRatio) {
      this.metrics.adaptiveThreshold = Math.min(
        currentThreshold * 1.1,
        maxEntrySize
      );
    } else {
      this.metrics.adaptiveThreshold = Math.max(
        currentThreshold * 0.9,
        minEntrySize
      );
    }
  }

  getMetrics(): CompressionMetrics {
    return { ...this.metrics };
  }
}
