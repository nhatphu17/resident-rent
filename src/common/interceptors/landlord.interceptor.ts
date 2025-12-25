import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LandlordInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user && user.role === 'LANDLORD') {
      const landlord = await this.prisma.landlord.findUnique({
        where: { userId: user.id },
      });
      if (landlord) {
        request.landlordId = landlord.id;
      }
    }

    return next.handle();
  }
}


