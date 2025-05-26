// src/components/Header.tsx
import React from 'react';
// import './Header.css'; // Comentei esta linha. Se você tinha um Header.css, ele pode estar em conflito.
// Todos os estilos relevantes estão agora em App.css.

interface HeaderProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
}

const Header: React.FC<HeaderProps> = ({ searchTerm, onSearchChange }) => {
    return (
        <header className="header">
            {/* Certifique-se de que o h1 e o input são filhos DIRETOS de <header> */}
            <h1>Base de conhecimento - WideVoice</h1>
            <input
                type="text"
                placeholder="Pesquisar documentação."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
            />
        </header>
    );
};

export default Header;