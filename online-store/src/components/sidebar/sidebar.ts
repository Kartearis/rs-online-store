// Sidebar web-component
// Must support filter, order and reset events
import './sidebar.css';
import ValueFilter, {
  FilterData as ValueFilterData,
  StateData as ValueStateData,
  FilterState as ValueFilterState,
  StateData
} from "../value-filter/value-filter";
import { assertDefined, Product } from "../../controllers/dbController";


export interface FilterConfig {
  valueFilters: ValueFilterData[],
  rangeFilters: unknown[] // tmp
}

export type SortConfig = {field: keyof Product, label: string}[]

export interface SortState {
  field: keyof Product,
  direction: "up" | "down"
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
  <select class="sidebar__sort">
  </select>
`;

class Sidebar extends HTMLElement {
  #valueFilters: ValueFilterData[] | null = null
  #valueFilterRef: ValueFilter[] = []

  #sortConfig: SortConfig = []

  #filterState: FilterState
  #sortState: SortState

  _shadowRoot: DocumentFragment | null = null
  #resetButton: HTMLButtonElement | null = null
  #valueFilterContainer: HTMLElement | null = null
  #sortElement: HTMLSelectElement | null = null

  constructor(filterConfig: FilterConfig, sortConfig: SortConfig) {
    super();
    this.#valueFilters = filterConfig.valueFilters;
    this.#sortConfig = sortConfig;
    this.#sortState = {
      field: "name",
      direction: "up"
    };
    if (sortConfig.length > 0)
      this.#sortState.field = sortConfig[0].field;
    this.#filterState = {
      valueFilterState: {},
      rangeFilterState: {}
    };

    this.classList.add('sidebar');
    this._shadowRoot = document.createDocumentFragment();
    this._shadowRoot.append(template.content.cloneNode(true));
    this.#valueFilterContainer = this._shadowRoot.querySelector('.sidebar__value-filter-container');
    this.#resetButton= this._shadowRoot.querySelector('.sidebar__reset');
    this.#sortElement = this._shadowRoot.querySelector('.sidebar__sort');

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
    this.setupSort();
  }

  setupSort(): void {
    this.#sortConfig.forEach(config => {
      const optionUp = document.createElement("option");
      optionUp.value = config.field + "#up";
      optionUp.innerText = config.label + " 🠕";
      const optionDown = document.createElement("option");
      optionDown.value = config.field + "#down";
      optionDown.innerText = config.label + " 🠗";
      assertDefined(this.#sortElement).append(optionUp, optionDown);
    });
    assertDefined(this.#sortElement).addEventListener("change", (e) => this.sortUpdated(e));
  }

  sortUpdated(e: Event): void {
    const value: string[] = (e.target as HTMLSelectElement).value.split('#');
    if (value[1] !== "up" && value[1] !== "down")
      throw new Error("Direction is not up or down");
    this.#sortState.field = value[0];
    this.#sortState.direction = value[1];
    this.emitSortUpdate(value[0], value[1]);
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

  emitSortUpdate(field: keyof Product, direction: "up" | "down"): void {
    const e: CustomEvent<SortState> = new CustomEvent("sortUpdate",
      {
        cancelable: true,
        detail: {
          field: field,
          direction: direction
        }
      });
    this.dispatchEvent(e);
  }

  reset(): void {
    // This will lead to a lot of queries to base (1 per each filter).
    // TODO: Fix multiple updates (disable emitting and add return value to reset?)
    this.#valueFilterRef.forEach(filter => filter.reset());
  }

  get currentFilterState(): FilterState {
    return this.#filterState;
  }

  get currentSortState(): SortState {
    return this.#sortState;
  }
}

export default Sidebar;

customElements.define("filter-sidebar", Sidebar);