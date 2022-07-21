// Main app controller. Connects different parts of app together
import DbController, { assertDefined } from "./dbController";
import { Product } from './dbController';
import CatalogView from '../views/catalogView';
import Sidebar, { FilterConfig, FilterState, SortConfig, SortState } from '../components/sidebar/sidebar';
import { FilterData as ValueFilterData } from '../components/value-filter/value-filter';
import { FilterData as RangeFilterData } from '../components/range-filter/range-filter';
import CartController, { ProductInCart } from './cartController';
import SearchBar from '../components/search-input/search-input';
import UserDataController from './userDataController';

export default class AppController {
    dbController: DbController = new DbController();
    cartController: CartController = new CartController(assertDefined(document.querySelector(".cart-counter")));
    catalogView: CatalogView = new CatalogView();
    userDataController: UserDataController = new UserDataController('online-store');

    async init(): Promise<void> {
        await this.dbController.init();
        const filterConfig: FilterConfig = {
            valueFilters: await Promise.all(
                ['Vendor', 'Color', 'Memory', 'Fans'].map((field) => this.buildValueFilterFromField(field))
            ),
            rangeFilters: await Promise.all(['Stock', 'Price'].map((field) => this.buildRangeFilterFromField(field))),
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
        sidebar.addEventListener('hardReset', () => {
            this.cartController.cart = [];
            searchBar.currentSearchTerm = '';
            sidebar.reset(false);
            sidebar.resetSort();
            this.showProducts(null, null, null);
            this.userDataController.clearData();
        });

        this.loadUserData(sidebar, searchBar);
        await this.showProducts(sidebar.currentFilterState, sidebar.currentSortState, searchBar.currentSearchTerm);
    }

    loadUserData(sidebar: Sidebar, searchBar: SearchBar): void {
        const term: string | null = this.userDataController.loadSearchTerm();
        if (term) searchBar.currentSearchTerm = term;
        const filters: FilterState | null = this.userDataController.loadFilters();
        if (filters) sidebar.currentFilterState = filters;
        const sort: SortState | null = this.userDataController.loadSort();
        if (sort) sidebar.currentSortState = sort;
        const cart: ProductInCart[] | null = this.userDataController.loadCart();
        if (cart) this.cartController.cart = cart;
    }

    saveUserData(filters: FilterState | null, sort: SortState | null, searchTerm: string | null): void {
        if (filters) this.userDataController.saveFilters(filters);
        if (sort) this.userDataController.saveSort(sort);
        if (searchTerm !== null) this.userDataController.saveSearchTerm(searchTerm);
    }

    async buildValueFilterFromField(field: string): Promise<ValueFilterData> {
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

    async buildRangeFilterFromField(field: string): Promise<RangeFilterData> {
        const boundaries: { min: number; max: number } = await this.dbController.getBoundariesForField(
            field.toLowerCase()
        );
        return {
            label: field,
            min: boundaries.min,
            max: boundaries.max,
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
        this.saveUserData(filters, sort, searchTerm);
    }

    productAddedToCart(e: Event): void {
        try {
            this.cartController.addProduct((e as CustomEvent<Product>).detail);
            this.userDataController.saveCart(this.cartController.cart);
        } catch (e) {
            alert(e);
        }
    }

    productRemovedFromCart(e: Event): void {
        try {
            this.cartController.removeProduct((e as CustomEvent<Product>).detail);
            this.userDataController.saveCart(this.cartController.cart);
        } catch (e) {
            alert(e);
        }
    }
}
