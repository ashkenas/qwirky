import '../styles/App.css';
import Home from './Home';
// import { demoBoard, demoMap } from '../demoBoard';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from '../contexts/firebase';

// const initialState = {
//   board: demoBoard,
//   map: demoMap,
//   turn: true,
//   pieces: [0x11, 0x12, 0x13, 0x14, 0x15, 0x16],
//   placed: [],
//   selected: 0
// };

const router = createBrowserRouter([
  {
    element: <Home />,
    path: '/'
  }
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;