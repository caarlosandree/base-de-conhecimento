import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DocumentDisplay from './components/DocumentDisplay';
import AIInteraction from './components/AIInteraction';
import './App.css'; // Estilos globais do App

import { GoogleGenerativeAI } from '@google/generative-ai';

// Interface que define a estrutura de um documento (conforme vindo do Strapi)
interface Document {
    id: string;
    title: string;
    category: string;
    content: any[]; // Conteúdo do Rich Text é um array de objetos complexo do Strapi
    plainTextContent?: string; // Campo para armazenar o texto puro para a busca e RAG da IA
}

// Interface: Define a estrutura de uma mensagem no chat
interface ChatMessage {
    role: 'user' | 'model'; // Quem enviou a mensagem: 'user' ou 'model' (IA)
    text: string; // O conteúdo da mensagem
}

// Configurações e Chaves de API
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
// Ajuste os modelos para usar as versões mais recentes disponíveis ou que você tem acesso
const flashModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });
const proModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

const App: React.FC = () => {
    // --- ESTADOS DA APLICAÇÃO ---
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
    const [documentsData, setDocumentsData] = useState<Document[]>([]);
    const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 1024);
    const [appMode, setAppMode] = useState<'documents' | 'ai'>('documents');
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(window.innerWidth >= 1024); // Aberta por padrão em desktop, fechada em mobile

    // ESTADOS DE IA
    const [aiLoading, setAiLoading] = useState<boolean>(false);
    const [aiError, setAiError] = useState<boolean>(false);

    // ESTADO DO HISTÓRICO DE CONVERSA
    const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);

    const [activeGeminiModel, setActiveGeminiModel] = useState<'flash' | 'pro'>('flash');
    const [isFiltering, setIsFiltering] = useState<boolean>(false); // Novo estado para indicar filtragem

    // --- FUNÇÕES AUXILIARES ---
    const googleSearch = async (query: string) => {
        console.warn("A função de busca externa (googleSearch) não está ativa no momento. Retornando mensagem mock.");
        return { message: "Funcionalidade de busca externa desativada. Consulta: " + query };
    };

    // --- EFEITOS (useEffect) ---
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
                                if (block.children) {
                                    block.children.forEach((child: any) => {
                                        if (child.type === 'text' && child.text) {
                                            plainContent += child.text + ' ';
                                        } else if (child.children) {
                                            child.children.forEach((nestedChild: any) => {
                                                if (nestedChild.type === 'text' && nestedChild.text) {
                                                    plainContent += nestedChild.text + ' ';
                                                }
                                            });
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

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (!mobile) { // Se virar desktop, abre a sidebar
                setIsSidebarOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        setIsFiltering(true); // Inicia a filtragem
        const filterTimeout = setTimeout(() => { // Debounce para a filtragem
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
            setIsFiltering(false); // Finaliza a filtragem
        }, 200); // Pequeno atraso para feedback visual

        return () => clearTimeout(filterTimeout); // Limpa o timeout se o termo de busca mudar novamente
    }, [searchTerm, selectedCategory, selectedDocumentId, documentsData]);

    const currentDocument = filteredDocuments.find(doc => doc.id === selectedDocumentId) || null;

    // --- FUNÇÃO DE INTERAÇÃO COM A IA ---
    const handleSendMessageToAI = async (message: string) => {
        setAiLoading(true);
        setAiError(false);

        const newUserMessage: ChatMessage = { role: 'user', text: message };
        setConversationHistory(prevHistory => [...prevHistory, newUserMessage]);

        let context = "";
        if (filteredDocuments.length > 0) {
            context += "Base de conhecimento:\n\n";
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
            const currentModel = activeGeminiModel === 'flash' ? flashModel : proModel;

            const chatHistoryForGemini = [
                {
                    role: "user",
                    parts: [{ text: `Você é um assistente técnico especializado em problemas de PABX em nuvem, especialmente em sistemas como o WideVoice. Sua principal tarefa é fornecer respostas concisas e úteis baseadas **principalmente** na base de conhecimento fornecida abaixo. Se a informação não estiver na base de conhecimento, você pode usar seu conhecimento geral para complementar, mas sempre priorizando a base de conhecimento. Para informações fora da base de conhecimento e que exijam dados atuais, você pode usar uma ferramenta de busca na internet. Seja objetivo e evite rodeios. Se a pergunta for fora do escopo técnico ou da base de conhecimento, diga que não pode ajudar. Não invente informações.\n\n${context}` }],
                },
                {
                    role: "model",
                    parts: [{ text: "Compreendido. Estou pronto para ajudar com problemas técnicos de PABX em nuvem, usando a base de conhecimento fornecida e, quando necessário, uma ferramenta de busca." }],
                },
                ...conversationHistory
                    .filter(msg => msg.role === 'user' || msg.role === 'model')
                    .map(msg => ({
                        role: msg.role,
                        parts: [{ text: msg.text }]
                    }))
            ];

            const chat = currentModel.startChat({
                history: chatHistoryForGemini as any,
                generationConfig: {
                    maxOutputTokens: 500,
                },
                tools: [
                    {
                        functionDeclarations: [
                            {
                                name: 'googleSearch',
                                description: 'Realiza uma busca na internet para encontrar informações atuais ou adicionais sobre um tópico.',
                                parameters: {
                                    type: 'object',
                                    properties: {
                                        query: {
                                            type: 'string',
                                            description: 'A consulta de busca para a internet.'
                                        }
                                    },
                                    required: ['query']
                                }
                            }
                        ]
                    }
                ],
                toolConfig: {
                    functionCallingConfig: { mode: 'AUTO' }
                },
            });

            let result = await chat.sendMessage([{ text: message }]);
            let response = result.response;

            console.log("Resposta bruta da IA (result.response):", response);

            // Correção: Usar response.functionCalls() que retorna um array de chamadas de função
            // e verificar se o array não está vazio.
            const functionCalls = response.functionCalls();
            let currentFunctionCall = functionCalls && functionCalls.length > 0 ? functionCalls[0] : null;


            while (currentFunctionCall) { // Use a variável corrigida
                const functionCall = currentFunctionCall;

                // Não é mais necessário verificar typeof functionCall !== 'object'
                // pois response.functionCalls() deve retornar objetos válidos
                if (!functionCall || !functionCall.name) {
                    console.warn("IA tentou chamar uma função sem nome válido. Ignorando chamada de ferramenta malformada e prosseguindo.", functionCall);
                    setConversationHistory(prevHistory => [...prevHistory, { role: 'model', text: "A IA tentou usar uma função, mas não especificou qual ou de forma válida ou a chamada foi malformada. Prosseguindo sem a ferramenta." }]);
                    break;
                }

                if (functionCall.name === 'googleSearch') {
                    const query = functionCall.args.query;
                    console.log("IA solicitou busca na internet para:", query);

                    const searchResults = await googleSearch(query);

                    if ((searchResults as any).error) {
                        result = await chat.sendMessage([
                            {
                                functionResponse: {
                                    name: 'googleSearch',
                                    response: { error: (searchResults as any).error }
                                }
                            }
                        ]);
                    } else if ((searchResults as any).message) {
                        result = await chat.sendMessage([
                            {
                                functionResponse: {
                                    name: 'googleSearch',
                                    response: { message: (searchResults as any).message }
                                }
                            }
                        ]);
                    } else {
                        result = await chat.sendMessage([
                            {
                                functionResponse: {
                                    name: 'googleSearch',
                                    response: { results: searchResults }
                                }
                            }
                        ]);
                    }
                    response = result.response;
                    const nextFunctionCalls = response.functionCalls(); // Obter próximas chamadas de função
                    currentFunctionCall = nextFunctionCalls && nextFunctionCalls.length > 0 ? nextFunctionCalls[0] : null; // Atualize a variável para a próxima iteração
                } else {
                    console.warn("Função desconhecida chamada pela IA:", functionCall.name);
                    setConversationHistory(prevHistory => [...prevHistory, { role: 'model', text: "A IA tentou usar uma função desconhecida." }]);
                    break;
                }
            }

            if (response.text()) {
                const newAIResponse: ChatMessage = { role: 'model', text: response.text() };
                setConversationHistory(prevHistory => [...prevHistory, newAIResponse]);
            } else {
                // Se após o loop de ferramentas (ou se não houver ferramentas chamadas)
                // ainda não houver texto, isso pode indicar um problema ou uma chamada de ferramenta não resolvida
                // que não resultou em texto final.
                // Se o loop de ferramentas for exaustivo e sempre tiver um `response.text()` no final,
                // esta condição pode ser menos provável de ser atingida por uma falha "normal".
                // No entanto, se uma chamada de função for feita e o loop não conseguir obter uma resposta textual subsequente da IA,
                // esta mensagem de fallback pode ser útil.
                if (!currentFunctionCall) { // Apenas mostre se não for outra chamada de função
                    setConversationHistory(prevHistory => [...prevHistory, { role: 'model', text: "A IA não gerou uma resposta de texto final após o processamento." }]);
                }
            }

        } catch (e: any) {
            console.error("Erro ao interagir com a IA:", e);
            setAiError(true);
            setConversationHistory(prevHistory => [...prevHistory, { role: 'model', text: "Não foi possível obter uma resposta da IA no momento. Por favor, tente novamente mais tarde." }]);
        } finally {
            setAiLoading(false);
        }
    };


    // --- RENDERIZAÇÃO DO COMPONENTE ---
    const uniqueCategories = Array.from(new Set(documentsData.map(doc => doc.category))).filter(Boolean);

    return (
        <div className="app-container">
            <Header
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                categories={uniqueCategories}
                onCategorySelect={(category) => {
                    setSelectedCategory(category);
                    setSearchTerm('');
                    setSelectedDocumentId(null);
                    setAppMode('documents');
                    if (isMobile) setIsSidebarOpen(true); // Abre a sidebar em mobile ao mudar categoria
                }}
                selectedCategory={selectedCategory}
                onToggleMode={(mode: 'documents' | 'ai') => {
                    setAppMode(mode);
                    setSelectedDocumentId(null);
                    setConversationHistory([]);
                    if (isMobile) setIsSidebarOpen(false); // Fecha sidebar ao ir para modo AI
                }}
                currentMode={appMode}
                onToggleGeminiModel={(model: 'flash' | 'pro') => setActiveGeminiModel(model)}
                currentGeminiModel={activeGeminiModel}
                isMobile={isMobile} // Passa isMobile para o Header
                onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} // Função para alternar sidebar
            />

            <div className="main-content">
                {loading && <div className="loading-message">Carregando documentos...</div>}
                {error && <div className="error-message">{error}</div>}
                {!loading && !error && (
                    <>
                        {appMode === 'documents' ? (
                            <>
                                {/* Renderiza a Sidebar condicionalmente */}
                                {(isSidebarOpen || !isMobile) && (
                                    <Sidebar
                                        documents={filteredDocuments}
                                        onDocumentSelect={(id) => {
                                            setSelectedDocumentId(id);
                                            if (isMobile) setIsSidebarOpen(false); // Fecha sidebar ao selecionar documento em mobile
                                        }}
                                        selectedDocumentId={selectedDocumentId}
                                        message={
                                            (filteredDocuments.length > 0 && !currentDocument) ?
                                                'Selecione um documento na lista ou use a pesquisa.' :
                                                (filteredDocuments.length === 0 && searchTerm ?
                                                    'Nenhum documento encontrado com o termo de pesquisa.' :
                                                    (documentsData.length === 0 ?
                                                        'Não há documentos disponíveis.' :
                                                        'Selecione um documento na lista ou use a pesquisa.'))
                                        }
                                        isFiltering={isFiltering} // Passa o estado de filtragem
                                        isMobile={isMobile} // Passa o estado mobile para Sidebar
                                    />
                                )}
                                {/* Renderiza o DocumentDisplay */}
                                {/* Mostra em mobile se não houver sidebar aberta ou se tiver um documento selecionado */}
                                {(currentDocument || !isMobile || (isMobile && !isSidebarOpen && !selectedDocumentId)) ? (
                                    <DocumentDisplay
                                        document={currentDocument}
                                        searchTerm={searchTerm}
                                        message={
                                            (filteredDocuments.length > 0 && !currentDocument) ?
                                                'Selecione um documento na lista ou use a pesquisa.' :
                                                (filteredDocuments.length === 0 && searchTerm ?
                                                    'Nenhum documento encontrado com o termo de pesquisa.' :
                                                    (documentsData.length === 0 ?
                                                        'Não há documentos disponíveis.' :
                                                        'Selecione um documento na lista ou use a pesquisa.'))
                                        }
                                        onCloseDisplay={() => setSelectedDocumentId(null)} // Função para fechar o display em mobile
                                    />
                                ) : (
                                    isMobile && !currentDocument && isSidebarOpen && ( // Mensagem quando sidebar aberta e nenhum doc selecionado
                                        filteredDocuments.length > 0 ? (
                                            <div className="no-document-message">Selecione um documento na lista.</div>
                                        ) : (
                                            searchTerm && filteredDocuments.length === 0 ? (
                                                <div className="no-document-message">Nenhum documento encontrado com o termo de pesquisa.</div>
                                            ) : (
                                                documentsData.length === 0 && (
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
                                hasError={aiError}
                                message={
                                    documentsData.length === 0 ?
                                        'Não há documentos disponíveis para consulta da IA.' :
                                        'Digite sua pergunta para obter ajuda da IA com base na documentação e busca na internet (quando ativada).'
                                }
                                activeGeminiModel={activeGeminiModel}
                                conversationHistory={conversationHistory}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default App;