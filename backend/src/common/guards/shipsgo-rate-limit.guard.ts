import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ShipsGoRateLimitException } from '../exceptions/shipsgo.exception';
import Redis from 'ioredis';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

@Injectable()
export class ShipsGoRateLimitGuard implements CanActivate {
  private readonly logger = new Logger(ShipsGoRateLimitGuard.name);
  private readonly rateLimitMap = new Map<string, RateLimitEntry>();
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private readonly redis?: Redis;

  constructor(private configService: ConfigService) {
    // ShipsGo allows 100 requests per minute
    this.maxRequests = this.configService.get<number>('SHIPSGO_RATE_LIMIT', 100);
    this.windowMs = 60 * 1000; // 1 minute

    const redisUrl = this.configService.get<string>('REDIS_URL');
    if (redisUrl) {
      this.redis = new Redis(redisUrl, { maxRetriesPerRequest: 1 });
      this.redis.on('error', (err) => this.logger.error('Redis error in rate limiter', err as any));
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const clientId = this.getClientId(request);

    // If Redis available, use distributed limiter
    if (this.redis) {
      const key = `shipsgo:rate:${clientId}`;
      const count = await this.redis.incr(key);
      if (count === 1) {
        await this.redis.pexpire(key, this.windowMs);
      }
      if (count > this.maxRequests) {
        this.logger.warn(`Rate limit exceeded for client (redis): ${clientId}`);
        throw new ShipsGoRateLimitException();
      }
      return true;
    }

    // Fallback: in-memory limiter with automatic cleanup
    const now = Date.now();
    
    // Periodic cleanup every 100 requests to prevent memory buildup
    if (this.rateLimitMap.size > 100 && Math.random() < 0.1) {
      this.cleanupOldEntries();
    }
    
    const entry = this.rateLimitMap.get(clientId);

    if (!entry || now > entry.resetTime) {
      this.rateLimitMap.set(clientId, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (entry.count >= this.maxRequests) {
      this.logger.warn(`Rate limit exceeded for client: ${clientId}`);
      throw new ShipsGoRateLimitException();
    }

    entry.count++;
    this.rateLimitMap.set(clientId, entry);
    return true;
  }

  private getClientId(request: any): string {
    // Respect X-Forwarded-For when behind reverse proxies
    const fwd = request.headers?.['x-forwarded-for'];
    const forwardedIp = Array.isArray(fwd) ? fwd[0] : (typeof fwd === 'string' ? fwd.split(',')[0].trim() : undefined);
    return forwardedIp || request.ip || request.connection?.remoteAddress || 'unknown';
  }

  // Clean up old entries periodically
  cleanupOldEntries(): void {
    const now = Date.now();
    let cleaned = 0;
    for (const [clientId, entry] of this.rateLimitMap.entries()) {
      if (now > entry.resetTime) {
        this.rateLimitMap.delete(clientId);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      this.logger.debug(`Cleaned up ${cleaned} expired rate limit entries`);
    }
  }
}

// Note: Cleanup is handled by the guard instance itself when Redis is not available
// If using in-memory storage, the cleanup happens automatically on each request check
