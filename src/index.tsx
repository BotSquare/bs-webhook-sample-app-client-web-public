import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '/node_modules/flag-icons/css/flag-icons.min.css';
import App from './App';
import './index.scss'; 
import './i18n';

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
    <Provider store={store}>
        {App}
    </Provider>
);
