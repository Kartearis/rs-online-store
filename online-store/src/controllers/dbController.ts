// Product database controller
// Provides local storage and db management for products
// Also makes filtered, searched and sorted requests to database
// Storage engine - indexedDB

import * as idb from 'idb';
import { IDBPDatabase } from 'idb';
import products from './products';
import { FilterState, SortState } from '../components/sidebar/sidebar';

export function assertDefined<Type>(value: Type): NonNullable<Type> {
    if (value === undefined || value === null) throw new Error('Value is undefined!');
    return value as NonNullable<Type>;
}

interface ProductJson {
    name: string;
    price: number;
    vendor: string;
    memory: number;
    color: string;
    stock: number;
    image: string;
    date: string | Date;
    fans: string;
}

export interface Product extends ProductJson {
    date: Date;
    [x: string]: Product[keyof Product]; // Use indexer to make fields accessible by string
}

interface ProductDB extends idb.DBSchema {
    products: {
        value: Product;
        key: string;
        // Maybe indexes could be built with ts object building?
        indexes: {
            price_idx: number;
            vendor_idx: string;
            color_idx: string;
            date_idx: Date;
            stock_idx: number;
            memory_idx: number;
            fans_idx: string;
        };
    };
}

enum MigrationType {
    fieldAdded,
    fieldRemoved,
    indexAdded,
    indexRemoved,
}
// Utility type to remove index signature from type
type RemoveIndex<T> = {
    [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K];
};

interface BaseMigration {
    type: MigrationType;
    field: keyof RemoveIndex<Product>;
}

interface FieldAddedMigration extends BaseMigration {
    defaultValue: unknown;
}

interface IndexMigration extends BaseMigration {
    indexName: keyof ProductDB['products']['indexes'];
}

type Transaction<Mode extends 'versionchange' | 'readonly' | 'readwrite'> = idb.IDBPTransaction<
    ProductDB,
    ['products'],
    Mode
>;

type migrationArray = (BaseMigration | IndexMigration | FieldAddedMigration)[][];

type productStore = idb.IDBPObjectStore<ProductDB, ArrayLike<'products'>, 'products', 'versionchange'>;

function checkIfValidIndexName(
    index: string,
    migrations: migrationArray
): index is keyof ProductDB['products']['indexes'] {
    return (
        migrations
            .flat(2)
            .filter(
                (migration) =>
                    migration.type === MigrationType.indexAdded && (migration as IndexMigration).indexName === index
            ).length > 0
    );
}

export default class DbController {
    // Actually set in constructor
    version = 1;
    storageKey = 'name';
    connection: idb.IDBPDatabase<ProductDB> | undefined = undefined;
    migrationHistory: migrationArray = [
        [
            { type: MigrationType.fieldAdded, field: 'name', defaultValue: 'default' },
            { type: MigrationType.fieldAdded, field: 'price', defaultValue: 0 },
            { type: MigrationType.fieldAdded, field: 'date', defaultValue: new Date() },
        ],
        [
            { type: MigrationType.fieldAdded, field: 'vendor', defaultValue: 'default' },
            { type: MigrationType.fieldAdded, field: 'memory', defaultValue: 'default' },
            { type: MigrationType.fieldAdded, field: 'color', defaultValue: 'default' },
            { type: MigrationType.fieldAdded, field: 'stock', defaultValue: 0 },
        ],
        [{ type: MigrationType.fieldAdded, field: 'image', defaultValue: '../assets/images/placeholder.png' }],
        // Empty migrations to compensate for versioning bug-fixes
        [],
        [],
        [],
        [],
        [],
        [],
        [
            { type: MigrationType.indexAdded, field: 'vendor', indexName: 'vendor_idx' },
            { type: MigrationType.indexAdded, field: 'date', indexName: 'date_idx' },
            { type: MigrationType.indexAdded, field: 'memory', indexName: 'memory_idx' },
            { type: MigrationType.indexAdded, field: 'color', indexName: 'color_idx' },
            { type: MigrationType.indexAdded, field: 'stock', indexName: 'stock_idx' },
        ],
        [{ type: MigrationType.indexAdded, field: 'price', indexName: 'price_idx' }],
        [
            { type: MigrationType.fieldAdded, field: 'fans', defaultValue: 'none' },
            { type: MigrationType.indexAdded, field: 'fans', indexName: 'fans_idx' },
        ],
        [
            { type: MigrationType.indexRemoved, field: 'memory', indexName: 'memory_idx' },
            { type: MigrationType.indexAdded, field: 'memory', indexName: 'memory_idx' },
        ],
    ];
    defaultProducts: Product[] = products;

    constructor() {
        this.version = this.migrationHistory.length;
    }

