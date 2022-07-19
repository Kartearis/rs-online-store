// Sidebar web-component
// Must support filter, order and reset events
import './sidebar.css';
import ValueFilter, {
    FilterData as ValueFilterData,
    StateData as ValueStateData,
    FilterState as ValueFilterState,
} from '../value-filter/value-filter';
import { assertDefined, Product } from '../../controllers/dbController';

export interface FilterConfig {
    valueFilters: ValueFilterData[];
    rangeFilters: unknown[]; // tmp
}

export type SortConfig = { field: keyof Product; label: string }[];

export interface SortState {
    field: keyof Product;
    direction: 'up' | 'down';
}

export interface FilterState {
    valueFilterState: Record<string, ValueFilterState>;
    rangeFilterState: unknown;
}

const template: HTMLTemplateElement = document.createElement('template');
template.innerHTML = `
  <h3 class="sidebar__header">Filters</h3>
  <div class="sidebar__value-filter-container"></div>
  <div class="sidebar__range-filter-container"></div>
  <button class="sidebar__reset" data-mode="soft">Reset</button>
  <h3 class="sidebar__header">Sort</h3>
  <select class="sidebar__sort">
  </select>
  <button class="sidebar__reset sidebar__reset--hard" data-mode="hard">Clear LocalStorage</button>
`;

class Sidebar extends HTMLElement {
    #valueFilters: ValueFilterData[] | null = null;
    #valueFilterRef: ValueFilter[] = [];

    #sortConfig: SortConfig = [];

    #filterState: FilterState;
    #sortState: SortState;

    _shadowRoot: DocumentFragment | null = null;
    #resetButton: HTMLButtonElement | null = null;
    #hardResetButton: HTMLButtonElement | null = null;
    #valueFilterContainer: HTMLElement | null = null;
    #sortElement: HTMLSelectElement | null = null;

    constructor(filterConfig: FilterConfig, sortConfig: SortConfig) {
        super();
        this.#valueFilters = filterConfig.valueFilters;
        this.#sortConfig = sortConfig;
        this.#sortState = {
            field: 'name',
            direction: 'up',
        };
        if (sortConfig.length > 0) this.#sortState.field = sortConfig[0].field;
        this.#filterState = {
            valueFilterState: {},
            rangeFilterState: {},
        };

        this.classList.add('sidebar');
        this._shadowRoot = document.createDocumentFragment();
        this._shadowRoot.append(template.content.cloneNode(true));
        this.#valueFilterContainer = this._shadowRoot.querySelector('.sidebar__value-filter-container');
        this.#resetButton = this._shadowRoot.querySelector('.sidebar__reset[data-mode="soft"]');
        this.#hardResetButton = this._shadowRoot.querySelector('.sidebar__reset[data-mode="hard"]');
        this.#sortElement = this._shadowRoot.querySelector('.sidebar__sort');

        this.#resetButton?.addEventListener('click', () => this.reset());
        this.#hardResetButton?.addEventListener('click', () => this.emitHardReset());

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
        if (this.#valueFilterContainer) this.#valueFilterContainer.innerHTML = '';
        this.#valueFilterRef = [];
        this.#valueFilters?.forEach((filter) => this.createValueFilter(filter));
        this.setupSort();
    }

    setupSort(): void {
        this.#sortConfig.forEach((config) => {
            const optionUp = document.createElement('option');
            optionUp.value = config.field + '#up';
            optionUp.innerText = config.label + ' 🠕';
            const optionDown = document.createElement('option');
            optionDown.value = config.field + '#down';
            optionDown.innerText = config.label + ' 🠗';
            assertDefined(this.#sortElement).append(optionUp, optionDown);
        });
        assertDefined(this.#sortElement).addEventListener('change', (e) => this.sortUpdated(e));
    }

    sortUpdated(e: Event): void {
        const value: string[] = (e.target as HTMLSelectElement).value.split('#');
        if (value[1] !== 'up' && value[1] !== 'down') throw new Error('Direction is not up or down');
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
        const e: CustomEvent<FilterState> = new CustomEvent('filterUpdate', {
            cancelable: true,
            detail: this.#filterState,
        });
        this.dispatchEvent(e);
    }

    emitSortUpdate(field: keyof Product, direction: 'up' | 'down'): void {
        const e: CustomEvent<SortState> = new CustomEvent('sortUpdate', {
            cancelable: true,
            detail: {
                field: field,
                direction: direction,
            },
        });
        this.dispatchEvent(e);
    }

    emitHardReset(): void {
        const e: CustomEvent<void> = new CustomEvent('hardReset', {
            cancelable: true,
        });
        this.dispatchEvent(e);
    }

    reset(emitEvent = true): void {
        // This will lead to a lot of queries to base (1 per each filter).
        // TODO: Fix multiple updates (disable emitting and add return value to reset?)
        this.#valueFilterRef.forEach((filter) => {
            filter.reset(false);
            const stateData: ValueStateData = filter.getCurrentStateData();
            this.#filterState.valueFilterState[stateData.label] = stateData.state;
        });
        console.log(this.#filterState);
        if (emitEvent) this.emitFilterUpdate();
    }

    get currentFilterState(): FilterState {
        return this.#filterState;
    }

    set currentFilterState(filters: FilterState) {
        this.#filterState = filters;
        this.#valueFilterRef.forEach((filter) => {
            if (filter.label) filter.setCurrentStateData(filters.valueFilterState[filter.label.toLowerCase()]);
        });
    }

    get currentSortState(): SortState {
        return this.#sortState;
    }

    set currentSortState(sort: SortState) {
        this.#sortState = sort;
        assertDefined(this.#sortElement).value = this.#sortState.field + '#' + this.#sortState.direction;
    }

    resetSort(): void {
        this.#sortState = {
            field: 'name',
            direction: 'up',
        };
        if (this.#sortConfig.length > 0) this.#sortState.field = this.#sortConfig[0].field;
        assertDefined(this.#sortElement).value = this.#sortState.field + '#' + this.#sortState.direction;
    }
}

export default Sidebar;

customElements.define('filter-sidebar', Sidebar);
