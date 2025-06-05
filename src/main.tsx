import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Importa o nosso componente App
import './index.css'; // Importa estilos globais, se houver

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App /> {/* Aqui é onde seu componente App é renderizado */}
    </React.StrictMode>,
);