export const utils = {
  wait(ms) {
    return new Promise(resolve => setTimeout(() => resolve, ms));
  },
};
