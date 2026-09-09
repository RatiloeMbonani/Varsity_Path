export interface ExtractedAssessmentItem {
  id: string;
  subject: string;
  topic: string;
  mark: number | '';
  date: string;
  confidenceNotes?: string;
}

export interface ExtractionResponse {
  success: boolean;
  errorMessage?: string;
  results: ExtractedAssessmentItem[];
}

export class GeminiExtractionService {
  /**
   * Convert browser File object to Base64 string
   */
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Send document to server-side Gemini extraction endpoint
   */
  static async extractFromDocument(file: File): Promise<ExtractionResponse> {
    // 1. Client-side validation of file format
    const validMimeTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg',
    ];

    const mime = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    const isValidFormat =
      validMimeTypes.includes(mime) ||
      fileName.endsWith('.pdf') ||
      fileName.endsWith('.png') ||
      fileName.endsWith('.jpg') ||
      fileName.endsWith('.jpeg');

    if (!isValidFormat) {
      return {
        success: false,
        errorMessage: 'Invalid file type. Supported formats are PDF, PNG, JPG, and JPEG.',
        results: [],
      };
    }

    // 2. Client-side file size check (max 20MB)
    const MAX_SIZE_BYTES = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      return {
        success: false,
        errorMessage: 'File size exceeds 20MB limit. Please upload a smaller or compressed document.',
        results: [],
      };
    }

    try {
      // 3. Convert to base64
      const base64Data = await this.fileToBase64(file);

      // Determine clean MIME
      let effectiveMime = file.type || 'application/pdf';
      if (fileName.endsWith('.pdf')) effectiveMime = 'application/pdf';
      else if (fileName.endsWith('.png')) effectiveMime = 'image/png';
      else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) effectiveMime = 'image/jpeg';

      // 4. Send to server endpoint
      const response = await fetch('/api/extract-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileData: base64Data,
          mimeType: effectiveMime,
          fileName: file.name,
        }),
      });

      if (!response.ok) {
        let errMessage = `Server error (${response.status})`;
        try {
          const errData = await response.json();
          if (errData?.errorMessage) errMessage = errData.errorMessage;
        } catch {
          // ignore json parse error
        }
        return {
          success: false,
          errorMessage: errMessage,
          results: [],
        };
      }

      const data = await response.json();

      if (!data.success) {
        return {
          success: false,
          errorMessage:
            data.errorMessage ||
            'The uploaded document could not be reliably read. Please verify the document quality or use manual entry.',
          results: [],
        };
      }

      // Map results and assign temporary unique IDs for editable list
      const rawResults: any[] = Array.isArray(data.results) ? data.results : [];
      const formattedResults: ExtractedAssessmentItem[] = rawResults.map((item, idx) => ({
        id: `extracted_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        subject: item.subject ? String(item.subject).trim() : '',
        topic: item.topic ? String(item.topic).trim() : '',
        mark: typeof item.mark === 'number' && !isNaN(item.mark) ? Math.round(item.mark) : '',
        date: item.date ? String(item.date).trim() : new Date().toISOString().split('T')[0],
        confidenceNotes: item.confidenceNotes ? String(item.confidenceNotes) : undefined,
      }));

      if (formattedResults.length === 0) {
        return {
          success: false,
          errorMessage:
            'No Grade 11 or 12 assessment marks were identified in the uploaded document. You can add them manually or try a clearer document.',
          results: [],
        };
      }

      return {
        success: true,
        results: formattedResults,
      };
    } catch (err: any) {
      console.error('Gemini document extraction error:', err);
      return {
        success: false,
        errorMessage:
          err?.message ||
          'Failed to connect to the document analysis service. Please check your network or try again.',
        results: [],
      };
    }
  }
}
