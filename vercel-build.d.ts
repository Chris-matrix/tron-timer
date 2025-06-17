// Type definitions for vercel-build.js
declare const global: typeof globalThis;
declare const self: Window & typeof globalThis;

interface Process {
  env: Record<string, string | undefined>;
  exit(code?: number): never;
  cwd(): string;
  platform: string;
  nextTick(callback: (...args: any[]) => void, ...args: any[]): void;
  version: string;
  versions: Record<string, string>;
  argv: string[];
}

declare let process: Process;
