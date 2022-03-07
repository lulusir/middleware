import {
  IMiddleware,
  IMiddlewareNextFunction,
  MiddlewareRunner,
} from './middlewares';

const delay = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 100);
  });

describe('middleware', () => {
  it('use', () => {
    const m1: IMiddleware<string> = (ctx, next) => {
      next();
    };

    const m2: IMiddleware<string> = (ctx, next) => {
      next();
    };

    const runner = new MiddlewareRunner<string>();
    runner.use(m1);
    runner.use(m2);
    expect(runner.middleware.length).toBe(2);
  });

  it('run', () => {
    let count = 0;
    let ctx = '';

    const m1: IMiddleware<string> = (context: string, next) => {
      count += 1;
      ctx = context;
      next();
    };

    const inputStr = 'haha';
    const runner = new MiddlewareRunner<string>();
    runner.use(m1);

    expect(count).toBe(0);
    runner.run(inputStr);

    expect(count).toBe(1);
    expect(ctx).toBe(inputStr);
  });

  it('run async', (done) => {
    let count = 0;
    let ctx = '';

    const m1: IMiddleware<string> = async (context: string, next) => {
      count += 1;
      ctx = context;
      await delay();
      next();
      count += 1;
    };

    const inputStr = 'haha';
    const runner = new MiddlewareRunner<string>();
    runner.use(m1);

    expect(count).toBe(0);
    runner.run(inputStr);

    expect(count).toBe(1);
    expect(ctx).toBe(inputStr);

    // after async middleware
    setTimeout(() => {
      expect(count).toBe(2);
      done();
    }, 1000);
  });

  it('log', () => {
    const m1: IMiddleware<string> = (ctx, next) => {
      console.log(1);
      next();
      console.log(6);
    };
    const m2: IMiddleware<string> = (ctx, next) => {
      console.log(2);
      next();
      console.log(5);
    };
    const m3: IMiddleware<string> = (ctx, next) => {
      console.log(3);
      next();
      console.log(4);
    };

    const runner = new MiddlewareRunner<string>();
    runner.use(m1);
    runner.use(m2);
    runner.use(m3);
    expect(runner.middleware.length).toBe(3);

    runner.run('').then(() => {
      console.log('finally');
    });
  });

  it('log async', () => {
    const m1: IMiddleware<string> = async (ctx, next) => {
      console.log('async', 1);
      await next();
      console.log('async', 6);
    };
    const m2: IMiddleware<string> = async (ctx, next) => {
      console.log('async', 2);
      await next();
      console.log('async', 5);
    };
    const m3: IMiddleware<string> = async (ctx, next) => {
      console.log('async', 3);
      await next();
      console.log('async', 4);
    };

    const runner = new MiddlewareRunner<string>();
    runner.use(m1);
    runner.use(m2);
    runner.use(m3);
    expect(runner.middleware.length).toBe(3);

    runner.run('').then(() => {
      console.log('async finally');
    });
  });

  it('run change ctx', () => {
    interface CTX {
      a: string;
    }
    const ctx: CTX = {
      a: 'a',
    };

    const inputStr = 'haha';

    const m1: IMiddleware<CTX> = (context, next) => {
      context.a = inputStr;
      next();
    };

    const runner = new MiddlewareRunner<CTX>();
    runner.use(m1);

    expect(ctx.a).toBe('a');
    runner.run(ctx);
    expect(ctx.a).toBe(inputStr);
  });

  it('run change ctx delay async', (done) => {
    interface CTX {
      a: string;
    }
    const ctx: CTX = {
      a: 'a',
    };

    const inputStr = 'haha';

    const m1: IMiddleware<CTX> = async (context, next) => {
      await delay();
      context.a = inputStr;
      next();
    };

    const runner = new MiddlewareRunner<CTX>();
    runner.use(m1);

    expect(ctx.a).toBe('a');
    runner.run(ctx);

    // after async middleware
    setTimeout(() => {
      expect(ctx.a).toBe(inputStr);

      done();
    }, 1000);
  });
});

