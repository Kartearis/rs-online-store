// Main app controller. Connects different parts of app together
import DbController from "./dbController";
import { Product } from "./dbController";
import CatalogView from "../views/catalogView";
import { FilterConfig } from "../components/sidebar/sidebar";
import { FilterData } from "../components/value-filter/value-filter";

export default class AppController {

  dbController: DbController = new DbController()
  catalogView: CatalogView = new CatalogView()

  async init(): Promise<void> {
    await this.dbController.init()
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

  async showProducts() {
    const data: Product[] | undefined = await this.dbController.getProducts();
    const filterConfig: FilterConfig = {
      valueFilters: await Promise.all(
        ['Vendor', 'Color', 'Memory', 'Fans']
          .map(field => this.buildValueFilterFromField(field))),
      rangeFilters: []
    }
    this.catalogView.showProducts(data, filterConfig);
  }
}