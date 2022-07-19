import { FilterState, SortState } from "../components/sidebar/sidebar";
import { ProductInCart } from "./cartController";


export default class UserDataController {

  #storage: Storage
  #appName: string

  constructor(appName: string) {
    this.#appName = appName + "_asd123fsdfadqwkdfnskflsfsad23";
    this.#storage = window.localStorage;
  }

  saveFilters(filters: FilterState): void {
    this.#storage.setItem(this.#appName + "_filters", JSON.stringify(filters));
  }

  saveSearchTerm(searchTerm: string): void {
    this.#storage.setItem(this.#appName + "_search", searchTerm);
  }

  saveSort(sort: SortState): void {
    this.#storage.setItem(this.#appName + "_sort", JSON.stringify(sort));
  }

  saveCart(cart: ProductInCart[]): void {
    this.#storage.setItem(this.#appName + "_cart", JSON.stringify(cart));
  }

  loadFilters(): FilterState | null {
    const item: string | null = this.#storage.getItem(this.#appName + "_filters");
    return item ? JSON.parse(item) : null;
  }

  loadSort(): SortState | null {
    const item: string | null = this.#storage.getItem(this.#appName + "_sort");
    return item ? JSON.parse(item) : null;
  }

  loadSearchTerm(): string | null {
    const item: string | null = this.#storage.getItem(this.#appName + "_search");
    return item ? item : null;
  }

  loadCart(): ProductInCart[] | null {
    const item: string | null = this.#storage.getItem(this.#appName + "_cart");
    return item ? JSON.parse(item) : null;
  }

}