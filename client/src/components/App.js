import Home from './Home';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from '../contexts/firebase';
import ErrorPage from './ErrorPage';
import Dashboard from './Dashboard';
import Protect from './Protect';
import Friends from './Friends';
import NewGame from './NewGame';
import { DataProvider } from '../contexts/DataContext';
import GamePage from './GamePage';
import { GameProvider } from '../contexts/GameContext';

const initialState = {
  board: null,
  yourTurn: false,
  hand: [],
  placed: [],
  selected: 0,
  justMoved: false
};

const router = createBrowserRouter([
  {
    element: <Home />,
    path: '/'
  },
  {
    element: (
      <Protect>
        <Dashboard />
      </Protect>
    ),
    path: '/dash'
  },
  {
    element: (
      <Protect>
        <Friends />
      </Protect>
    ),
    path: '/friends'
  },
  {
    element: (
      <Protect>
        <GameProvider initialState={initialState}>
          <GamePage />
        </GameProvider>
      </Protect>
    ),
    path: '/game/:id'
  },
  {
    element: (
      <Protect>
        <NewGame />
      </Protect>
    ),
    path: '/new'
  },
  {
    element: <ErrorPage status={404} message="Page not found." />,
    path: '*'
  }
]);

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <RouterProvider router={router} />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