describe('error', () => {
  it('error', (done) => {
    interface CTX {
      a: string;
    }
    const ctx: CTX = {
      a: 'a',
    };

    const inputStr = 'haha';

    const m1: IMiddleware<CTX> = (context, next) => {
      const err = () => {
        throw Error('some error');
      };
      err();
      // when error will not run
      context.a = inputStr;
      next();
    };

    const runner = new MiddlewareRunner<CTX>();
    runner.use(m1);

    expect(ctx.a).toBe('a');

    runner.run(ctx).catch((e) => {
      expect(e).toBeInstanceOf(Error);
      done();
    });
    expect(ctx.a).toBe('a');
  });

  it('error1', (done) => {
    interface CTX {
      a: string;
    }
    const ctx: CTX = {
      a: 'a',
    };

    const inputStr = 'haha';

    const m1: IMiddleware<CTX> = (context, next) => {
      console.log('m1 before');
      const err = () => {
        throw Error('some error');
      };
      err();
      // when error will not run
      context.a = inputStr;
      next();
      console.log('m1 after');
    };
    const m2: IMiddleware<CTX> = (context, next) => {
      // when error will not run
      console.log('m2 before');
      context.a = 'm2';
      next();
      console.log('m2 after');
    };

    const runner = new MiddlewareRunner<CTX>();
    runner.use(m1);
    runner.use(m2);

    expect(ctx.a).toBe('a');

    runner.run(ctx).catch((e) => {
      console.log(e.message);
      expect(e).toBeInstanceOf(Error);
      done();
    });
    expect(ctx.a).toBe('m2');
  });

  it('error2', (done) => {
    interface CTX {
      a: string;
    }
    const ctx: CTX = {
      a: 'a',
    };

    const inputStr = 'haha';

    const m1: IMiddleware<CTX> = (context, next) => {
      console.log('m1 before');
      const err = () => {
        throw Error('m1 error');
      };
      err();
      // when error will not run
      context.a = inputStr;
      next();
      console.log('m1 after');
    };
    const m2: IMiddleware<CTX> = (context, next) => {
      // when error will not run
      console.log('m2 before');
      const err = () => {
        throw Error('m2 error');
      };
      err();

      context.a = 'm2';
      next();
      console.log('m2 after');
    };

    const runner = new MiddlewareRunner<CTX>();
    runner.use(m1);
    runner.use(m2);

    expect(ctx.a).toBe('a');

    runner.run(ctx).catch((e) => {
      console.log(e.message);
      expect(e).toBeInstanceOf(Error);
      done();
    });
    expect(ctx.a).toBe('a');
  });
});

describe('run', () => {
  it("run's promise is executed after all middleware is complete", (done) => {
    interface CTX {
      a: string;
    }
    const ctx: CTX = {
      a: 'a',
    };

    const inputStr = 'haha';
    const start = Date.now();
    const m1: IMiddleware<CTX> = async (context, next) => {
      await delay();
      const t1 = Date.now();
      console.log('t1', t1 - start);
      await next();
    };
    const m2: IMiddleware<CTX> = async (context, next) => {
      await delay();
      const t2 = Date.now();
      console.log('t2', t2 - start);
      await next();
      context.a = inputStr;
    };

    const runner = new MiddlewareRunner<CTX>();
    runner.use(m1);
    runner.use(m2);

    expect(ctx.a).toBe('a');
    runner.run(ctx).then((res) => {
      const t3 = Date.now();
      console.log('t3', t3 - start);
      expect(res.a).toBe(inputStr);
      done();
    });
  });

  it("run's promise is executed after all middleware is complete 0", (done) => {
    interface CTX {
      a: string;
    }
    const ctx: CTX = {
      a: 'a',
    };

    const inputStr = 'haha';
    const start = Date.now();
    const m1: IMiddleware<CTX> = async (context, next) => {
      await delay();
      const t1 = Date.now();
      console.log('t1', t1 - start);
      await next();
    };

    const runner = new MiddlewareRunner<CTX>();
    runner.use(m1);

    expect(ctx.a).toBe('a');
    runner
      .run(ctx)
      .then((res) => {
        console.log(res, '=======res');
        return res;
      })
      .catch((e) => {
        console.log(e.message);
      })
      .finally(() => {
        const t3 = Date.now();
        expect(ctx.a).toBe('a');
        console.log('t3', t3 - start);
        done();
      });
  });

  it("run's promise is executed after all middleware is complete", (done) => {
    interface CTX {
      a: string;
    }
    const ctx: CTX = {
      a: 'a',
    };

    const inputStr = 'haha';
    const start = Date.now();
    const m1: IMiddleware<CTX> = async (context, next) => {
      await delay();
      const t1 = Date.now();
      console.log('t1', t1 - start);
      await next();
    };
    const m2: IMiddleware<CTX> = async (context, next) => {
      await delay();
      const t2 = Date.now();
      console.log('t2', t2 - start);
      const err = () => {
        throw Error('m2 error');
      };
      err();
      await next();
      context.a = inputStr;
    };

    const runner = new MiddlewareRunner<CTX>();
    runner.use(m1);
    runner.use(m2);

    expect(ctx.a).toBe('a');
    runner
      .run(ctx)
      .then((res) => res)
      .catch((e) => {
        console.log(e.message);
      })
      .finally(() => {
        const t3 = Date.now();
        expect(ctx.a).toBe('a');
        console.log('t3', t3 - start);
        done();
      });
  });
});
