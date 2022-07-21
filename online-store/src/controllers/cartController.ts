// Cart controller.
// Provides adding and removing items to cart
// Storage - localStorage

import { Product } from './dbController';

export type ProductInCart = { product: Product; amount: number };

export default class CartController {
    #productsInCart: ProductInCart[] = [];
    #counterElement: HTMLElement

    constructor(counterElement: HTMLElement) {
        this.#counterElement = counterElement;
        this.updateCounter();
    }


    addProduct(newProduct: Product): void {
        const relatedEntries: ProductInCart[] = this.#productsInCart.filter(
            (entry) => entry.product.name === newProduct.name
        );
        if (relatedEntries.length > 0) relatedEntries[0].amount += 1;
        else {
            if (this.#productsInCart.length === 20)
                throw new Error('Sorry, but there are no slots left in cart (only 20 unique items allowed)');
            this.#productsInCart.push({ product: newProduct, amount: 1 });
        }
        this.updateCounter();
    }

    removeProduct(toRemove: Product): void {
        const relatedEntries: ProductInCart[] = this.#productsInCart.filter(
            (entry) => entry.product.name === toRemove.name
        );
        if (relatedEntries.length > 0) {
            relatedEntries[0].amount -= 1;
            if (relatedEntries[0].amount <= 0)
                this.#productsInCart = this.#productsInCart.filter((entry) => entry.product.name !== toRemove.name);
        } else throw new Error('You cannot remove that which is not added');
        this.updateCounter();
    }

    updateCounter(): void {
        this.#counterElement.innerText = `In cart: ${this.#productsInCart.length}`;
    }

    get cart(): ProductInCart[] {
        return this.#productsInCart;
    }

    set cart(products: ProductInCart[]) {
        this.#productsInCart = products;
        this.updateCounter();
    }

    getAmountOfProduct(productName: string): number {
        const related: ProductInCart[] = this.#productsInCart.filter((entry) => entry.product.name === productName);
        if (related.length > 0) return related[0].amount;
        return 0;
    }
}
