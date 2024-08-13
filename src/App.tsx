import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './pages/login/Login';
import OpenAiStream from './pages/chat/OpenAiStream';

const App = createBrowserRouter([
    { path: '/', element: <Login /> }, 
    { path: '/chat/:session_id', element: <OpenAiStream /> },
]);

export default <RouterProvider router={App} />;
