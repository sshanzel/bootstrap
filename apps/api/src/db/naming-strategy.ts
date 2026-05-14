import { DefaultNamingStrategy, type Table } from 'typeorm';
import { camelCase, snakeCase, titleCase } from 'typeorm/util/StringUtils.js';

export class BootstrapNamingStrategy extends DefaultNamingStrategy {
  override tableName(
    targetName: string,
    userSpecifiedName: string | undefined,
  ): string {
    return userSpecifiedName
      ? userSpecifiedName
      : this.singularizeTableName(
          snakeCase(this.stripEntitySuffix(targetName)),
        );
  }

  override columnName(
    propertyName: string,
    customName: string,
    embeddedPrefixes: string[],
  ): string {
    const name = customName || propertyName;
    if (embeddedPrefixes.length === 0) {
      return snakeCase(name);
    }

    return snakeCase(camelCase(embeddedPrefixes.join('_')) + titleCase(name));
  }

  override joinColumnName(
    relationName: string,
    referencedColumnName: string,
  ): string {
    return snakeCase(`${relationName}_${referencedColumnName}`);
  }

  override joinTableName(
    firstTableName: string,
    secondTableName: string,
    firstPropertyName: string,
    _secondPropertyName: string,
  ): string {
    return snakeCase(
      `${firstTableName}_${firstPropertyName.replace(/\./g, '_')}_${secondTableName}`,
    );
  }

  override joinTableColumnName(
    tableName: string,
    propertyName: string,
    columnName?: string,
  ): string {
    return snakeCase(`${tableName}_${columnName ?? propertyName}`);
  }

  override joinTableInverseColumnName(
    tableName: string,
    propertyName: string,
    columnName?: string,
  ): string {
    return this.joinTableColumnName(tableName, propertyName, columnName);
  }

  override uniqueConstraintName(
    tableOrName: Table | string,
    columnNames: string[],
  ): string {
    const tableName = this.getTableName(tableOrName);
    return `UQ_${tableName}_${columnNames.join('_')}`;
  }

  override relationConstraintName(
    tableOrName: Table | string,
    columnNames: string[],
  ): string {
    const tableName = this.getTableName(tableOrName);
    return `REL_${tableName}_${columnNames.join('_')}`;
  }

  override primaryKeyName(
    tableOrName: Table | string,
    columnNames: string[],
  ): string {
    const tableName = this.getTableName(tableOrName);
    return `PK_${tableName}_${columnNames.join('_')}`;
  }

  override foreignKeyName(
    tableOrName: Table | string,
    columnNames: string[],
  ): string {
    const tableName = this.getTableName(tableOrName);
    return `FK_${tableName}_${columnNames.join('_')}`;
  }

  override indexName(
    tableOrName: Table | string,
    columnNames: string[],
  ): string {
    const tableName = this.getTableName(tableOrName);
    return `IDX_${tableName}_${columnNames.join('_')}`;
  }

  protected override getTableName(tableOrName: Table | string): string {
    if (typeof tableOrName === 'string') {
      return tableOrName;
    }

    return tableOrName.name;
  }

  private singularizeTableName(tableName: string): string {
    return tableName
      .split('_')
      .map((part) => {
        if (part.endsWith('ies')) {
          return `${part.slice(0, -3)}y`;
        }

        if (part.endsWith('s')) {
          return part.slice(0, -1);
        }

        return part;
      })
      .join('_');
  }

  private stripEntitySuffix(targetName: string): string {
    return targetName.endsWith('Entity')
      ? targetName.slice(0, -'Entity'.length)
      : targetName;
  }
}