    async init(): Promise<void> {
        await this.openDb('online-store-1dadw123ds');
        await this.syncProducts();
    }

    async syncProducts(): Promise<void> {
        if (!this.connection) throw new Error('Db is not initialised before product sync');
        await this.connection.clear('products');
        // Should I actually type-hint cases like this?
        const tx: Transaction<'readwrite'> = this.connection.transaction('products', 'readwrite');
        const promises: Promise<void | string>[] = this.defaultProducts.map((prod) => tx.store.add(prod));
        promises.push(tx.done);
        await Promise.all(promises);
    }

    async applyMigration(db: IDBPDatabase<ProductDB>, store: productStore, migration: BaseMigration): Promise<void> {
        switch (migration.type) {
            case MigrationType.fieldAdded:
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
                store.createIndex(indexMigration.indexName, indexMigration.field);
                break;
            case MigrationType.indexRemoved:
                const indexRemovedMigration = migration as IndexMigration;
                store.deleteIndex(indexRemovedMigration.indexName);
        }
    }

    async openDb(name: string): Promise<void> {
        this.connection = await idb.openDB<ProductDB>(name, this.version, {
            upgrade: async (db: IDBPDatabase<ProductDB>, oldVersion: number, newVersion: number | null, tx) => {
                if (newVersion) {
                    let productStore: productStore | undefined = undefined;
                    if (!db.objectStoreNames.contains('products'))
                        productStore = db.createObjectStore('products', { keyPath: this.storageKey });
                    else {
                        productStore = tx.store;
                    }
                    const requiredMigrations: migrationArray = this.migrationHistory.slice(oldVersion, newVersion);
                    await Promise.all(
                        requiredMigrations
                            .flat(2)
                            .map((migration) => this.applyMigration(db, assertDefined(productStore), migration))
                    );
                    await tx.done;
                }
            },
        });
    }

    async getProducts(/* filters and sort here later */): Promise<Product[] | undefined> {
        // const tx = this.connection?.transaction(['products'], 'readonly');
        return this.connection?.getAll('products');
    }

    async getUniqueFieldValues<Type extends string | number | Date>(field: keyof Product): Promise<Type[]> {
        const tx: Transaction<'readonly'> = assertDefined(this.connection).transaction('products', 'readonly');
        const objectsByField: Product[] = await tx
            .objectStore('products')
            .index((field + '_idx') as keyof ProductDB['products']['indexes'])
            .getAll();
        return Array.from(new Set(objectsByField.map((product) => product[field] as Type)));
    }

    async getBoundariesForField<Type extends string | number | Date>(field: keyof Product): Promise<{min: Type, max: Type}> {
        const tx: Transaction<'readonly'> = assertDefined(this.connection).transaction('products', 'readonly');
        // Use simple way - get all objects and receive value of first and last.
        // It would be more effective to use cursor and get only first and last elements
        const objectsByField: Product[] = await tx
          .objectStore('products')
          .index((field + '_idx') as keyof ProductDB['products']['indexes'])
          .getAll();
        if (objectsByField.length > 0)
            return {min: objectsByField[0][field] as Type, max: objectsByField[objectsByField.length - 1][field] as Type};
        else throw new Error("Could not get field boundaries: no data");
    }

    async getProductsByFilters(
        filters: FilterState | null,
        sort: SortState | null,
        searchTerm: string | null
    ): Promise<Product[]> {
        // For large dbs using several indexes and merging resulting arrays may be faster?
        // But I will go with simpler solution: getAll objects by sorting index then filter
        // them with Array.filter
        // For now assume sorting by name (later just use suitable index)
        const tx: Transaction<'readonly'> = assertDefined(this.connection).transaction('products', 'readonly');
        let allProducts: Product[] = [];
        let direction = 'up';
        if (sort) {
            direction = sort.direction;
            const indexName = sort.field + '_idx';
            if (sort.field !== 'name' && checkIfValidIndexName(indexName, this.migrationHistory))
                allProducts = await tx.objectStore('products').index(indexName).getAll();
            else allProducts = await tx.objectStore('products').getAll();
        } else allProducts = await tx.objectStore('products').getAll();
        if (filters) {
            for (const state of Object.entries(filters.valueFilterState)) {
                if (state[1].length === 0) continue;
                allProducts = allProducts.filter((product) => state[1].includes(product[state[0]].toString()));
            }
            for (const state of Object.entries(filters.rangeFilterState)) {
                allProducts = allProducts.filter((product) =>
                  state[1].min <= product[state[0]] && product[state[0]] <= state[1].max);
            }
        }
        if (searchTerm && searchTerm.length > 0)
            allProducts = allProducts.filter((product) =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        // Here filter with range filters
        ////////
        return direction === 'up' ? allProducts : allProducts.reverse();
    }
}
