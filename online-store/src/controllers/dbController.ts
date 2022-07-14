// Product database controller
// Provides local storage and db management for products
// Also makes filtered, searched and sorted requests to database
// Storage engine - indexedDB

import * as idb from 'idb';
import { IDBPDatabase, IDBPObjectStore } from "idb";

export function assertDefined<Type>(value: Type): NonNullable<Type> {
  if (value === undefined || value === null)
    throw new Error("Value is undefined!");
  return value as NonNullable<Type>;
}

export interface Product {
  name: string,
  price: number,
  date: Date
}

interface ProductDB extends idb.DBSchema {
  products: {
    value: Product;
    key: string;
    indexes: { 'price_idx': number };
  };
}

enum MigrationType {
  fieldAdded,
  fieldRemoved,
  indexAdded,
  indexRemoved,
}

interface BaseMigration {
  type: MigrationType,
  field: string
}

interface FieldAddedMigration extends BaseMigration {
  defaultValue: unknown
}

interface IndexMigration extends BaseMigration {
  indexName: string
}

// type migrationArray = BaseMigration[][];
type migrationArray = (BaseMigration | IndexMigration | FieldAddedMigration)[][];

type productStore = idb.IDBPObjectStore<ProductDB, ArrayLike<"products">, "products", "versionchange">;

export default class DbController {
  version: number = 1
  storageKey: string = 'name'
  connection: idb.IDBPDatabase<ProductDB> | undefined = undefined
  migrationHistory: migrationArray = [
    [
      {type: MigrationType.fieldAdded, field: 'name', defaultValue: 'default'},
      {type: MigrationType.fieldAdded, field: 'price', defaultValue: 0},
      {type: MigrationType.fieldAdded, field: 'date', defaultValue: new Date()},
      {type: MigrationType.indexAdded, field: 'price', indexName: 'price_idx'}
    ]
  ]
  defaultProducts: Product[] = [
    {name: 'Rtx 2060', price: 120000, date: new Date('14-07-2022')},
    {name: 'Rtx 2070', price: 190000, date: new Date('10-02-2022')},
    {name: 'Rtx 2080', price: 300000, date: new Date('13-07-2022')},
    {name: 'Radeon 7890', price: 45999, date: new Date('01-01-2022')},
  ]

  async init(): Promise<void> {
    await this.openDb('online-store-1dadw123ds');
    await this.syncProducts();
  }

  async syncProducts(): Promise<void> {
    if (!this.connection) throw new Error("Db is not initialised before product sync");
    await this.connection.clear('products');
    // Should I actually type-hint cases like this?
    const tx = this.connection.transaction('products', 'readwrite');
    let promises: Promise<void | string>[] = this.defaultProducts.map(prod => tx.store.add(prod));
    promises.push(tx.done);
    await Promise.all(promises);
  }

  async applyMigration(db: IDBPDatabase<ProductDB>,
                       store: productStore,
                       migration: BaseMigration): Promise<void> {
    switch (migration.type) {
      case MigrationType.fieldAdded:
        const fieldMigration = migration as FieldAddedMigration;
        // Logic for updating existing objects: adding field with default value
        break;
      case MigrationType.fieldRemoved:
        // Logic for removing field from existing objects and maybe changing keys (if possible)
        break;
      case MigrationType.indexAdded:
        const indexMigration = migration as IndexMigration;
        // @ts-ignore Supress indexMigration.field not known at compile time to be === 'price_idx'.
        store.createIndex(indexMigration.field, indexMigration.indexName);
        break;
      case MigrationType.indexRemoved:
        const indexRemovedMigration = migration as IndexMigration;
        store.deleteIndex(indexRemovedMigration.indexName);
    }
  }

  async openDb(name: string): Promise<void> {
    const self: DbController = this;
    this.connection = await idb.openDB<ProductDB>(name, this.version, {
      async upgrade(db, oldVersion: number, newVersion: number | null) {
        if (newVersion) {
          let productStore: productStore | undefined = undefined;
          if (!db.objectStoreNames.contains('products'))
            productStore = db.createObjectStore('products', {keyPath: self.storageKey});
          else {
            const tx = db.transaction(['products'], 'versionchange');
            productStore = tx.store;
          }
          const requiredMigrations: migrationArray = self.migrationHistory.slice(oldVersion, newVersion - 1);
          await Promise.all(requiredMigrations.flat(2).map(migration => self.applyMigration(db, assertDefined(productStore), migration)));
        }
      }
    });
  }

  async getProducts(/* filters and sort here later */): Promise<Product[] | undefined> {
    // const tx = this.connection?.transaction(['products'], 'readonly');
    return this.connection?.getAll('products');
  }
}