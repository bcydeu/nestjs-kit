import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, { status: 'success'; data: T }>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<{ status: 'success'; data: T }> {
    return next.handle().pipe(
      map(data => ({
        status: 'success',
        data,
      })),
    );
  }
}
