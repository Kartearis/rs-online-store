import noUiSlider, { API, PipsMode } from "nouislider";
import "nouislider/dist/nouislider.css";
import "./range-filter.css";
import { assertDefined } from "../../controllers/dbController";

const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML = `
  <label class="range-filter__label"></label>
  <button class="range-filter__reset">x</button>
  <div class="range-filter__container"></div>
`;

export interface FilterData {
  label: string,
  min: number,
  max: number
}

export type FilterState = {min: number, max: number};
export type StateData = { label: Lowercase<string>; state: FilterState };

export default class RangeFilter extends HTMLElement {

  #container: HTMLDivElement
  #slider: API
  #config: FilterData
  #labelElement: HTMLElement
  #resetButton: HTMLButtonElement

  constructor(data: FilterData) {
    super();

    this.#config = data;
    this.classList.add('range-filter');
    const fragment: DocumentFragment = document.createDocumentFragment();
    fragment.append(template.content.cloneNode(true));

    this.#container = assertDefined(fragment.querySelector(".range-filter__container"));
    this.#labelElement = assertDefined(fragment.querySelector(".range-filter__label"));
    this.#resetButton = assertDefined(fragment.querySelector(".range-filter__reset"));

    this.#slider = noUiSlider.create(this.#container, {
      start: [this.#config.min, this.#config.max],
      connect: true,
      pips: {
        mode: PipsMode.Count,
        values: 3,
        density: 5
      },
      range: {
        'min': this.#config.min,
        'max': this.#config.max
      }
    });

    this.#labelElement.innerText = this.#config.label;
    this.#resetButton.addEventListener('click', () => this.reset());
    this.#slider.on('change', (values: (number | string)[], handle: number, unencoded: number[]) => this.emitEvent({min: unencoded[0], max: unencoded[1]}));
    this.append(fragment);
  }

  getDefaultStateData(): StateData {
    return {
      label: this.#config.label.toLowerCase(),
      state: {
        min: this.#config.min,
        max: this.#config.max
      }
    };
  }

  getCurrentStateData(): StateData {
    const values: number[] = this.#slider.get(true) as number[]; // Cast, as unencoded get is definetely number[]
    return {
      label: this.#config.label.toLowerCase(),
      state: {
        min: values[0],
        max: values[1]
      }
    };
  }

  setCurrentStateData(data: FilterState) {
    this.#slider.set([data.min, data.max]);
  }

  reset(emitEvent = true): void {
    this.#slider.set([this.#config.min, this.#config.max]);
    if (emitEvent) this.emitEvent({min: this.#config.min, max: this.#config.max});
  }

  emitEvent(boundaries: {min: number, max: number}): void {
    const e: CustomEvent<StateData> = new CustomEvent('FilterSelected', {
      cancelable: true,
      detail: {
        label: assertDefined(this.#config).label.toLowerCase(),
        state: boundaries
      },
    });
    this.dispatchEvent(e);
  }

  get label(): string {
    return this.#config.label;
  }

  set label(data: string) {
    if (data) this.#config.label = data;
  }
}

customElements.define('range-filter', RangeFilter);
