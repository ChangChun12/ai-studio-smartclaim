
import * as pdfjsLib from 'pdfjs-dist';
import { UploadedDocument, PdfPage } from '../types';

// Set the worker source
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
      
      // Sort items by Y (top to bottom), then X (left to right)
      const items = textContent.items.map((item: any) => ({
        str: item.str,
        x: item.transform[4],
        y: item.transform[5],
        height: item.height,
        width: item.width
      }));

      // Sort: Higher Y means higher on page (PDF coords usually start bottom-left, 
      // but textContent often gives normal reading order. We'll stick to a simple sort just in case)
      // Actually, PDF.js usually returns items in reading order, but let's be safe.
      // Note: In PDF coords, (0,0) is usually bottom-left. So higher Y is top.
      // But we will trust the default order for now and just handle line breaks.
      
      let pageText = "";
      let lastY = -1;

      // Simple reconstruction logic
      items.forEach((item) => {
        // If Y changes significantly, add a newline
        if (lastY !== -1 && Math.abs(item.y - lastY) > item.height * 0.5) {
          pageText += "\n";
        }
        // Add space if needed? Simple concatenation for now
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
      chatHistory: [], // Intentionally empty, will be populated by AI summary in ChatInterface
      suggestedQuestions: [] // Initialize empty
    };
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("無法讀取 PDF 檔案，請確認檔案是否損壞或加密。");
  }
};