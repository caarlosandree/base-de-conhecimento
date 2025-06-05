import React from 'react';
import DocumentList from './DocumentList';
import './Sidebar.css';

interface Document {
    id: string;
    title: string;
    category: string;
    // content e plainTextContent não são necessários aqui, apenas id, title
}

interface SidebarProps {
    documents: Document[];
    onDocumentSelect: (id: string | null) => void;
    selectedDocumentId: string | null;
    message: string; // Para exibir mensagens como "Nenhum documento encontrado"
    isFiltering: boolean; // Novo: estado de filtragem
    isMobile: boolean; // Novo: para saber se está em mobile
}

const Sidebar: React.FC<SidebarProps> = ({ documents, onDocumentSelect, selectedDocumentId, message, isFiltering, isMobile }) => {
    // A lógica de categorias, modo e modelo Gemini foi movida para o Header.
    // Este sidebar agora se concentra na lista de documentos.

    return (
        <aside className={`app-sidebar ${isMobile && !documents.length ? '' : 'is-open'}`}> {/* Adiciona a classe is-open condicionalmente */}
            {/* O DocumentList agora recebe os documentos filtrados diretamente do App.tsx */}
            <DocumentList
                documents={documents}
                onDocumentSelect={onDocumentSelect}
                selectedDocumentId={selectedDocumentId}
                isFiltering={isFiltering} // Passa o estado de filtragem para DocumentList
            />
            {/* Se não houver documentos para exibir, mostra a mensagem */}
            {documents.length === 0 && (
                <div className="sidebar-empty-message">
                    <p>{message}</p>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;