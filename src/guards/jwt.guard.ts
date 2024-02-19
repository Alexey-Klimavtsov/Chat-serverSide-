import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

export const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
    private readonly logger = new Logger(JwtGuard.name);
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        this.logger.debug('Jwt Guard');

        const isPublic = this.reflector.get(
            IS_PUBLIC_KEY,
            context.getHandler(),
        );

        this.logger.debug(isPublic);

        if (isPublic) return true;
        return super.canActivate(context);
    }
}
