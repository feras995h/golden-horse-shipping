import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Golden Horse Shipping API is running! 🚢✨';
  }
}
