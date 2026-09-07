import {
  Catch,
  HttpException,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  normalizeErrorForLog,
  type ApiErrorBody,
  type ApiErrorDetail,
} from '@bootstrap/shared';
import type { RequestWithId } from './request-id.middleware';

const HTTP_ERROR_NAMES: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  424: 'Failed Dependency',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
};

function httpErrorName(statusCode: number): string {
  return HTTP_ERROR_NAMES[statusCode] ?? 'Error';
}

function isDetailShaped(value: unknown): value is ApiErrorDetail {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { path?: unknown }).path === 'string' &&
    typeof (value as { message?: unknown }).message === 'string'
  );
}

function extractHttpExceptionDetails(
  exception: HttpException,
): ApiErrorDetail[] | undefined {
  const response = exception.getResponse();
  if (typeof response !== 'object' || response === null) {
    return undefined;
  }
  const details = (response as { details?: unknown }).details;
  if (!Array.isArray(details) || !details.every(isDetailShaped)) {
    return undefined;
  }
  return details;
}

function extractHttpExceptionMessage(exception: HttpException): string {
  const response = exception.getResponse();
  if (typeof response === 'string') {
    return response;
  }

  if (typeof response === 'object' && response !== null) {
    const message = (response as { message?: unknown }).message;
    if (typeof message === 'string') {
      return message;
    }
    if (Array.isArray(message)) {
      return message.map(String).join('; ');
    }
  }

  return exception.message;
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const httpContext = host.switchToHttp();
    const response = httpContext.getResponse<Response>();
    const request = httpContext.getRequest<RequestWithId>();
    const body = this.buildErrorBody(exception, request.requestId);

    if (body.statusCode >= 500) {
      this.logger.error(
        `requestId=${request.requestId ?? 'unknown'} ${normalizeErrorForLog(exception)}`,
      );
    }

    response.status(body.statusCode).json(body);
  }

  private buildErrorBody(
    exception: unknown,
    requestId: string | undefined,
  ): ApiErrorBody {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const details = extractHttpExceptionDetails(exception);
      return {
        statusCode,
        error: httpErrorName(statusCode),
        message: extractHttpExceptionMessage(exception),
        ...(details ? { details } : {}),
        ...(requestId ? { requestId } : {}),
      };
    }

    return {
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Something went wrong. Please try again.',
      ...(requestId ? { requestId } : {}),
    };
  }
}
