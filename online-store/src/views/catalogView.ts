// Contains logic to display card components in catalog
import { Product } from "../controllers/dbController";
import Card from "../components/card/card";
import Sidebar, { FilterConfig } from "../components/sidebar/sidebar";
import { assertDefined } from "../controllers/dbController";

import './catalog-view.css';

export default class CatalogView {
  sidebar: Sidebar | null = null

  createSidebar(sidebarConfig: FilterConfig): Sidebar {
    this.sidebar = new Sidebar(sidebarConfig);
    assertDefined(document.querySelector('main .sidebar-container')).append(this.sidebar);
    return this.sidebar;
  }

  showAlert(alert: string): void {
    const alertElement: HTMLDivElement = document.createElement("div");
    alertElement.classList.add("card-container__alert");
    alertElement.innerText = alert;
    assertDefined(document.querySelector('main .card-container')).innerHTML = "";
    assertDefined(document.querySelector('main .card-container')).append(alertElement);
  }

  showProducts(data: Product[] | undefined): void {
    if (data === undefined || data.length === 0) {
      this.showAlert("No items matching filters");
      return;
    }
    const fragment: DocumentFragment = document.createDocumentFragment();
    data.forEach(value => {
      const card: Card = new Card(value);
      fragment.append(card);
    });
    assertDefined(document.querySelector('main .card-container')).innerHTML = "";
    assertDefined(document.querySelector('main .card-container')).append(fragment);
  }
}