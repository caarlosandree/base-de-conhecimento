// src/components/DocumentDisplay.tsx (Corrigido)

import React, { useRef, useEffect } from 'react'; // Importe useRef e useEffect
import './DocumentDisplay.css';

const highlightText = (text: string, highlight: string) => {
    if (!highlight || highlight.trim() === '') {
        return <>{text}</>;
    }
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === highlight.toLowerCase() ? (
                    <mark key={`highlight-${i}`} className="highlight">
                        {part}
                    </mark>
                ) : (
                    <React.Fragment key={`part-${i}`}>{part}</React.Fragment>
                )
            )}
        </>
    );
};

interface Document {
    id: string;
    title: string;
    category: string;
    content: any[];
    plainTextContent?: string;
}

interface DocumentDisplayProps {
    document: Document | null;
    searchTerm: string;
    message: string;
    onCloseDisplay: () => void; // Novo: função para fechar o display em mobile
}

const DocumentDisplay: React.FC<DocumentDisplayProps> = ({ document, searchTerm, message, onCloseDisplay }) => {
    const displayRef = useRef<HTMLDivElement>(null); // Ref para o container do display

    // Rola para o topo do documento quando ele muda
    useEffect(() => {
        if (document && displayRef.current) {
            displayRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [document]);

    const isMobile = window.innerWidth < 1024; // Determina se é mobile (pode ser passado como prop também)


    if (!document) {
        return (
            <div className="document-display no-document-selected">
                <p>{message}</p>
            </div>
        );
    }

    const renderRichTextContent = (contentBlocks: any[]) => {
        if (!contentBlocks || !Array.isArray(contentBlocks)) {
            return null;
        }

        return contentBlocks.map((block, index) => {
            if (block.type === 'paragraph') {
                return (
                    <p key={`block-p-${index}`}>
                        {block.children.map((child: any, childIndex: number) => {
                            if (child.type === 'text') {
                                return <React.Fragment key={`p-child-${childIndex}`}>{highlightText(child.text, searchTerm)}</React.Fragment>;
                            }
                            return null;
                        })}
                    </p>
                );
            }
            if (block.type === 'heading') {
                const HeadingTag = `h${block.level}` as keyof JSX.IntrinsicElements;
                return (
                    <HeadingTag key={`block-h-${index}`}>
                        {block.children.map((child: any, childIndex: number) => {
                            if (child.type === 'text') {
                                return <React.Fragment key={`h-child-${childIndex}`}>{highlightText(child.text, searchTerm)}</React.Fragment>;
                            }
                            return null;
                        })}
                    </HeadingTag>
                );
            }
            if (block.type === 'list' && block.format === 'unordered') {
                return (
                    <ul key={`block-ul-${index}`}>
                        {block.children.map((listItem: any, listItemIndex: number) => (
                            <li key={`li-${listItemIndex}`}>
                                {listItem.children.map((child: any, childIndex: number) => {
                                    if (child.type === 'text') {
                                        return <React.Fragment key={`li-child-${childIndex}`}>{highlightText(child.text, searchTerm)}</React.Fragment>;
                                    }
                                    return null;
                                })}
                            </li>
                        ))}
                    </ul>
                );
            }
            return null;
        });
    };

    return (
        <div className="document-display" ref={displayRef}>
            {isMobile && ( // Mostra o botão de voltar apenas em mobile
                <button className="back-to-list-button" onClick={onCloseDisplay}>
                    <i className="fas fa-arrow-left"></i> Voltar
                </button>
            )}
            <h2>{highlightText(document.title, searchTerm)}</h2>
            <p className="document-category">Categoria: {document.category}</p>
            <div className="document-content">
                {renderRichTextContent(document.content)}
            </div>
        </div>
    );
};

export default DocumentDisplay;