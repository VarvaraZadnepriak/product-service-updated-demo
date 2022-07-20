/* Helper to emulate asynchronous behavior */
export function delay<T>(timeMs: number, fn: () => T) {
  return new Promise<T>((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(fn());
      } catch(err) {
        reject(err);
      }
    }, timeMs);
  })
}