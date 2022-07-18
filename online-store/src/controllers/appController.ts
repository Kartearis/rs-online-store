// Main app controller. Connects different parts of app together
import DbController from "./dbController";
import { Product } from "./dbController";
import CatalogView from "../views/catalogView";
import Sidebar, { FilterConfig, FilterState, SortConfig, SortState } from "../components/sidebar/sidebar";
import { FilterData } from "../components/value-filter/value-filter";

export default class AppController {

  dbController: DbController = new DbController()
  catalogView: CatalogView = new CatalogView()

  async init(): Promise<void> {
    await this.dbController.init()
    const filterConfig: FilterConfig = {
      valueFilters: await Promise.all(
        ['Vendor', 'Color', 'Memory', 'Fans']
          .map(field => this.buildValueFilterFromField(field))),
      rangeFilters: []
    };
    const sortConfig: SortConfig = [
      {
        field: "name",
        label: "Name"
      },
      {
        field: "price",
        label: "Price"
      },
      {
        field: "memory",
        label: "Memory size"
      },
      {
        field: "stock",
        label: "Left in stock"
      },
      {
        field: "date",
        label: "Last restock"
      }
    ]
    const sidebar: Sidebar = this.catalogView.createSidebar(filterConfig, sortConfig);
    sidebar.addEventListener('filterUpdate',
      (e) => this.showProducts((e as CustomEvent<FilterState>).detail, sidebar.currentSortState));
    sidebar.addEventListener('sortUpdate',
      (e) => this.showProducts(sidebar.currentFilterState, (e as CustomEvent<SortState>).detail))
  }

  async buildValueFilterFromField(field: string): Promise<FilterData> {
    return {
      label: field,
      options: (await this.dbController.getUniqueFieldValues<string>(field.toLowerCase()))
        .map(value => {return {
          name: value, value: value
        };})
    }
  };

  async showProducts(filters: FilterState | null, sort: SortState | null): Promise<void> {
    console.log(filters);
    const data: Product[] | undefined = filters || sort
      ? await this.dbController.getProductsByFilters(filters, sort)
      : await this.dbController.getProducts();
    console.log(sort);
    this.catalogView.showProducts(data);
  }
}