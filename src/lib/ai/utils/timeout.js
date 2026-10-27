/**
 * Wraps a promise in a timeout.
 * @param {Promise} promise 
 * @param {number} ms 
 * @param {string} provider 
 */
export const withTimeout = (promise, ms, provider) => {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Timeout: ${provider} did not respond within ${ms}ms`));
    }, ms);
  });

  return Promise.race([promise, timeout]);
};
