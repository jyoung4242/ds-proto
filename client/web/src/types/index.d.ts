//export {};
/* 
declare global {
  interface Window {
    username: string;
    model: object;
  }
} */

declare module "*.png";

declare module "*.wav" {
  const val: string;
  export default val;
}
