// Main app controller. Connects different parts of app together
import DbController from "./dbController";
import { Product } from "./dbController";
import CatalogView from "../views/catalogView";

export default class AppController {

  dbController: DbController = new DbController()
  catalogView: CatalogView = new CatalogView()

  async init(): Promise<void> {
    await this.dbController.init()
  }

  async showProducts() {
    const data: Product[] | undefined = await this.dbController.getProducts();
    this.catalogView.showProducts(data);
  }
}