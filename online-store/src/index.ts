
import './global.css';
import AppController from "./controllers/appController";

const app = new AppController();
app.init().then(() => app.showProducts(null, null));
