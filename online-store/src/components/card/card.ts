// Card web-component to use in catalog
// Supports addToCart and removeFromCart events (increasing and decreasing amount of product in cart)
import './card.css';

import { Product } from '../../controllers/dbController';
import { assertDefined } from '../../controllers/dbController';
import CartController from '../../controllers/cartController';

const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML = `
    <img class="product-card__image">
    <div class="product-card__header">
      <h3 class="product-card__name"></h3>
    </div>
    <h5 class="product-card__maker"></h5>
    <div class="product-card__info"></div>
    <div class="product-card__footer">
      <div class="product-card__stock"> 0 </div>
      <div class="product-card__price"></div>
      <button class="product-card__button" data-target="cart">
        To cart
      </button>
      <div class="product-card__counter-container hidden">
        <button data-action="decrease" class="product-card__counter-button">-</button>
        <div class="product-card__counter"> 0 </div>
        <button data-action="increase" class="product-card__counter-button">+</button>
      </div>
    </div>
`;

class Card extends HTMLElement {
    #innerData: Product | null = null;
    #cartCount = 0;

    #imageElement: HTMLImageElement | null = null;
    #infoElement: HTMLElement | null = null;
    #counterElement: HTMLElement | null = null;
    #stockCounterElement: HTMLElement | null = null;
    #nameElement: HTMLHeadingElement | null = null;
    #priceElement: HTMLElement | null = null;
    #makerElement: HTMLHeadingElement | null = null;
    #cartButtonElement: HTMLButtonElement | null = null;
    #counterIncreaseButton: HTMLButtonElement | null = null;
    #counterDecreaseButton: HTMLButtonElement | null = null;
    #counterContainer: HTMLDivElement | null = null;

    #cartControllerReference: CartController | null = null;

    // tmp
    _shadowRoot: DocumentFragment | null = null;

    constructor(data: Product | null = null, cart: CartController | null = null) {
        super();

        this.#innerData = data;
        this.#cartControllerReference = cart;

        // Maybe use shadow dom when there is access to the internet (when it is clear
        // what to do with styles). For now just create document fragment and use it instead
        // this.attachShadow({mode: "open"});
        // if (this.shadowRoot === null)
        //   throw new Error("Could not create shadow root for card!");
        this.classList.add('product-card');
        this._shadowRoot = document.createDocumentFragment();
        this._shadowRoot.append(template.content.cloneNode(true));
        this.#imageElement = this._shadowRoot.querySelector('.product-card__image');
        this.#infoElement = this._shadowRoot.querySelector('.product-card__info');
        this.#counterElement = this._shadowRoot.querySelector('.product-card__counter');
        this.#counterContainer = this._shadowRoot.querySelector('.product-card__counter-container');
        this.#counterDecreaseButton = this._shadowRoot.querySelector(
            ".product-card__counter-button[data-action='decrease']"
        );
        this.#counterIncreaseButton = this._shadowRoot.querySelector(
            ".product-card__counter-button[data-action='increase']"
        );
        this.#stockCounterElement = this._shadowRoot.querySelector('.product-card__stock');
        this.#nameElement = this._shadowRoot.querySelector('.product-card__name');
        this.#priceElement = this._shadowRoot.querySelector('.product-card__price');
        this.#makerElement = this._shadowRoot.querySelector('.product-card__maker');
        this.#cartButtonElement = this._shadowRoot.querySelector(".product-card__button[data-target='cart']");

        this.append(this._shadowRoot);
        this.update();
    }

    update(): void {
        const data: Product | null = this.data;
        if (data === null) assertDefined(this.#nameElement).innerText = 'No data';
        else {
            assertDefined(this.#imageElement).src = data.image;
            assertDefined(this.#nameElement).innerText = data.name;
            assertDefined(this.#priceElement).innerText = data.price.toString();
            assertDefined(this.#makerElement).innerText = data.vendor;
            assertDefined(this.#infoElement).innerHTML = `
        Memory: ${data.memory}<br>
        Color: ${data.color}<br>
        Fans: ${data.fans}<br>
        Last restock: ${data.date.toLocaleDateString()}
      `;
            assertDefined(this.#stockCounterElement).innerText = `In stock: ${data.stock}`;
            assertDefined(this.#counterElement).innerText = this.#cartCount.toString();
            assertDefined(this.#cartButtonElement).addEventListener('click', () => this.emitAddToCart());
            assertDefined(this.#counterDecreaseButton).addEventListener('click', () => this.emitRemoveFromCart());
            assertDefined(this.#counterIncreaseButton).addEventListener('click', () => this.emitAddToCart());
        }
    }

    updateCounter(): void {
        assertDefined(this.#counterElement).innerText = this.#cartCount.toString();
    }

    emitAddToCart(): void {
        if (this.#innerData) {
            if (this.#cartCount === 0 && this.#cartControllerReference)
                if (this.#cartControllerReference.cart.length >= 20) {
                    // What is a better way to do this? Without breaking responsibilities?
                    alert('Sorry, but there are no slots left in cart (only 20 unique items allowed)');
                    return;
                }
            if (this.#cartCount + 1 <= this.#innerData.stock) this.#cartCount += 1;
            else {
                alert(`Cannot add item to cart: Only ${this.#innerData.stock} in stock!`);
                return;
            }
            this.updateCounter();
            if (this.#cartCount > 0) {
                assertDefined(this.#counterContainer).classList.remove('hidden');
                assertDefined(this.#cartButtonElement).classList.add('hidden');
            }
            const e: CustomEvent<Product> = new CustomEvent('addToCart', {
                bubbles: true,
                cancelable: true,
                detail: this.#innerData,
            });
            this.dispatchEvent(e);
        } else throw new Error('Trying to add null product to cart');
    }

    emitRemoveFromCart(): void {
        if (this.#innerData) {
            if (this.#cartCount > 0) this.#cartCount -= 1;
            this.updateCounter();
            if (this.#cartCount <= 0) {
                assertDefined(this.#counterContainer).classList.add('hidden');
                assertDefined(this.#cartButtonElement).classList.remove('hidden');
            }
            const e: CustomEvent<Product> = new CustomEvent('removeFromCart', {
                bubbles: true,
                cancelable: true,
                detail: this.#innerData,
            });
            this.dispatchEvent(e);
        } else throw new Error('Trying to remove null product from cart');
    }

    static get observedAttributes(): string[] {
        // List of observed custom attributes on component
        return [];
    }

    get data(): Product | null {
        return this.#innerData;
    }

    set data(data: Product | null) {
        this.#innerData = data;
        this.update();
    }

    get cartCount(): number {
        return this.#cartCount;
    }

    set cartCount(count: number) {
        this.#cartCount = count;
        this.update();
    }
}

export default Card;

customElements.define('product-card', Card);
