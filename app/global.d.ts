declare global {
  interface Window {
    plausible?: (event: string, opts?: Record<string, unknown>) => void;
  }
}
export {};
