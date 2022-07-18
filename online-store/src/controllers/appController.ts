// Main app controller. Connects different parts of app together
import DbController from "./dbController";
import { Product } from "./dbController";
import CatalogView from "../views/catalogView";
import Sidebar, { FilterConfig, FilterState } from "../components/sidebar/sidebar";
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
    const sidebar: Sidebar = this.catalogView.createSidebar(filterConfig);
    sidebar.addEventListener('filterUpdate', (e) => this.showProducts((e as CustomEvent<FilterState>).detail));
    console.log(sidebar);
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

  async showProducts(filters: FilterState | null): Promise<void> {
    console.log(filters);
    const data: Product[] | undefined = filters
      ? await this.dbController.getProductsByFilters(filters)
      : await this.dbController.getProducts();
    this.catalogView.showProducts(data);
  }
}