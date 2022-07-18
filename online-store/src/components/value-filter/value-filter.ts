// Component to select filter by value
import './value-filter.css';
import { assertDefined } from "../../controllers/dbController";

const template: HTMLTemplateElement = document.createElement("template");
template.innerHTML = `
    <label class="value-filter__label"></label>
    <button class="value-filter__reset">x</button>
    <div class="value-filter__option-container"></div>
`;

type Option = {name: string, value: string};

export interface FilterData {
  label: string,
  options: Option[]
}

export type FilterState = (string | undefined)[]
export type StateData = {label: Lowercase<string>, state: FilterState}

let nextId: number = 0;

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
    const optionBlock: HTMLElement = document.createElement("div");
    const optionCheckbox: HTMLInputElement = document.createElement("input");
    const optionId: string = "value-filter-option--" + nextId;
    nextId += 1;
    optionCheckbox.type = 'checkbox';
    optionCheckbox.id = optionId;
    optionCheckbox.name = assertDefined(this.#innerData).label;
    optionCheckbox.dataset['value'] = option.value ?? option.name;
    optionCheckbox.classList.add('value-filter__option');
    const optionLabel = document.createElement("label");
    optionLabel.innerText = option.name;
    optionLabel.setAttribute("for", optionId);
    optionLabel.classList.add('value-filter__option-label')
    optionBlock.append(optionCheckbox);
    optionBlock.append(optionLabel);
    optionCheckbox.addEventListener('change', () => this.optionSelected(optionCheckbox));
    this.#optionContainer?.append(optionBlock);
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
    assertDefined(this.#optionContainer).querySelectorAll(".value-filter__option:checked")
      .forEach(element => (element as HTMLInputElement).checked = false);
    this.emitEvent([]);
  }

  optionSelected(optionElement: HTMLInputElement): void {
    const options: NodeListOf<Element> = assertDefined(this.#optionContainer).querySelectorAll(".value-filter__option:checked");
    const selected: FilterState = Array.from(options).map(element => (element as HTMLInputElement).dataset['value']);
    this.emitEvent(selected);
  }

  emitEvent(selectedValues: (string | undefined)[]): void {
    const e: CustomEvent<StateData> = new CustomEvent("FilterSelected",
      {
        cancelable: true,
        detail: {
          label: assertDefined(this.#innerData).label.toLowerCase(),
          state: selectedValues
        }
      });
    this.dispatchEvent(e);
  }

  getDefaultStateData(): StateData {
    return {
      label: assertDefined(this.#innerData).label.toLowerCase(),
      state: []
    };
  }

  getCurrentStateData(): StateData {
    const options: NodeListOf<Element> = assertDefined(this.#optionContainer).querySelectorAll(".value-filter__option:checked");
    const selected: FilterState = Array.from(options).map(element => (element as HTMLInputElement).dataset['value']);
    return {
      label: assertDefined(this.#innerData).label.toLowerCase(),
      state: selected
    };
  }

  get label(): string | undefined {
    return this.#innerData?.label;
  }

  set label(data: string | undefined) {
    if (data)
      assertDefined(this.#innerData).label = data;
  }
}

export default ValueFilter;

customElements.define("value-filter", ValueFilter);