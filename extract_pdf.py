import sys

try:
    import PyPDF2
    
    pdf_path = r'C:\Users\JAYAPRAKASH R\Desktop\csc.pdf'
    output_path = r'C:\Users\JAYAPRAKASH R\Desktop\project_CSC\pdf_content.txt'
    
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        num_pages = len(pdf_reader.pages)
        
        with open(output_path, 'w', encoding='utf-8') as output:
            output.write(f"Total pages: {num_pages}\n")
            output.write("="*80 + "\n\n")
            
            for page_num in range(num_pages):
                page = pdf_reader.pages[page_num]
                text = page.extract_text()
                output.write(f"\n--- Page {page_num + 1} ---\n\n")
                output.write(text)
                output.write("\n\n" + "="*80 + "\n")
    
    print(f"Successfully extracted {num_pages} pages to pdf_content.txt")
    
    # Also print first page as preview
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        first_page = pdf_reader.pages[0]
        print("\n--- First Page Preview ---\n")
        print(first_page.extract_text())
            
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
