// Cart controller.
// Provides adding and removing items to cart
// Storage - localStorage

import { Product } from './dbController';

export type ProductInCart = { product: Product; amount: number };

// Inherit Element to gain access to event dispatching. Is there a better way? This seems hacky
export default class CartController {
    #productsInCart: ProductInCart[] = [];

    addProduct(newProduct: Product): void {
        console.log('Added');
        const relatedEntries: ProductInCart[] = this.#productsInCart.filter(
            (entry) => entry.product.name === newProduct.name
        );
        if (relatedEntries.length > 0) relatedEntries[0].amount += 1;
        else {
            console.log(this.#productsInCart.length);
            if (this.#productsInCart.length === 20)
                throw new Error('Sorry, but there are no slots left in cart (only 20 unique items allowed)');
            this.#productsInCart.push({ product: newProduct, amount: 1 });
        }
    }

    removeProduct(toRemove: Product): void {
        console.log('Removed');
        const relatedEntries: ProductInCart[] = this.#productsInCart.filter(
            (entry) => entry.product.name === toRemove.name
        );
        if (relatedEntries.length > 0) {
            relatedEntries[0].amount -= 1;
            if (relatedEntries[0].amount <= 0)
                this.#productsInCart = this.#productsInCart.filter((entry) => entry.product.name !== toRemove.name);
        } else throw new Error('You cannot remove that which is not added');
    }

    // emitChangeEvent(): void {
    //   const e: CustomEvent<ProductInCart[]> = new CustomEvent("cartUpdate",
    //     {
    //       cancelable: true,
    //       detail: this.#productsInCart
    //     });
    //   this.dispatchEvent(e);
    // }

    get cart(): ProductInCart[] {
        return this.#productsInCart;
    }

    set cart(products: ProductInCart[]) {
        this.#productsInCart = products;
    }

    getAmountOfProduct(productName: string): number {
        const related: ProductInCart[] = this.#productsInCart.filter(entry => entry.product.name === productName);
        if (related.length > 0) return related[0].amount;
        return 0;
    }
}
