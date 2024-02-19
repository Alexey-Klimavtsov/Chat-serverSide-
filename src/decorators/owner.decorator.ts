import { SetMetadata } from '@nestjs/common';
import { Resource } from '../enum/resource.enum';

export const RESOURCE_KEY = 'resource';

export const Owner = (resource: Resource) =>
    SetMetadata(RESOURCE_KEY, resource);
