// Cart controller.
// Provides adding and removing items to cart
// Storage - localStorage

import { Product } from "./dbController";

type ProductInCart = {product: Product, amount: number};

// Inherit Element to gain access to event dispatching. Is there a better way? This seems hacky
export default class CartController extends Element{
  #productsInCart: ProductInCart[] = []

  addProduct(newProduct: Product): void {
    const relatedEntries: ProductInCart[] = this.#productsInCart.filter(entry => entry.product.name === newProduct.name);
    if (relatedEntries.length > 0)
      relatedEntries[0].amount += 1;
    else this.#productsInCart.push({product: newProduct, amount: 1});
  }

  removeProduct(toRemove: Product): void {
    const relatedEntries: ProductInCart[] = this.#productsInCart.filter(entry => entry.product.name === toRemove.name);
    if (relatedEntries.length > 0) {
      relatedEntries[0].amount -= 1;
      if (relatedEntries[0].amount <= 0)
        this.#productsInCart = this.#productsInCart.filter(entry => entry.product.name !== toRemove.name);
    }
    else throw new Error("You cannot remove that which is not added");
  }

  emitChangeEvent(): void {
    const e: CustomEvent<ProductInCart[]> = new CustomEvent("cartUpdate",
      {
        cancelable: true,
        detail: this.#productsInCart
      });
    this.dispatchEvent(e);
  }

  get cart(): ProductInCart[] {
    return this.#productsInCart;
  }
}