import {
  In,
  type DataSource,
  type DeepPartial,
  type EntityManager,
  type EntityTarget,
  type FindOptionsWhere,
  type ObjectLiteral,
  type Repository,
} from 'typeorm';

type UpdatePatch<Entity extends ObjectLiteral> = Parameters<
  Repository<Entity>['update']
>[1];

export abstract class BaseRepository<
  Entity extends ObjectLiteral & { id: string },
> {
  protected constructor(
    protected readonly dataSource: DataSource,
    protected readonly entity: EntityTarget<Entity>,
  ) {}

  protected repo(manager?: EntityManager): Repository<Entity> {
    return manager
      ? manager.getRepository(this.entity)
      : this.dataSource.getRepository(this.entity);
  }

  findById(id: string, manager?: EntityManager): Promise<Entity | null> {
    return this.repo(manager).findOne({
      where: { id } as FindOptionsWhere<Entity>,
    });
  }

  findByIds(ids: string[], manager?: EntityManager): Promise<Entity[]> {
    if (ids.length === 0) {
      return Promise.resolve([]);
    }
    return this.repo(manager).find({
      where: { id: In(ids) } as FindOptionsWhere<Entity>,
    });
  }

  findOne(
    where: FindOptionsWhere<Entity>,
    manager?: EntityManager,
  ): Promise<Entity | null> {
    return this.repo(manager).findOne({ where });
  }

  find(
    where: FindOptionsWhere<Entity>,
    manager?: EntityManager,
  ): Promise<Entity[]> {
    return this.repo(manager).find({ where });
  }

  exists(
    where: FindOptionsWhere<Entity>,
    manager?: EntityManager,
  ): Promise<boolean> {
    return this.repo(manager).exists({ where });
  }

  count(
    where: FindOptionsWhere<Entity>,
    manager?: EntityManager,
  ): Promise<number> {
    return this.repo(manager).count({ where });
  }

  // repo.create() + repo.save() so @BeforeInsert fires and the UUIDv7
  // generateId() assigns the id. Never use insert()/upsert() here.
  create(data: DeepPartial<Entity>, manager?: EntityManager): Promise<Entity> {
    const repository = this.repo(manager);
    const entity = repository.create(data);
    return repository.save(entity);
  }

  save(entity: Entity, manager?: EntityManager): Promise<Entity> {
    return this.repo(manager).save(entity);
  }

  async update(
    id: string,
    patch: UpdatePatch<Entity>,
    manager?: EntityManager,
  ): Promise<void> {
    await this.repo(manager).update(id, patch);
  }

  async softDelete(id: string, manager?: EntityManager): Promise<void> {
    await this.repo(manager).softDelete(id);
  }
}
