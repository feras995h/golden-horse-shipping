import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Response } from 'express';
import { 
  ShipsGoApiException, 
  ShipsGoRateLimitException, 
  ShipsGoAuthException, 
  ShipsGoNotFoundException 
} from '../exceptions/shipsgo.exception';

@Catch(ShipsGoApiException, ShipsGoRateLimitException, ShipsGoAuthException, ShipsGoNotFoundException)
export class ShipsGoExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ShipsGoExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    // Log the error
    this.logger.error(
      `ShipsGo API Error: ${exceptionResponse.message}`,
      {
        url: request.url,
        method: request.method,
        status,
        timestamp: exceptionResponse.timestamp,
        originalError: exceptionResponse.originalError,
      }
    );

    // Send user-friendly response
    const errorResponse = {
      success: false,
      error: {
        type: exception.constructor.name,
        message: this.getUserFriendlyMessage(exception),
        timestamp: exceptionResponse.timestamp,
        statusCode: status,
      },
      // Include fallback suggestion for client
      suggestion: this.getSuggestion(exception),
    };

    response.status(status).json(errorResponse);
  }

  private getUserFriendlyMessage(exception: HttpException): string {
    if (exception instanceof ShipsGoRateLimitException) {
      return 'تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة مرة أخرى بعد دقيقة.';
    }
    
    if (exception instanceof ShipsGoAuthException) {
      return 'خطأ في المصادقة مع خدمة التتبع. يرجى المحاولة مرة أخرى لاحقاً.';
    }
    
    if (exception instanceof ShipsGoNotFoundException) {
      return 'لم يتم العثور على معلومات التتبع للرقم المدخل.';
    }
    
    if (exception instanceof ShipsGoApiException) {
      return 'خطأ مؤقت في خدمة التتبع. يرجى المحاولة مرة أخرى لاحقاً.';
    }
    
    return 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
  }

  private getSuggestion(exception: HttpException): string {
    if (exception instanceof ShipsGoRateLimitException) {
      return 'انتظر دقيقة واحدة قبل المحاولة مرة أخرى.';
    }
    
    if (exception instanceof ShipsGoNotFoundException) {
      return 'تأكد من صحة رقم الحاوية أو رقم بوليصة الشحن.';
    }
    
    return 'إذا استمر الخطأ، يرجى الاتصال بخدمة العملاء.';
  }
}
