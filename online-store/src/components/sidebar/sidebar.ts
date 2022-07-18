// Sidebar web-component
// Must support filter, order and reset events
import './sidebar.css';
import ValueFilter, {
  FilterData as ValueFilterData,
  StateData as ValueStateData,
  FilterState as ValueFilterState,
  StateData
} from "../value-filter/value-filter";
import { assertDefined } from "../../controllers/dbController";


export interface FilterConfig {
  valueFilters: ValueFilterData[],
  rangeFilters: unknown[] // tmp
}

export interface FilterState {
  valueFilterState: Record<string, ValueFilterState>,
  rangeFilterState: unknown
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
  #valueFilters: ValueFilterData[] | null = null
  #valueFilterRef: ValueFilter[] = []

  #filterState: FilterState

  _shadowRoot: DocumentFragment | null = null
  #resetButton: HTMLButtonElement | null = null
  #valueFilterContainer: HTMLElement | null = null

  constructor(filterConfig: FilterConfig) {
    super();
    this.#valueFilters = filterConfig.valueFilters;
    this.#filterState = {
      valueFilterState: {},
      rangeFilterState: {}
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

  createValueFilter(data: ValueFilterData): void {
    const filterElement: ValueFilter = new ValueFilter(data);
    const defaultFilterState: ValueStateData = filterElement.getDefaultStateData();
    this.#filterState.valueFilterState[defaultFilterState.label] = defaultFilterState.state;
    filterElement.addEventListener('FilterSelected', (e: Event) => this.valueFilterUpdated(e));
    this.#valueFilterRef.push(filterElement);
    assertDefined(this.#valueFilterContainer).append(filterElement);
  }

  update(): void {
    if (this.#valueFilterContainer) this.#valueFilterContainer.innerHTML = "";
    this.#valueFilterRef = [];
    this.#valueFilters?.forEach(filter => this.createValueFilter(filter));
  }

  valueFilterUpdated(e: Event): void {
    const newFilterState: ValueStateData = (e as CustomEvent<ValueStateData>).detail;
    this.#filterState.valueFilterState[newFilterState.label] = newFilterState.state;
    this.emitFilterUpdate();
  }

  emitFilterUpdate(): void {
    const e: CustomEvent<FilterState> = new CustomEvent("filterUpdate",
      {
        cancelable: true,
        detail: this.#filterState
      });
    this.dispatchEvent(e);
  }

  emitSortUpdate(): void {
    const e: CustomEvent<unknown> = new CustomEvent("SortUpdate",
      {
        cancelable: true,
        detail: {}
      });
    this.dispatchEvent(e);
  }

  reset(): void {
    // This will lead to a lot of queries to base (1 per each filter).
    // TODO: Fix multiple updates (disable emitting and add return value to reset?)
    this.#valueFilterRef.forEach(filter => filter.reset());
  }
}

export default Sidebar;

customElements.define("filter-sidebar", Sidebar);