import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { map } from 'rxjs';

export class CustomInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, handler: CallHandler) {
    // intercepting the request

    return handler.handle().pipe(
      map((data) => {
        // intercepting the response
        return data;
      }),
    );
  }
}
