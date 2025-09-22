import { HttpException, HttpStatus } from '@nestjs/common';

export class ShipsGoApiException extends HttpException {
  constructor(message: string, originalError?: any) {
    super(
      {
        message: `ShipsGo API Error: ${message}`,
        originalError: originalError?.message || originalError,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}

export class ShipsGoRateLimitException extends HttpException {
  constructor() {
    super(
      {
        message: 'ShipsGo API rate limit exceeded. Please try again later.',
        timestamp: new Date().toISOString(),
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

export class ShipsGoAuthException extends HttpException {
  constructor() {
    super(
      {
        message: 'ShipsGo API authentication failed. Please check API key.',
        timestamp: new Date().toISOString(),
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class ShipsGoNotFoundException extends HttpException {
  constructor(identifier: string) {
    super(
      {
        message: `Shipment not found in ShipsGo API: ${identifier}`,
        identifier,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
