import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import "dotenv/config";

const app = express();
const PORT = 3000;

// Support uploads of document/images up to 25MB
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not configured on the server. Please ensure the API key is provided in the application settings."
      );
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Endpoint: Extract test / assessment results from uploaded document (PDF or Image)
app.post("/api/extract-results", async (req, res) => {
  try {
    const { fileData, mimeType, fileName } = req.body;

    if (!fileData || !mimeType) {
      return res.status(400).json({
        success: false,
        errorMessage: "No file data or MIME type provided in the request.",
      });
    }

    // Normalize mimeType
    let cleanMimeType = mimeType.toLowerCase();
    if (cleanMimeType === "image/jpg") {
      cleanMimeType = "image/jpeg";
    }

    const supportedMimeTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (!supportedMimeTypes.includes(cleanMimeType)) {
      return res.status(400).json({
        success: false,
        errorMessage: `Unsupported file format (${mimeType}). Supported formats are PDF, PNG, and JPEG.`,
      });
    }

    // Strip data URL prefix if present
    const base64Data = fileData.replace(/^data:[^;]+;base64,/, "");

    const ai = getGenAI();

    const systemInstruction = `You are an educational document analyzer for South African Grade 11 and Grade 12 (CAPS / NSC curriculum) school test reports, exam scripts, cycle test feedback, and subject mark sheets.
Your task is to examine the provided student document (image or PDF) and extract all identifiable academic assessment results.

For each identifiable result in the document, extract:
- subject: The official CAPS school subject name (e.g., Mathematics, Mathematical Literacy, Physical Sciences, Life Sciences, English Home Language, English First Additional Language, Afrikaans Home Language, Accounting, Business Studies, Economics, History, Geography, Information Technology, CAT, Life Orientation). If you cannot confidently identify the subject, return an empty string "".
- topic: The specific topic or section tested (e.g. Euclidean Geometry, Analytical Geometry, Calculus, Stoichiometry, Newton's Laws, Organic Chemistry, Genetics, Meiosis, Cash Flow Statements, Macroeconomics). If the document only shows a general test title like "Term 1 Test" or "Mid-year Exam", extract that as the topic. If completely unknown, return an empty string "". DO NOT invent a topic.
- mark: The student's final percentage mark as an integer between 0 and 100. If the document displays raw scores (e.g. 38/50), calculate the percentage (76). If the mark is not legible, ambiguous, or not found, return null.
- date: The date of the assessment in YYYY-MM-DD format if identifiable anywhere on the document (e.g., header, stamp, date line). If only year/month is present or if no date is found, return an empty string "". DO NOT invent or guess a date.
- confidenceNotes: A short note describing what was found (e.g., "Found raw score 38/50 on Euclidean Geometry", or "Topic not listed on paper; subject identified from header").

CRITICAL SAFETY & ACCURACY RULES:
1. NEVER invent, hallucinate, or assume marks, topics, or subjects that are not present in the document. If in doubt, return null for mark and empty string "" for text fields.
2. If the document is completely illegible, blank, corrupted, or is NOT a school assessment/report/test, set success to false and provide a clear, helpful errorMessage for the student (e.g., "The uploaded document could not be reliably read as an academic test report or assessment. Please verify the image quality or use manual entry.").
3. Do not return mock or sample data.`;

    const prompt = `Analyze this uploaded document (${fileName || "document"}) and extract any Grade 11 or Grade 12 assessment results visible.`;

    let response;
    const modelCandidates = ["gemini-3.6-flash", "gemini-3.1-flash-lite", "gemini-3.8-flash"];
    let lastError: any = null;

    for (const modelName of modelCandidates) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: cleanMimeType,
                  data: base64Data,
                },
              },
              {
                text: prompt,
              },
            ],
          },
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                success: {
                  type: Type.BOOLEAN,
                  description:
                    "Whether academic assessment results could be identified and extracted",
                },
                errorMessage: {
                  type: Type.STRING,
                  description:
                    "Explanation if document could not be understood or is not an assessment",
                },
                results: {
                  type: Type.ARRAY,
                  description: "Extracted assessment result items",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      subject: {
                        type: Type.STRING,
                        description: "CAPS subject name or empty string if unidentifiable",
                      },
                      topic: {
                        type: Type.STRING,
                        description: "Topic or test section or empty string if unidentifiable",
                      },
                      mark: {
                        type: Type.NUMBER,
                        description: "Percentage mark (0-100) or null if unidentifiable",
                      },
                      date: {
                        type: Type.STRING,
                        description: "Date in YYYY-MM-DD format or empty string",
                      },
                      confidenceNotes: {
                        type: Type.STRING,
                        description: "Brief confidence explanation",
                      },
                    },
                    required: ["subject", "topic"],
                  },
                },
              },
              required: ["success", "results"],
            },
          },
        });
        if (response?.text) {
          break; // successfully generated
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} failed or unavailable:`, err?.message || err);
      }
    }

    if (!response || !response.text) {
      return res.status(502).json({
        success: false,
        errorMessage:
          lastError?.message ||
          "Document analysis service is temporarily unavailable. Please try again or use manual entry.",
      });
    }

    const responseText = response.text;
    let parsedData: any;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseErr) {
      console.error("JSON parse error from Gemini output:", responseText);
      return res.status(502).json({
        success: false,
        errorMessage: "Unable to parse structured result from the analysis service.",
      });
    }

    return res.json(parsedData);
  } catch (error: any) {
    console.error("Error analyzing document with Gemini:", error);
    return res.status(500).json({
      success: false,
      errorMessage:
        error?.message || "An error occurred while analyzing the document with Gemini.",
    });
  }
});

// Vite middleware & Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`VarsityPath server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
