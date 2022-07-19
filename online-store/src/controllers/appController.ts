// Main app controller. Connects different parts of app together
import DbController from './dbController';
import { Product } from './dbController';
import CatalogView from '../views/catalogView';
import Sidebar, { FilterConfig, FilterState, SortConfig, SortState } from '../components/sidebar/sidebar';
import { FilterData } from '../components/value-filter/value-filter';
import CartController from './cartController';
import SearchBar from '../components/search-input/search-input';

export default class AppController {
    dbController: DbController = new DbController();
    cartController: CartController = new CartController();
    catalogView: CatalogView = new CatalogView();

    async init(): Promise<void> {
        await this.dbController.init();
        const filterConfig: FilterConfig = {
            valueFilters: await Promise.all(
                ['Vendor', 'Color', 'Memory', 'Fans'].map((field) => this.buildValueFilterFromField(field))
            ),
            rangeFilters: [],
        };
        const sortConfig: SortConfig = [
            {
                field: 'name',
                label: 'Name',
            },
            {
                field: 'price',
                label: 'Price',
            },
            {
                field: 'memory',
                label: 'Memory size',
            },
            {
                field: 'stock',
                label: 'Left in stock',
            },
            {
                field: 'date',
                label: 'Last restock',
            },
        ];
        const sidebar: Sidebar = this.catalogView.createSidebar(filterConfig, sortConfig);
        sidebar.addEventListener('filterUpdate', (e) =>
            this.showProducts(
                (e as CustomEvent<FilterState>).detail,
                sidebar.currentSortState,
                searchBar.currentSearchTerm
            )
        );
        sidebar.addEventListener('sortUpdate', (e) =>
            this.showProducts(
                sidebar.currentFilterState,
                (e as CustomEvent<SortState>).detail,
                searchBar.currentSearchTerm
            )
        );
        const searchBar: SearchBar = this.catalogView.createSearchBar();
        searchBar.addEventListener('search', (e: Event) =>
            this.showProducts(sidebar.currentFilterState, sidebar.currentSortState, (e as CustomEvent<string>).detail)
        );
    }

    async buildValueFilterFromField(field: string): Promise<FilterData> {
        return {
            label: field,
            options: (await this.dbController.getUniqueFieldValues<string>(field.toLowerCase())).map((value) => {
                return {
                    name: value,
                    value: value,
                };
            }),
        };
    }

    async showProducts(
        filters: FilterState | null = null,
        sort: SortState | null = null,
        searchTerm: string | null = null
    ): Promise<void> {
        const data: Product[] | undefined =
            filters || sort || searchTerm
                ? await this.dbController.getProductsByFilters(filters, sort, searchTerm)
                : await this.dbController.getProducts();
        this.catalogView.showProducts(data, this);
    }

    productAddedToCart(e: Event): void {
        try {
            this.cartController.addProduct((e as CustomEvent<Product>).detail);
        } catch (e) {
            alert(e);
        }
    }

    productRemovedFromCart(e: Event): void {
        try {
            this.cartController.removeProduct((e as CustomEvent<Product>).detail);
        } catch (e) {
            alert(e);
        }
    }
}
