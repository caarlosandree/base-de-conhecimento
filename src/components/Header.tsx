import React from 'react';
import './Header.css'; // Certifique-se de que este arquivo existe

interface HeaderProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    // Novas props do App.tsx para o Header:
    categories: string[]; // Lista de categorias disponíveis
    onCategorySelect: (category: string | null) => void;
    selectedCategory: string | null;
    onToggleMode: (mode: 'documents' | 'ai') => void;
    currentMode: 'documents' | 'ai';
    onToggleGeminiModel: (model: 'flash' | 'pro') => void;
    currentGeminiModel: 'flash' | 'pro';
}

const Header: React.FC<HeaderProps> = ({
                                           searchTerm,
                                           onSearchChange,
                                           categories,
                                           onCategorySelect,
                                           selectedCategory,
                                           onToggleMode,
                                           currentMode,
                                           onToggleGeminiModel,
                                           currentGeminiModel,
                                       }) => {
    return (
        <header className="app-header">
            <div className="header-top-row">
                <h1 className="app-title">Base de Conhecimento</h1>
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Pesquisar documentos..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>

            <div className="header-bottom-row">
                {/* Seletor de Categorias */}
                <div className="category-filter">
                    <select
                        onChange={(e) => onCategorySelect(e.target.value === '' ? null : e.target.value)}
                        value={selectedCategory || ''}
                    >
                        <option value="">Todas as Categorias</option>
                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Botões de Modo (Documentos/IA) */}
                <div className="mode-toggle">
                    <button
                        className={currentMode === 'documents' ? 'active' : ''}
                        onClick={() => onToggleMode('documents')}
                    >
                        <i className="fas fa-book"></i> Documentos
                    </button>
                    <button
                        className={currentMode === 'ai' ? 'active' : ''}
                        onClick={() => onToggleMode('ai')}
                    >
                        <i className="fas fa-robot"></i> IA
                    </button>
                </div>

                {/* Seleção do Modelo Gemini */}
                <div className="gemini-model-select">
                    <button
                        className={currentGeminiModel === 'flash' ? 'active' : ''}
                        onClick={() => onToggleGeminiModel('flash')}
                        title="Gemini 1.5 Flash (Rápido e Eficiente)"
                    >
                        v1.5 Flash
                    </button>
                    <button
                        className={currentGeminiModel === 'pro' ? 'active' : ''}
                        onClick={() => onToggleGeminiModel('pro')}
                        title="Gemini 2.5 Preview (Mais Capacidade de Raciocínio)"
                    >
                        v2.5 Preview
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;