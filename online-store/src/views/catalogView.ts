// Contains logic to display card components in catalog
import { Product } from '../controllers/dbController';
import Card from '../components/card/card';
import Sidebar, { FilterConfig, SortConfig } from '../components/sidebar/sidebar';
import { assertDefined } from '../controllers/dbController';

import './catalog-view.css';
import AppController from '../controllers/appController';
import SearchBar from '../components/search-input/search-input';
import { ProductInCart } from "../controllers/cartController";

export default class CatalogView {
    sidebar: Sidebar | null = null;
    searchBar: SearchBar | null = null;

    createSidebar(sidebarConfig: FilterConfig, sortConfig: SortConfig): Sidebar {
        this.sidebar = new Sidebar(sidebarConfig, sortConfig);
        assertDefined(document.querySelector('main .sidebar-container')).append(this.sidebar);
        return this.sidebar;
    }

    createSearchBar(): SearchBar {
        this.searchBar = new SearchBar();
        assertDefined(document.querySelector('header .search-bar-container')).append(this.searchBar);
        return this.searchBar;
    }

    showAlert(alert: string): void {
        const alertElement: HTMLDivElement = document.createElement('div');
        alertElement.classList.add('card-container__alert');
        alertElement.innerText = alert;
        assertDefined(document.querySelector('main .card-container')).innerHTML = '';
        assertDefined(document.querySelector('main .card-container')).append(alertElement);
    }

    showProducts(data: Product[] | undefined, appController: AppController): void {
        if (data === undefined || data.length === 0) {
            this.showAlert('No items matching filters');
            return;
        }
        const fragment: DocumentFragment = document.createDocumentFragment();
        data.forEach((value) => {
            const card: Card = new Card(value, appController.cartController);
            card.cartCount = appController.cartController.getAmountOfProduct(value.name);
            fragment.append(card);
        });
        const container: HTMLElement = assertDefined(document.querySelector('main .card-container'));
        container.innerHTML = '';
        container.append(fragment);
        container.addEventListener('addToCart', (e: Event) => appController.productAddedToCart(e));
        container.addEventListener('removeFromCart', (e: Event) => appController.productRemovedFromCart(e));
    }
}
