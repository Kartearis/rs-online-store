// Contains logic to display card components in catalog
import { Product } from "../controllers/dbController";
import Card from "../components/card/card";
import { assertDefined } from "../controllers/dbController";

export default class CatalogView {

  // TODO: Change to real version
  showProducts(data: Product[] | undefined): void {
    if (data === undefined || data.length === 0)
      return;
    const fragment: DocumentFragment = document.createDocumentFragment();
    data.forEach(value => {
      const card: Card = new Card(value);
      fragment.append(card);
    });
    assertDefined(document.querySelector('main')).innerHTML = "";
    assertDefined(document.querySelector('main')).append(fragment);
  }
}