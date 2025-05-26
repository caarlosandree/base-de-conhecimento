// src/components/AIInteraction.tsx
import React, { useState } from 'react';
import './AIInteraction.css'; // Vamos criar este CSS

interface AIInteractionProps {
    onSendMessage: (message: string) => void;
    isLoading: boolean;
    aiResponse: string | null;
    hasError: boolean;
    message: string; // Para a mensagem do DocumentDisplay
}

const AIInteraction: React.FC<AIInteractionProps> = ({ onSendMessage, isLoading, aiResponse, hasError, message }) => {
    const [inputText, setInputText] = useState('');

    const handleSend = () => {
        if (inputText.trim()) {
            onSendMessage(inputText);
            setInputText(''); // Limpa o input após enviar
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <div className="ai-interaction-container">
            <h3>Pergunte à IA:</h3>
            <div className="ai-input-area">
                <input
                    type="text"
                    placeholder="Como resolver o problema de áudio?"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                />
                <button onClick={handleSend} disabled={isLoading}>
                    {isLoading ? 'Enviando...' : 'Perguntar'}
                </button>
            </div>

            {aiResponse && (
                <div className="ai-response-area">
                    <h4>Resposta da IA:</h4>
                    <p>{aiResponse}</p>
                </div>
            )}

            {hasError && (
                <div className="ai-error-message">
                    Ocorreu um erro ao processar sua pergunta. Tente novamente.
                </div>
            )}

            {/* Exibir a mensagem padrão do DocumentDisplay aqui se não houver resposta da IA */}
            {!aiResponse && !isLoading && !hasError && (
                <div className="ai-placeholder-message">
                    {message || "Digite sua pergunta acima para obter ajuda da IA."}
                </div>
            )}
        </div>
    );
};

export default AIInteraction;