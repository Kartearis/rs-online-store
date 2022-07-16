// Product database controller
// Provides local storage and db management for products
// Also makes filtered, searched and sorted requests to database
// Storage engine - indexedDB

import * as idb from 'idb';
import { IDBPDatabase } from "idb";
import products from './products';

export function assertDefined<Type>(value: Type): NonNullable<Type> {
  if (value === undefined || value === null)
    throw new Error("Value is undefined!");
  return value as NonNullable<Type>;
}

interface ProductJson{
  name: string,
  price: number,
  vendor: string,
  memory: string,
  color: string,
  stock: number,
  image: string,
  date: string | Date
}

export interface Product extends ProductJson{
  name: string,
  price: number,
  date: Date,
  // [x: string]: unknown // Use indexer to set fields with migrations
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

type Transaction<Mode extends "versionchange" | "readonly" | "readwrite"> = idb.IDBPTransaction<ProductDB, ["products"], Mode>

// type migrationArray = BaseMigration[][];
type migrationArray = (BaseMigration | IndexMigration | FieldAddedMigration)[][];

type productStore = idb.IDBPObjectStore<ProductDB, ArrayLike<"products">, "products", "versionchange">;

export default class DbController {
  // Actually set in constructor
  version: number = 1
  storageKey: string = 'name'
  connection: idb.IDBPDatabase<ProductDB> | undefined = undefined
  migrationHistory: migrationArray = [
    [
      {type: MigrationType.fieldAdded, field: 'name', defaultValue: 'default'},
      {type: MigrationType.fieldAdded, field: 'price', defaultValue: 0},
      {type: MigrationType.fieldAdded, field: 'date', defaultValue: new Date()},
      {type: MigrationType.indexAdded, field: 'price', indexName: 'price_idx'}
    ],
    [
      {type: MigrationType.fieldAdded, field: 'vendor', defaultValue: 'default'},
      {type: MigrationType.fieldAdded, field: 'memory', defaultValue: 'default'},
      {type: MigrationType.fieldAdded, field: 'color', defaultValue: 'default'},
      {type: MigrationType.fieldAdded, field: 'stock', defaultValue: 0},
    ],
    [
      {type: MigrationType.fieldAdded, field: 'image', defaultValue: '../assets/images/placeholder.png'},
    ]
  ]
  defaultProducts: Product[] = products

  constructor() {
    this.version = this.migrationHistory.length;
  }

  async init(): Promise<void> {
    await this.openDb('online-store-1dadw123ds');
    await this.syncProducts();
  }

  async syncProducts(): Promise<void> {
    if (!this.connection) throw new Error("Db is not initialised before product sync");
    await this.connection.clear('products');
    // Should I actually type-hint cases like this?
    const tx: Transaction<"readwrite"> = this.connection.transaction('products', 'readwrite');
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
        // Problem is it works bad with TS (because I cannot (shouldn't) use incomplete types)
        // So for TS field migrations should be batched from all accumulated migrations and applied at once
        // For current project it is not necessary though, so migrations just do nothing. They would be required in
        // case of user-added products though.
        break;
      case MigrationType.fieldRemoved:
        // Logic for removing field from existing objects and maybe changing keys (if possible)
        // Same problem here
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
            const tx: Transaction<"versionchange"> = db.transaction(['products'], 'versionchange');
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