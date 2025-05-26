import React from 'react';
import DocumentList from './DocumentList'; // Certifique-se de que o caminho está correto
import './Sidebar.css'; // Certifique-se de que este arquivo existe

interface Document {
    id: string;
    title: string;
    category: string;
    content: any[];
    plainTextContent?: string;
}

interface SidebarProps {
    documents: Document[];
    onDocumentSelect: (id: string | null) => void;
    selectedDocumentId: string | null;
    message: string; // Para exibir mensagens como "Nenhum documento encontrado"
}

const Sidebar: React.FC<SidebarProps> = ({ documents, onDocumentSelect, selectedDocumentId, message }) => {
    // A lógica de categorias, modo e modelo Gemini foi movida para o Header.
    // Este sidebar agora se concentra na lista de documentos.

    return (
        <aside className="app-sidebar">
            {/* O DocumentList agora recebe os documentos filtrados diretamente do App.tsx */}
            <DocumentList
                documents={documents}
                onDocumentSelect={onDocumentSelect}
                selectedDocumentId={selectedDocumentId}
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