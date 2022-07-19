// Search web-component
// Must support search and reset events

import styles from './search-input.local.css';
import { assertDefined, Product } from "../../controllers/dbController";


const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML = `
  <input type="search" class="search-input__input" placeholder="Enter query and press Enter..." autocomplete="false" autofocus>
`;

const style: HTMLStyleElement = document.createElement("style");
style.innerHTML = styles.toString();

class SearchBar extends HTMLElement {

  #inputElement: HTMLInputElement

  constructor() {
    super();
    this.attachShadow({mode: "open"});
    if (this.shadowRoot === null)
      throw new Error("Could not create shadow root for card!");
    this.classList.add('search-input');
    this.shadowRoot.append(template.content.cloneNode(true));
    this.shadowRoot.append(style.cloneNode(true));
    this.#inputElement = assertDefined(this.shadowRoot.querySelector('.search-input__input'));
    // It would be better to listen for change event, but in that case event batching is required,
    // so that event is only sent when user stops input
    this.#inputElement.addEventListener('search', (e: Event) => this.emitSearchEvent(e));

    this.update();
  }

  emitSearchEvent(e: Event): void {
    const ev: CustomEvent<string> = new CustomEvent('search', {
      cancelable: true,
      detail: (e.target as HTMLInputElement).value
    });
    this.dispatchEvent(ev);
  }

  update(): void {
    // Empty
  }

  get currentSearchTerm(): string {
    return this.#inputElement.value;
  }
}

export default SearchBar;

customElements.define('search-input', SearchBar);
