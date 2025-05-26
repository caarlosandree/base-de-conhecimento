// src/App.tsx

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DocumentList from './components/DocumentList';
import DocumentDisplay from './components/DocumentDisplay';
import AIInteraction from './components/AIInteraction';
import './App.css';

// Importa o modelo Gemini
import { GoogleGenerativeAI } from '@google/generative-ai';

// Interface que define a estrutura de um documento
interface Document {
    id: string;
    title: string;
    category: string;
    content: any; // Conteúdo do Rich Text é um array de objetos complexo.
    plainTextContent?: string; // Campo para armazenar o texto puro para a busca
}

// Configuração da API Gemini
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });

const App: React.FC = () => {
    // ESTADOS: TODAS AS DECLARAÇÕES DE useState DEVEM VIR AQUI NO INÍCIO
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
    const [documentsData, setDocumentsData] = useState<Document[]>([]);
    const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 1024);
    const [appMode, setAppMode] = useState<'documents' | 'ai'>('documents');
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState<boolean>(false);
    const [aiError, setAiError] = useState<boolean>(false);


    // Efeito para buscar os documentos da API do Strapi quando o componente monta
    useEffect(() => {
        const fetchDocuments = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('http://localhost:1337/api/documentos');

                if (!response.ok) {
                    throw new Error(`Erro HTTP! Status: ${response.status}`);
                }

                const jsonResponse = await response.json();

                if (!jsonResponse.data || !Array.isArray(jsonResponse.data)) {
                    throw new Error("Formato de dados inesperado da API do Strapi. 'data' não é um array.");
                }

                const fetchedDocs: Document[] = jsonResponse.data
                    .map((item: any) => {
                        let plainContent = '';
                        const docAttributes = item.attributes || item;

                        if (docAttributes.content && Array.isArray(docAttributes.content)) {
                            docAttributes.content.forEach((block: any) => {
                                if (block.type === 'paragraph' && block.children) {
                                    block.children.forEach((child: any) => {
                                        if (child.type === 'text' && child.text) {
                                            plainContent += child.text + ' ';
                                        }
                                    });
                                }
                            });
                        } else if (typeof docAttributes.content === 'string') {
                            plainContent = docAttributes.content;
                        }

                        const document = {
                            id: item.id.toString(),
                            title: docAttributes.title || 'Título Desconhecido',
                            category: docAttributes.category || 'Sem Categoria',
                            content: docAttributes.content,
                            plainTextContent: plainContent.trim()
                        };
                        return document;
                    });

                setDocumentsData(fetchedDocs);
                setFilteredDocuments(fetchedDocs);
            } catch (e: any) {
                setError(`Falha ao carregar documentos: ${e.message}`);
                console.error("Erro ao buscar documentos do Strapi:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();
    }, []);


    // Efeito para escutar mudanças no tamanho da janela e atualizar isMobile
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // A linha abaixo usa documentsData, então precisa que documentsData seja declarado antes.
    const uniqueCategories = Array.from(new Set(documentsData.map(doc => doc.category))).filter(Boolean);

    // Efeito para filtrar documentos com base no termo de busca e categoria selecionada
    useEffect(() => {
        let currentFilteredDocs = documentsData;

        if (selectedCategory) {
            currentFilteredDocs = currentFilteredDocs.filter(doc => doc.category === selectedCategory);
        }

        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            currentFilteredDocs = currentFilteredDocs.filter(
                doc =>
                    (doc.title && doc.title.toLowerCase().includes(lowerCaseSearchTerm)) ||
                    (doc.plainTextContent && doc.plainTextContent.toLowerCase().includes(lowerCaseSearchTerm))
            );
        }

        setFilteredDocuments(currentFilteredDocs);

        if (selectedDocumentId && !currentFilteredDocs.some(doc => doc.id === selectedDocumentId)) {
            setSelectedDocumentId(null);
        }
    }, [searchTerm, selectedCategory, selectedDocumentId, documentsData]);

    const currentDocument = filteredDocuments.find(doc => doc.id === selectedDocumentId) || null;

    // Função para enviar mensagem para a IA
    const handleSendMessageToAI = async (message: string) => {
        setAiLoading(true);
        setAiError(false);
        setAiResponse(null);

        let context = "";
        if (filteredDocuments.length > 0) { // Usamos filteredDocuments aqui, que reflete o estado atual
            context += "Base de conhecimento:\n\n";
            // É importante passar o conteúdo completo ou o mais relevante possível aqui.
            // Para evitar que a IA se perca com muito texto, podemos considerar pegar
            // os primeiros N documentos filtrados, ou os mais relevantes se tivéssemos
            // um sistema de ranking mais avançado. Por enquanto, todos os filtrados.
            filteredDocuments.forEach(doc => {
                context += `## ${doc.title}\n`;
                context += `**Categoria:** ${doc.category}\n`;
                context += `${doc.plainTextContent}\n\n`;
            });
            context += "---";
        } else {
            context += "Não há documentos na base de conhecimento filtrada. Você pode responder com base no seu conhecimento geral.\n\n---";
        }

        try {
            // A instrução inicial para a IA e o histórico de chat
            const chat = model.startChat({
                history: [
                    {
                        role: "user",
                        parts: [{ text: `Você é um assistente técnico especializado em problemas de PABX em nuvem, especialmente em sistemas como o WideVoice. Sua principal tarefa é fornecer respostas concisas e úteis baseadas **principalmente** na base de conhecimento fornecida abaixo. Se a informação não estiver na base de conhecimento, você pode usar seu conhecimento geral para complementar, mas sempre priorizando a base de conhecimento. Seja objetivo e evite rodeios. Se a pergunta for fora do escopo técnico ou da base de conhecimento, diga que não pode ajudar. Não invente informações.\n\n${context}` }],
                    },
                    {
                        role: "model",
                        parts: [{ text: "Compreendido. Estou pronto para ajudar com problemas técnicos de PABX em nuvem, usando a base de conhecimento fornecida." }],
                    },
                ],
                generationConfig: {
                    maxOutputTokens: 500,
                },
            });

            const result = await chat.sendMessage(message);
            const response = await result.response;
            setAiResponse(response.text());
        } catch (e) {
            console.error("Erro ao interagir com a IA:", e);
            setAiError(true);
            setAiResponse("Não foi possível obter uma resposta da IA no momento. Por favor, tente novamente mais tarde.");
        } finally {
            setAiLoading(false);
        }
    };


    return (
        <div className="app-container">
            <Header
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />

            <div className="main-content">
                <Sidebar
                    categories={uniqueCategories}
                    onCategorySelect={(category) => {
                        setSelectedCategory(category);
                        setSearchTerm('');
                        setAppMode('documents');
                    }}
                    selectedCategory={selectedCategory}
                    onToggleMode={(mode: 'documents' | 'ai') => {
                        setAppMode(mode);
                        setSelectedDocumentId(null);
                        setAiResponse(null);
                    }}
                    currentMode={appMode}
                />

                <div className="content-area">
                    {loading && <div className="loading-message">Carregando documentos...</div>}
                    {error && <div className="error-message">{error}</div>}
                    {!loading && !error && (
                        <>
                            {appMode === 'documents' ? (
                                <>
                                    <DocumentList
                                        documents={filteredDocuments}
                                        onDocumentSelect={setSelectedDocumentId}
                                        selectedDocumentId={selectedDocumentId}
                                    />
                                    {currentDocument || !isMobile ? (
                                        <DocumentDisplay
                                            document={currentDocument}
                                            message={
                                                (filteredDocuments.length > 0 && !currentDocument) ?
                                                    'Selecione um documento na lista ou use a pesquisa.' :
                                                    (filteredDocuments.length === 0 && searchTerm ?
                                                        'Nenhum documento encontrado com o termo de pesquisa.' :
                                                        (documentsData.length === 0 ? // Use documentsData aqui para o caso geral
                                                            'Não há documentos disponíveis.' :
                                                            'Selecione um documento na lista ou use a pesquisa.'))
                                            }
                                        />
                                    ) : (
                                        // Mensagem para mobile quando nenhum documento selecionado
                                        isMobile && !currentDocument && (
                                            filteredDocuments.length > 0 ? (
                                                <div className="no-document-message">Selecione um documento na lista.</div>
                                            ) : (
                                                searchTerm && filteredDocuments.length === 0 ? (
                                                    <div className="no-document-message">Nenhum documento encontrado com o termo de pesquisa.</div>
                                                ) : (
                                                    documentsData.length === 0 && ( // Se não há documentos no geral
                                                        <div className="no-document-message">Não há documentos disponíveis.</div>
                                                    )
                                                )
                                            )
                                        )
                                    )}
                                </>
                            ) : ( // appMode === 'ai'
                                <AIInteraction
                                    onSendMessage={handleSendMessageToAI}
                                    isLoading={aiLoading}
                                    aiResponse={aiResponse}
                                    hasError={aiError}
                                    message={
                                        documentsData.length === 0 ?
                                            'Não há documentos disponíveis para consulta da IA.' :
                                            'Digite sua pergunta para obter ajuda da IA com base na documentação.'
                                    }
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;