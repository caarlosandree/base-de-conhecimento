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
    isMobile: boolean; // Novo: para saber se está em mobile
    onToggleSidebar: () => void; // Novo: função para alternar a sidebar
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
                                           isMobile, // Recebendo prop
                                           onToggleSidebar, // Recebendo prop
                                       }) => {
    return (
        <header className="app-header">
            <div className="header-top-row">
                {isMobile && ( // Mostrar botão de toggle da sidebar apenas em mobile
                    <button className="sidebar-toggle-button" onClick={onToggleSidebar} aria-label="Abrir/Fechar Sidebar">
                        <i className="fas fa-bars"></i> {/* Ícone de hambúrguer */}
                    </button>
                )}
                <h1 className="app-title">Base de Conhecimento</h1>
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Pesquisar documentos..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        aria-label="Pesquisar documentos"
                    />
                </div>
            </div>

            <div className="header-bottom-row">
                {/* Seletor de Categorias */}
                <div className="category-filter">
                    <select
                        onChange={(e) => onCategorySelect(e.target.value === '' ? null : e.target.value)}
                        value={selectedCategory || ''}
                        aria-label="Filtrar por categoria"
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
                        aria-label="Alternar para modo documentos"
                    >
                        <i className="fas fa-book"></i> Documentos
                    </button>
                    <button
                        className={currentMode === 'ai' ? 'active' : ''}
                        onClick={() => onToggleMode('ai')}
                        aria-label="Alternar para modo IA"
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
                        aria-label="Selecionar modelo Gemini Flash"
                    >
                        Flash
                    </button>
                    <button
                        className={currentGeminiModel === 'pro' ? 'active' : ''}
                        onClick={() => onToggleGeminiModel('pro')}
                        title="Gemini 2.5 Preview (Mais Capacidade de Raciocínio)"
                        aria-label="Selecionar modelo Gemini PRO"
                    >
                        PRO
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;