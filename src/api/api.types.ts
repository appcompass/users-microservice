import { Request } from 'express';
import { OrderByCondition } from 'typeorm';

import { DecodedToken } from '../auth/auth.types';

export enum AuditDataChangeType {
  created = 'CREATED',
  updated = 'UPDATED',
  deleted = 'DELETED'
}

export enum AuditAssignmentType {
  added = 'ADDED',
  updated = 'UPDATED',
  removed = 'REMOVED'
}

export type OrderQuery<T> = { [P in keyof T]?: 'ASC' | 'DESC' };

export interface AuthenticatedServiceRequest extends Request {
  user: DecodedToken;
}

export interface FilterAllQuery<T> {
  order: OrderByCondition;
  take: number;
  skip: number;
  filter?: string;
  where?: Partial<T>;
}

export interface PaginatedResponse<T> {
  data: Array<T>;
  pagination: {
    skip: number;
    take: number;
    total: number;
  };
}

export interface ResultsAndTotal<T> {
  data: Array<T>;
  total: number;
}
