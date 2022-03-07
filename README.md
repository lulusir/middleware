# Middleware Builder

> To help you create and use middleware

## install

```
npm install @lujs/middleware
```

## usage

```typescript
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

runner.run('');

// log 1 2 3 4 5 6
```

async

> The run function returns a promise, which is executed at the end

```typescript
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

runner.run('').then(() => {
  console.log('finally');
});

// log 1 2 3 4 5 6  finally
```

## error

## Todo
添加NestJs的中间件方式
