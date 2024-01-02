import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.scss';
import App from './components/App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

const updateDimensions = () => {
  const style = document.documentElement.style;
  style.setProperty('--vh', window.innerHeight / 100 + 'px');
  style.setProperty('--vw', window.innerWidth / 100 + 'px');
};
window.addEventListener('resize', updateDimensions);
updateDimensions();
