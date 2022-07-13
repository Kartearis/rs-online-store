// Contains logic to display card components in catalog
import { Product } from "../controllers/dbController";

export default class CatalogView {

  // TODO: Change to real version
  showProducts(data: Product[] | undefined): void {
    if (data === undefined || data.length === 0)
      return;
    let html: string = "";
    data.forEach(value => html += value.name + value.price);
    document.querySelector('main')!.innerHTML = html;
  }
}