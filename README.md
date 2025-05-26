# 📞 Base de Conhecimento - WideVoice

Base de conhecimento, desenvolvida em React com Vite. O objetivo do projeto é fornecer uma interface intuitiva para consultar documentos técnicos e interagir com um assistente de IA (Google Gemini) para obter respostas rápidas e precisas.

## 🚀 Funcionalidades Atuais

- **Listagem e Visualização de Documentos:** Exibe documentos armazenados no Strapi, permitindo navegação e visualização do conteúdo formatado.
- **Filtragem por Categoria:** Opção para filtrar documentos por categorias pré-definidas.
- **Pesquisa Dinâmica:** Campo de busca para encontrar documentos por título ou conteúdo (texto simples).
- **Assistente de IA (Google Gemini):**
    - **Contextualização com Documentos:** A IA é capaz de responder perguntas baseadas no conteúdo dos documentos carregados do Strapi (Retrieval-Augmented Generation - RAG).
    - **Seleção de Modelo:** Possibilidade de alternar entre os modelos **Gemini 1.5 Flash** (rápido e eficiente) e **Gemini 1.5 Pro** (mais capacidade de raciocínio, ideal para perguntas complexas), permitindo otimizar o uso da IA.
    - **Instrução de Função:** A IA é instruída a atuar como um especialista da sua preferencia e a priorizar a base de conhecimento fornecida.
- **Design Responsivo:** A interface se adapta a diferentes tamanhos de tela (desktop e mobile).

## 🛠️ Tecnologias Utilizadas

- **Frontend:** [React](https://react.dev/) com [Vite](https://vitejs.dev/)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** CSS Puro
- **Gerenciador de Pacotes:** [npm](https://www.npmjs.com/)
- **Backend de Documentos:** [Strapi CMS](https://strapi.io/) (necessário estar rodando localmente)
- **Inteligência Artificial:** [Google Gemini API](https://ai.google.dev/) (modelos `gemini-1.5-flash` e `gemini-1.5-pro`)

## ⚙️ Configuração do Ambiente

Para rodar este projeto localmente, você precisará:

1. **Node.js e npm:** Instale a versão LTS mais recente.
2. **Backend Strapi:** O Strapi CMS precisa estar configurado e rodando em `http://localhost:1337`. Certifique-se de que sua API de documentos (`/api/documentos`) esteja acessível e populada com dados.
3. **Chave de API Google Gemini:** Obtenha uma chave de API para o Google Gemini em [Google AI Studio](https://ai.google.dev/).

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (na mesma pasta onde está o `package.json`) com as seguintes variáveis:

```env
VITE_GEMINI_API_KEY=SUA_CHAVE_DE_API_DO_GEMINI
```

⚠️ **Importante:** O arquivo `.env` já está configurado no `.gitignore` para não ser versionado. **Nunca** publique suas chaves de API diretamente no código ou em repositórios públicos.

## 🚀 Como Rodar o Projeto

Siga os passos abaixo para configurar e executar o frontend:

1. **Clone este repositório:**

   ```bash
   git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   cd SEU_REPOSITORIO
   ```
   (Substitua `SEU_USUARIO` e `SEU_REPOSITORIO` pelos seus dados reais do GitHub)

2. **Instale as dependências:**

   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**

   ```bash
   npm run dev
   ```

   O aplicativo estará disponível em `http://localhost:5173` (ou outra porta, se 5173 estiver em uso).

## 📄 Estrutura do Projeto

```
.
├── public/                 # Arquivos estáticos (favicon, index.html)
├── src/
│   ├── assets/             # Imagens, ícones, etc.
│   ├── components/         # Componentes React reutilizáveis
│   │   ├── AIInteraction/
│   │   ├── DocumentDisplay/
│   │   ├── DocumentList/
│   │   ├── Header/
│   │   └── Sidebar/
│   │       └── ...
│   ├── App.css             # Estilos globais ou do App
│   ├── App.tsx             # Componente principal da aplicação
│   ├── main.tsx            # Ponto de entrada da aplicação
│   └── vite-env.d.ts       # Definições de tipo para o Vite
├── .env                    # Variáveis de ambiente (ignorado pelo Git)
├── .gitignore              # Arquivos e pastas a serem ignorados pelo Git
├── package.json            # Metadados do projeto e scripts
├── README.md               # Este arquivo!
├── tsconfig.json           # Configuração do TypeScript
└── vite.config.ts          # Configuração do Vite
```