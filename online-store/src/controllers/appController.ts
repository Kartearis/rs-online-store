// Main app controller. Connects different parts of app together
import DbController from "./dbController";
import { Product } from "./dbController";
import CatalogView from "../views/catalogView";
import { FilterConfig } from "../components/sidebar/sidebar";

export default class AppController {

  dbController: DbController = new DbController()
  catalogView: CatalogView = new CatalogView()

  async init(): Promise<void> {
    await this.dbController.init()
  }

  async showProducts() {
    const data: Product[] | undefined = await this.dbController.getProducts();
    const filterConfig: FilterConfig = {
      valueFilters: [
        {
          label: 'Vendor',
          options: (await this.dbController.getUniqueFieldValues<string>('vendor')).map(vendor => {return {
            name: vendor, value: vendor
          };})
        }
      ],
      rangeFilters: []
    }
    this.catalogView.showProducts(data, filterConfig);
  }
}