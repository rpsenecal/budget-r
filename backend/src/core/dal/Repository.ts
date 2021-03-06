import Knex, { QueryBuilder } from 'knex';
import { Id } from '../models';
import { IRepository } from './IRepository';
import { KnexWrapper } from './KnexWrapper';

export enum orderBy {
  desc = 'desc',
  asc = 'asc'
}

export interface IOrder {
  col: string;
  orderBy: orderBy;
}

export class Repository<T extends Id> implements IRepository<T> {
  private db: Knex;

  constructor(public tableName: string) {
    this.db = KnexWrapper.getKnex();
  }

  public async find(id: number): Promise<T> {
    return this.getDb()
      .where({ id })
      .first();
  }

  public async get(filter?: any, order?: IOrder): Promise<T[]> {
    let query = this.getDb().where(filter || {});
    if (order) {
      query = query.orderBy(order.col, order.orderBy);
    }
    return query;
  }

  public async add(entity: T): Promise<number> {
    const { id, ...rest } = entity;
    return (await this.getDb()
      .insert({ ...rest })
      .returning('id')) as number;
  }

  public async delete(id: number): Promise<void> {
    await this.getDb()
      .where({ id })
      .del();
  }

  public async update(entity: T): Promise<void> {
    await this.getDb()
      .where(entity.id)
      .update(entity);
  }

  private getDb(): QueryBuilder {
    return this.db(this.tableName);
  }
}
