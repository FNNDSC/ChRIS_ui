
import ReactDOM from "react-dom";
import { store } from "./store/configureStore";
import Main from "./main";
import * as serviceWorker from "./serviceWorker";
import "./assets/scss/main.scss";

ReactDOM.render(<Main store={store} />, document.getElementById("root"));

serviceWorker.unregister();
