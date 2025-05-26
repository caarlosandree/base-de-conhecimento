import PyPDF2
import os
import json

def extract_text_from_pdf(pdf_path):
    text = ""
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for page_num in range(len(reader.pages)):
                page = reader.pages[page_num]
                text += page.extract_text() + "\n"
    except Exception as e:
        print(f"Erro ao extrair texto de {pdf_path}: {e}")
        return None
    return text

def process_pdfs_in_folder(pdf_folder_path, output_json_path):
    all_docs_data = []
    for filename in os.listdir(pdf_folder_path):
        if filename.lower().endswith('.pdf'):
            pdf_path = os.path.join(pdf_folder_path, filename)
            print(f"Processando: {filename}")
            content = extract_text_from_pdf(pdf_path)

            if content:
                doc_id = os.path.splitext(filename)[0].replace(' ', '-').lower()
                doc_title = os.path.splitext(filename)[0].replace('-', ' ').title()
                doc_category = "Geral" # Você pode adicionar lógica para definir categorias aqui

                all_docs_data.append({
                    "id": doc_id,
                    "title": doc_title,
                    "category": doc_category,
                    "content": content.strip()
                })

    # Salva em um arquivo JSON
    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(all_docs_data, f, ensure_ascii=False, indent=2)

    print(f"\nExtração concluída! Dados salvos em: {output_json_path}")


if __name__ == "__main__":
    # --- CONFIGURAÇÃO ---
    # Crie uma pasta 'pdfs_para_processar' na raiz do seu projeto e coloque seus PDFs lá.
    PDF_FOLDER = 'pdfs_para_processar'

    # Caminho para o arquivo JSON de saída que será usado pelo seu React
    OUTPUT_JSON = os.path.join('src', 'data', 'extracted_docs.json')
    # --- FIM DA CONFIGURAÇÃO ---

    # Certifica-se de que a pasta de PDFs exista
    if not os.path.exists(PDF_FOLDER):
        os.makedirs(PDF_FOLDER)
        print(f"Pasta '{PDF_FOLDER}' criada. Coloque seus PDFs aqui e execute o script novamente.")
    else:
        process_pdfs_in_folder(PDF_FOLDER, OUTPUT_JSON)