declare module 'vercel-node-server' {
  export function createServer(handler: (req: any, res: any) => void): any;
  export function proxy(server: any, event: any, context: any): Promise<any>;
}
