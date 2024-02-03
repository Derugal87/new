// In some file like exception.filter.ts

import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    UnauthorizedException,
  } from '@nestjs/common';
  
  @Catch(UnauthorizedException)
  export class UnauthorizedExceptionFilter implements ExceptionFilter {
    catch(exception: UnauthorizedException, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const status = exception.getStatus();
  
      response
        .status(status)
        .json({
          statusCode: status,
          message: exception.message,
        });
    }
  }
  