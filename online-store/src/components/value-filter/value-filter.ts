// Component to select filter by value
import './value-filter.css';
import { assertDefined } from "../../controllers/dbController";

const template: HTMLTemplateElement = document.createElement("template");
template.innerHTML = `
    <label class="value-filter__label"></label>
    <div class="value-filter__option-container"></div>
    <button class="value-filter__reset">x</button>
`;

type Option = {name: string, value: string};

export interface FilterData {
  label: string,
  options: Option[]
}

class ValueFilter extends HTMLElement {
  #innerData: FilterData | null = null
  _shadowRoot: DocumentFragment | null = null
  #labelElement: HTMLElement | null = null
  #optionContainer: HTMLElement | null = null
  #resetButton: HTMLButtonElement | null = null

  constructor(data: FilterData | null = null) {
    super();

    this.#innerData = data

    this.classList.add('value-filter');
    this._shadowRoot = document.createDocumentFragment();
    this._shadowRoot.append(template.content.cloneNode(true));
    this.#labelElement = this._shadowRoot.querySelector('.value-filter__label');
    this.#optionContainer = this._shadowRoot.querySelector('.value-filter__option-container');
    this.#resetButton= this._shadowRoot.querySelector('.value-filter__reset');

    this.#resetButton?.addEventListener('click', () => this.reset());

    this.append(this._shadowRoot);
    this.update();
  }

  createOption(option: Option): void {
    const optionElement = document.createElement("input");
    optionElement.innerText = option.name;
    optionElement.type = 'checkbox';
    optionElement.name = assertDefined(this.#innerData).label;
    optionElement.dataset['value'] = option.value;
    optionElement.classList.add('value-filter__option');
    optionElement.addEventListener('click', () => this.optionSelected(optionElement));
    this.#optionContainer?.append(optionElement);
  }

  update(): void {
    if (this.#innerData) {
      assertDefined(this.#labelElement).innerText = this.#innerData.label;
      // TODO: Save any state, e.g. selected filters, before cleaning
      assertDefined(this.#optionContainer).innerHTML = "";
      this.#innerData.options.forEach(option => this.createOption(option));
    }
  }

  reset(): void {

  }

  optionSelected(optionElement: HTMLInputElement): void {
    optionElement.setAttribute('checked', "checked");
    const options: NodeListOf<Element> = assertDefined(this.#optionContainer).querySelectorAll(".value-filter__option[checked]");
    const selected: (string | undefined)[] = Array.from(options).map(element => (element as HTMLInputElement).dataset['value']);
    const e: Event = new CustomEvent("FilterSelected", {cancelable: true, detail: selected});
    this.dispatchEvent(e);
  }
}

export default ValueFilter;

customElements.define("value-filter", ValueFilter);