// src/components/DocumentList.tsx

import React from 'react';
import './DocumentList.css'; // Certifique-se de que este CSS está correto

interface Document {
    id: string;
    title: string;
    category: string;
    // content e plainTextContent não são necessários aqui, apenas id, title
}

interface DocumentListProps {
    documents: Document[]; // A lista de documentos a serem exibidos
    onDocumentSelect: (id: string) => void; // Função para selecionar um documento
    selectedDocumentId: string | null; // ID do documento selecionado atualmente
}

const DocumentList: React.FC<DocumentListProps> = ({
                                                       documents,
                                                       onDocumentSelect,
                                                       selectedDocumentId,
                                                   }) => {
    return (
        <div className="document-list">
            <h3>Documentos</h3>
            {documents.length === 0 ? (
                <p className="no-documents-message">Nenhum documento encontrado.</p>
            ) : (
                <ul>
                    {documents.map((doc) => (
                        <li key={doc.id}>
                            <button
                                className={doc.id === selectedDocumentId ? 'active' : ''}
                                onClick={() => onDocumentSelect(doc.id)}
                            >
                                {doc.title}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default DocumentList;