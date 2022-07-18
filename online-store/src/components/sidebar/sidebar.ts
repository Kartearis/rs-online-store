// Sidebar web-component
// Must support filter, order and reset events
import './sidebar.css';
import ValueFilter, { FilterData } from "../value-filter/value-filter";
import { assertDefined } from "../../controllers/dbController";

type ValueFilterState = Record<string, Record<string, boolean>>;

export interface FilterConfig {
  valueFilters: FilterData[],
  rangeFilters: unknown[] // tmp
}

const template: HTMLTemplateElement = document.createElement("template");
template.innerHTML = `
  <h3>Filters</h3>
  <div class="sidebar__value-filter-container"></div>
  <div class="sidebar__range-filter-container"></div>
  <button class="sidebar__reset">Reset</button>
  <h3>Sort</h3>
  <button class="sidebar__sort_button">Sort up</button>
  <button class="sidebar__sort_button">Sort down</button>
`;

class Sidebar extends HTMLElement {
  #valueFilters: FilterData[] | null = null

  #filterState: ValueFilterState

  _shadowRoot: DocumentFragment | null = null
  #resetButton: HTMLButtonElement | null = null
  #valueFilterContainer: HTMLElement | null = null

  constructor(filterConfig: FilterConfig) {
    super();
    this.#valueFilters = filterConfig.valueFilters;
    this.#filterState = {

    };

    this.classList.add('sidebar');
    this._shadowRoot = document.createDocumentFragment();
    this._shadowRoot.append(template.content.cloneNode(true));
    this.#valueFilterContainer = this._shadowRoot.querySelector('.sidebar__value-filter-container');
    this.#resetButton= this._shadowRoot.querySelector('.sidebar__reset');

    this.#resetButton?.addEventListener('click', () => this.reset());

    this.append(this._shadowRoot);
    this.update();
  }

  createValueFilter(data: FilterData): void {
    const filterElement = new ValueFilter(data);
    assertDefined(this.#valueFilterContainer).append(filterElement);
  }

  update(): void {
    if (this.#valueFilterContainer) this.#valueFilterContainer.innerHTML = "";
    this.#valueFilters?.forEach(filter => this.createValueFilter(filter));
  }

  reset(): void {

  }
}

export default Sidebar;

customElements.define("filter-sidebar", Sidebar);