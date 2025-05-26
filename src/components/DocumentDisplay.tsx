import React from 'react';
// Certifique-se de que o CSS do DocumentDisplay está importado
import './DocumentDisplay.css'; // Ou o caminho correto para o seu CSS

// Adicione esta função auxiliar para realçar o texto
const highlightText = (text: string, highlight: string) => {
    if (!highlight || highlight.trim() === '') {
        return <>{text}</>; // Se não há termo de busca, retorna o texto puro
    }

    const parts = text.split(new RegExp(`(${highlight})`, 'gi')); // Divide o texto pelo termo de busca (case-insensitive)
    return (
        <>
            {parts.map((part, i) => (
                // Se a parte corresponde ao termo de busca (case-insensitive), aplica a classe 'highlight'
                part.toLowerCase() === highlight.toLowerCase() ? (
                    <mark key={i} className="highlight">
                        {part}
                    </mark>
                ) : (
                    <React.Fragment key={i}>{part}</React.Fragment> // Caso contrário, retorna a parte como texto normal
                )
            ))}
        </>
    );
};

interface Document {
    id: string;
    title: string;
    category: string;
    content: any[]; // Conteúdo Rich Text do Strapi
    plainTextContent?: string; // Texto puro para busca e exibição simples
}

interface DocumentDisplayProps {
    document: Document | null;
    searchTerm: string; // Adicionado para realçar termos de pesquisa
    message: string; // Mensagem para exibir quando não há documento selecionado ou dados
}

const DocumentDisplay: React.FC<DocumentDisplayProps> = ({ document, searchTerm, message }) => {
    if (!document) {
        return (
            <div className="document-display no-document-selected">
                <p>{message}</p>
            </div>
        );
    }

    // Função para renderizar o conteúdo Rich Text do Strapi.
    // Esta é uma implementação básica e pode precisar ser mais robusta
    // dependendo da complexidade do seu conteúdo do Strapi (links, imagens, etc.).
    const renderRichTextContent = (contentBlocks: any[]) => {
        if (!contentBlocks || !Array.isArray(contentBlocks)) {
            return null;
        }

        return contentBlocks.map((block, index) => {
            if (block.type === 'paragraph') {
                return (
                    <p key={index}>
                        {block.children.map((child: any, childIndex: number) => {
                            if (child.type === 'text') {
                                // Aplica realce apenas se houver plainTextContent para o termo de busca
                                return highlightText(child.text, searchTerm);
                            }
                            // Adicione mais tipos de child conforme necessário (ex: links, etc.)
                            return null;
                        })}
                    </p>
                );
            }
            if (block.type === 'heading') {
                // Para cabeçalhos, use o nível (level) para renderizar H1, H2, etc.
                const HeadingTag = `h${block.level}` as keyof JSX.IntrinsicElements;
                return (
                    <HeadingTag key={index}>
                        {block.children.map((child: any, childIndex: number) => {
                            if (child.type === 'text') {
                                return highlightText(child.text, searchTerm);
                            }
                            return null;
                        })}
                    </HeadingTag>
                );
            }
            if (block.type === 'list' && block.format === 'unordered') {
                return (
                    <ul key={index}>
                        {block.children.map((listItem: any, listItemIndex: number) => (
                            <li key={listItemIndex}>
                                {listItem.children.map((child: any, childIndex: number) => {
                                    if (child.type === 'text') {
                                        return highlightText(child.text, searchTerm);
                                    }
                                    return null;
                                })}
                            </li>
                        ))}
                    </ul>
                );
            }
            // Adicione mais tipos de bloco (image, code, blockquote, etc.) conforme seu Strapi usa
            return null;
        });
    };

    return (
        <div className="document-display">
            <h2>{highlightText(document.title, searchTerm)}</h2>
            <p className="document-category">Categoria: {document.category}</p>
            <div className="document-content">
                {/* Renderiza o conteúdo Rich Text aqui */}
                {renderRichTextContent(document.content)}

                {/* Se o Rich Text for muito complexo, você pode optar por mostrar o plainTextContent para realce */}
                {/* <p>{highlightText(document.plainTextContent || '', searchTerm)}</p> */}
            </div>
        </div>
    );
};

export default DocumentDisplay;