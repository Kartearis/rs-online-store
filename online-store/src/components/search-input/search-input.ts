// Search web-component
// Must support search and reset events

import styles from './search-input.local.css';
import { assertDefined } from "../../controllers/dbController";


const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML = `
  <input type="search" class="search-input__input" placeholder="Search..." autocomplete="false" autofocus>
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

    this.update();
  }

  update(): void {

  }
}

export default SearchBar;

customElements.define('search-input', SearchBar);
