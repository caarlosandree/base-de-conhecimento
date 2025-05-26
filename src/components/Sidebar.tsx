// src/components/Sidebar.tsx
import React from 'react';
import './Sidebar.css'; // Certifique-se de que este CSS existe ou adicione seus estilos em App.css

interface SidebarProps {
    categories: string[];
    selectedCategory: string | null;
    onCategorySelect: (category: string | null) => void;
    // NOVO: Propriedades para alternar o modo
    onToggleMode: (mode: 'documents' | 'ai') => void;
    currentMode: 'documents' | 'ai';
}

const Sidebar: React.FC<SidebarProps> = ({ categories, selectedCategory, onCategorySelect, onToggleMode, currentMode }) => {
    return (
        <aside className="sidebar">
            <h3>Categorias</h3>
            <ul>
                <li>
                    <button
                        onClick={() => onCategorySelect(null)} // "Todas" agora é null
                        className={selectedCategory === null ? 'active' : ''}
                    >
                        Todas
                    </button>
                </li>
                {categories.map(category => (
                    <li key={category}>
                        <button
                            onClick={() => onCategorySelect(category)}
                            className={selectedCategory === category ? 'active' : ''}
                        >
                            {category}
                        </button>
                    </li>
                ))}
            </ul>

            {/* NOVO: Botões para alternar o modo */}
            <div className="sidebar-mode-toggle">
                <h3>Modo</h3>
                <button
                    onClick={() => onToggleMode('documents')}
                    className={currentMode === 'documents' ? 'active' : ''}
                >
                    Documentos
                </button>
                <button
                    onClick={() => onToggleMode('ai')}
                    className={currentMode === 'ai' ? 'active' : ''}
                >
                    Assistente IA
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;