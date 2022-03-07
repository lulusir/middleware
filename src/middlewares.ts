export type IMiddlewareNextFunction = () => Promise<any>;

export interface IMiddleware<CTX> {
  (context: CTX, next: IMiddlewareNextFunction): any | Promise<any>;
}

export class MiddlewareRunner<CTX> {
  middleware: IMiddleware<CTX>[] = [];

  middlewareCurrent = 0;

  use = (middleware: IMiddleware<CTX>) => {
    this.middleware.push(middleware);
  };

  run = async (context: CTX) => {
    let err: Error | null = null;
    const next = async () => {
      const middleware = this.middleware[this.middlewareCurrent];
      this.middlewareCurrent += 1;
      if (typeof middleware === 'function') {
        try {
          const p = middleware(context, next);
          if (p instanceof Promise) {
            await p;
          }
        } catch (e) {
          // 运行中间件出错就执行下一个
          await next();
          err = e as Error;
        }
      }
    };
    await next();

    if (err) {
      throw err;
    }
    return context;
  };
}
