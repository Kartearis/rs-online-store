// Card web-component to use in catalog
// Supports addToCart and removeFromCart events (increasing and decreasing amount of product in cart)
import './card.css';

import { Product } from "../../controllers/dbController";
import { assertDefined } from "../../controllers/dbController";



const template: HTMLTemplateElement = document.createElement("template");
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
      <div class="product-card__counter hidden"> To cart </div> <!-- Change between text and amount if added to cart or not -->
    </div>
`;

class Card extends HTMLElement {

  #innerData: Product | null = null
  #cartCount: number = 0

  #imageElement: HTMLImageElement | null = null
  #infoElement: HTMLElement | null = null
  #counterElement: HTMLElement | null = null
  #stockCounterElement: HTMLElement | null = null
  #nameElement: HTMLHeadingElement | null = null
  #priceElement: HTMLElement | null = null
  #makerElement: HTMLHeadingElement | null = null
  #cartButtonElement: HTMLButtonElement | null = null

  // tmp
  _shadowRoot: DocumentFragment | null = null


  constructor(data: Product | null = null) {
    super();

    this.#innerData = data;

    // Maybe use shadow dom when there is access to the internet (when it is clear
    // what to do with styles). For now just create document fragment and use it instead
    // this.attachShadow({mode: "open"});
    // if (this.shadowRoot === null)
    //   throw new Error("Could not create shadow root for card!");
    this.classList.add('product-card');
    this._shadowRoot = document.createDocumentFragment();
    this._shadowRoot.append(template.content.cloneNode(true));
    this.#imageElement = this._shadowRoot.querySelector(".product-card__image");
    this.#infoElement = this._shadowRoot.querySelector(".product-card__info");
    this.#counterElement = this._shadowRoot.querySelector(".product-card__counter");
    this.#stockCounterElement = this._shadowRoot.querySelector(".product-card__stock");
    this.#nameElement = this._shadowRoot.querySelector(".product-card__name");
    this.#priceElement = this._shadowRoot.querySelector(".product-card__price");
    this.#makerElement = this._shadowRoot.querySelector(".product-card__maker");
    this.#cartButtonElement = this._shadowRoot.querySelector(".product-card__button [data-target='cart']");

    this.append(this._shadowRoot);
    this.update();
  }

  update(): void {
    let data: Product | null = this.data;
    if (data === null)
      assertDefined(this.#nameElement).innerText = "No data";
    else {
      console.log(data.image);
      assertDefined(this.#imageElement).src = data.image;
      assertDefined(this.#nameElement).innerText = data.name;
      assertDefined(this.#priceElement).innerText = data.price.toString();
      assertDefined(this.#makerElement).innerText = data.vendor;
      assertDefined(this.#infoElement).innerHTML = `
        Memory: ${data.memory}<br>
        Color: ${data.color}<br>
        Last restock: ${data.date.toLocaleDateString()}
      `;
      assertDefined(this.#stockCounterElement).innerText = `In stock: ${data.stock}`;
      assertDefined(this.#counterElement).innerText = this.#cartCount.toString();
    }
  }

  connectedCallback(): void {
    // Code to run on mount
  }

  static get observedAttributes(): string[] {
    // List of observed custom attributes on component
    return [];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    // Logic on attribute change
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

customElements.define("product-card", Card);
