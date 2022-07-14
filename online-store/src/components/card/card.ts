// Card web-component to use in catalog
// Supports addToCart and removeFromCart events (increasing and decreasing amount of product in cart)

import { Product } from "../../controllers/dbController";
import { assertDefined } from "../../controllers/dbController";

const template: HTMLTemplateElement = document.createElement("template");
template.innerHTML = `
  <div class="product-card">
    <img class="product-card__image">
    <div class="product-card__info"></div>
    <div class="product-card__footer">
      <div class="product-card__counter"> 0 </div>
      <button class="product-card__button" data-target="cart">To cart</button>
    </div>
  </div>
`;

class Card extends HTMLElement {

  #innerData: Product | null = null
  #cartCount: number = 0

  #imageElement: HTMLImageElement | null = null
  #infoElement: HTMLElement | null = null
  #counterElement: HTMLElement | null = null
  #cartButtonElement: HTMLButtonElement | null = null


  constructor(data: Product | null = null) {
    super();

    this.#innerData = data;

    this.attachShadow({mode: "open"});
    if (this.shadowRoot === null)
      throw new Error("Could not create shadow root for card!");
    this.shadowRoot.append(template.content.cloneNode(true));
    this.#imageElement = this.shadowRoot.querySelector(".product-card__footer");
    this.#infoElement = this.shadowRoot.querySelector(".product-card__info");
    this.#counterElement = this.shadowRoot.querySelector(".product-card__counter");
    this.#cartButtonElement = this.shadowRoot.querySelector(".product-card__button [data-target='cart']");

    this.update();
  }

  update(): void {
    let data: Product | null = this.data;
    if (data === null)
      data = {
        name: 'Default',
        price: 0,
        date: new Date()
      };
    assertDefined(this.#infoElement).innerHTML = `
      ${data.name} <br>
      ${data.price} <br>
      ${data.date}
    `;
    assertDefined(this.#counterElement).innerText = "" + this.#cartCount;
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
