import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

export const REDIS_SERVICE = 'REDIS_SERVICE';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: REDIS_SERVICE,
                transport: Transport.REDIS,
                options: {
                    host: 'localhost',
                    port: 6379,
                },
            },
        ]),
    ],
    exports: [ClientsModule],
})
export class RedisModule {}
