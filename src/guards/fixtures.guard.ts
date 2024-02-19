import { ExecutionContext } from '@nestjs/common';

export function getMockContext(request: object) {
    return {
        switchToHttp: () => ({
            getRequest: () => request,
            getResponse: jest.fn(),
            getNext: jest.fn(),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
        getArgs: jest.fn(),
        getArgByIndex: jest.fn(),
        switchToRpc: jest.fn(),
        switchToWs: jest.fn(),
        getType: jest.fn(),
    } as ExecutionContext;
}
