import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { GeminiApiException } from '../../gemini/gemini.exception.js';

@Catch(GeminiApiException)
export class GeminiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GeminiExceptionFilter.name);

  catch(exception: GeminiApiException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    this.logger.error(`Gemini Error: ${exception.message}`, exception.stack);

    // Default to Internal Server Error
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = exception.message;

    // Map common Gemini API errors to HTTP status codes
    const errorDetails = exception.originalError as any;
    if (errorDetails?.status === 429) {
      status = HttpStatus.TOO_MANY_REQUESTS;
      message = 'AI Engine is currently overloaded. Please try again later.';
    } else if (errorDetails?.status === 400) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid input provided to AI Engine.';
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message,
      error: 'Gemini API Error',
    });
  }
}
