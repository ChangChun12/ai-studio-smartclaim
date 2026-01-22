
import * as pdfjsLib from 'pdfjs-dist';
import { UploadedDocument, PdfPage } from '../types';

// Set the worker source to the same version as the main library
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';

export const extractPdfData = async (file: File): Promise<UploadedDocument> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    const pages: PdfPage[] = [];
    
    // Iterate through all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      const items = textContent.items.map((item: any) => ({
        str: item.str,
        y: item.transform[5],
        height: item.height
      }));
      
      let pageText = "";
      let lastY = -1;

      // Simple reconstruction logic to handle line breaks based on Y-coordinate changes
      items.forEach((item) => {
        if (lastY !== -1 && Math.abs(item.y - lastY) > item.height * 0.5) {
          pageText += "\n";
        }
        pageText += item.str + " ";
        lastY = item.y;
      });
      
      const cleanPageText = pageText.trim();

      if (cleanPageText.length > 0) {
        pages.push({
          pageNumber: i,
          content: cleanPageText
        });
        fullText += `--- Page ${i} ---\n${cleanPageText}\n\n`;
      }
    }

    const fileUrl = URL.createObjectURL(file);

    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      pages: pages,
      fullText: fullText,
      fileUrl: fileUrl,
      chatHistory: [], // Populated later by AI summary
      suggestedQuestions: []
    };
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("無法讀取 PDF 檔案，請確認檔案是否損壞或加密。");
  }
};
