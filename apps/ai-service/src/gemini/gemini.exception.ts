import { HttpException, HttpStatus } from '@nestjs/common';

export class GeminiApiException extends HttpException {
  constructor(
    message: string,
    public readonly originalError?: unknown,
  ) {
    super(
      {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        error: 'Gemini API Error',
        message,
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}

export class GeminiParseException extends HttpException {
  constructor(
    message: string,
    public readonly rawResponse?: string,
  ) {
    const fullMessage = rawResponse ? `${message}. Raw text: ${rawResponse.substring(0, 100)}...` : message;
    super(
      {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        error: 'Gemini Parse Error',
        message: fullMessage,
        rawResponse,
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}
