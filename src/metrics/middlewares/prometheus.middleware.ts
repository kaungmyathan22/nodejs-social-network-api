import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { Histogram } from 'prom-client';

@Injectable()
export class PrometheusMiddleware implements NestMiddleware {
  private httpRequestsDurationSeconds: Histogram<string>;

  constructor() {
    this.httpRequestsDurationSeconds = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    const end = this.httpRequestsDurationSeconds.startTimer({
      method: req.method,
      route: req.route ? req.route.path : 'unknown',
    });

    res.on('finish', () => {
      end();
    });

    next();
  }
}
