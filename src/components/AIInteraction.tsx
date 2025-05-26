import React, { useState, FormEvent, useEffect, useRef } from 'react';
import './AIInteraction.css'; // Certifique-se de que este arquivo existe para os estilos

// Definindo a interface ChatMessage (pode ser importada de um arquivo de tipos compartilhado)
interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

type ActiveGeminiModelType = 'flash' | 'pro';

interface AIInteractionProps {
    onSendMessage: (message: string) => void;
    isLoading: boolean;
    // aiResponse: string | null; // Esta prop não é mais usada para exibição de mensagens
    hasError: boolean;
    message: string;
    activeGeminiModel: ActiveGeminiModelType;
    // NOVA PROP: Recebe o histórico completo da conversa
    conversationHistory: ChatMessage[];
}

const AIInteraction: React.FC<AIInteractionProps> = ({
                                                         onSendMessage,
                                                         isLoading,
                                                         // aiResponse, // Não precisamos mais desta prop para renderizar as mensagens
                                                         hasError,
                                                         message,
                                                         activeGeminiModel,
                                                         conversationHistory, // Recebendo o histórico
                                                     }) => {
    const [inputMessage, setInputMessage] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Rola para o final da conversa quando o histórico, o carregamento ou o erro mudam
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [conversationHistory, isLoading, hasError]); // Adicionado hasError ao array de dependências

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (inputMessage.trim() && !isLoading) {
            onSendMessage(inputMessage);
            setInputMessage('');
        }
    };

    const getModelDisplayName = (model: ActiveGeminiModelType) => {
        if (model === 'flash') {
            return 'Gemini 1.5 Flash';
        } else if (model === 'pro') {
            return 'Gemini 2.5 Preview';
        }
        return 'Modelo Desconhecido';
    };

    return (
        <div className="ai-interaction-container">
            {/* O formulário de input permanece na parte inferior */}
            <form onSubmit={handleSubmit} className="ai-input-form">
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={isLoading ? "Aguarde..." : "Digite sua pergunta para a IA..."}
                    disabled={isLoading}
                    aria-label="Digite sua pergunta para a IA"
                />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Enviando...' : 'Enviar'}
                </button>
            </form>

            {/* A área de exibição das mensagens permanece na parte superior */}
            <div className="ai-messages-display">
                {/* Indicador do modelo Gemini ativo - permanece no topo */}
                <div className="active-model-indicator">
                    <span>Modelo Ativo: </span>
                    <span className={`model-name ${activeGeminiModel}`}>
                        {getModelDisplayName(activeGeminiModel)}
                    </span>
                </div>

                {/* Mensagem instrutiva inicial - exibida apenas se não houver histórico e nenhum processo ativo */}
                {conversationHistory.length === 0 && !isLoading && !hasError && (
                    <div className="ai-message initial-message">
                        <p>{message}</p>
                    </div>
                )}

                {/* Renderiza todas as mensagens do histórico */}
                {conversationHistory.map((msg, index) => (
                    <div key={index} className={`ai-message ${msg.role}-message`}>
                        <p>{msg.text}</p>
                    </div>
                ))}

                {/* Indicador de Carregamento - agora aparece NO FINAL do histórico */}
                {isLoading && (
                    <div className="ai-message loading-message">
                        <div className="spinner"></div>
                        <p>A IA está pensando...</p>
                    </div>
                )}

                {/* Mensagem de Erro - agora aparece NO FINAL do histórico, se hasError for true e não houver loading */}
                {hasError && !isLoading && ( // Exibe o erro se não estiver carregando
                    <div className="ai-message error-message">
                        <p>Ocorreu um erro ao interagir com a IA. Por favor, tente novamente.</p>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};

export default AIInteraction;