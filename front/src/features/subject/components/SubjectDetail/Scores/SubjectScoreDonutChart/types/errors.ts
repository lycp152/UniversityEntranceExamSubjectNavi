export type Severity = 'critical' | 'warning' | 'info';
export type Priority = 'high' | 'medium' | 'low';
export type MemoryType = 'heap' | 'rss';
export type Strategy = 'gzip' | 'base64';
export type ErrorSeverity = 'critical' | 'error' | 'warning';

export type AlertCategory =
  | 'performance'
  | 'reliability'
  | 'resources'
  | 'security'
  | 'availability';
