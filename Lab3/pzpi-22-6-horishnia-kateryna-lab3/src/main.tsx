import "./index.css";
import "@mantine/core/styles.css";
import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import App from "./App.tsx";
import {Provider} from "react-redux";
import {store} from "./store.ts";
import {MantineProvider} from "@mantine/core";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <MantineProvider>
            <Provider store={store}>
                <App/>
            </Provider>
        </MantineProvider>
    </StrictMode>,
)
