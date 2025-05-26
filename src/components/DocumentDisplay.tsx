// src/components/DocumentDisplay.tsx
import React from 'react';
import { BlocksRenderer } from '@strapi/blocks-react-renderer'; // <-- Importar BlocksRenderer
import './DocumentDisplay.css';

interface Document {
    id: string;
    title: string;
    category: string;
    content: any; // <-- Mudar para 'any' para aceitar o array de objetos do Rich Text
}

interface DocumentDisplayProps {
    document: Document | null;
}

const DocumentDisplay: React.FC<DocumentDisplayProps> = ({ document }) => {
    if (!document) {
        return (
            <div className="document-display-placeholder">
                Selecione um documento na lista ou use a pesquisa.
            </div>
        );
    }

    return (
        <div className="document-display">
            <h2>{document.title}</h2>
            <div className="document-content">
                {/* Renderiza o conteúdo usando BlocksRenderer apenas se for um array (Rich Text) */}
                {document.content && Array.isArray(document.content) ? (
                    <BlocksRenderer content={document.content} />
                ) : (
                    // Fallback caso o conteúdo não seja o formato Rich Text esperado (ex: texto puro)
                    <p>{document.content?.toString()}</p>
                )}
            </div>
        </div>
    );
};

export default DocumentDisplay;