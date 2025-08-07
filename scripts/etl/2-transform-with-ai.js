// File: scripts/etl/2-transform-with-ai.js
import fetch from 'node-fetch';
import 'dotenv/config';

const MAX_CHUNK_SIZE_BYTES = 30000;

function forceChunking(text) {
  const chunks = [];
  let remainingText = text.trim();
  while (Buffer.byteLength(remainingText, 'utf8') > 0) {
    let splitPoint = remainingText.length;
    while (Buffer.byteLength(remainingText.substring(0, splitPoint), 'utf8') > MAX_CHUNK_SIZE_BYTES) {
      splitPoint = Math.floor(splitPoint * 0.9);
    }
    const potentialChunk = remainingText.substring(0, splitPoint);
    const lastPeriod = potentialChunk.lastIndexOf('.');
    const lastSpace = potentialChunk.lastIndexOf(' ');
    if (lastPeriod > -1) {
      splitPoint = lastPeriod + 1;
    } else if (lastSpace > -1) {
      splitPoint = lastSpace + 1;
    }
    chunks.push(remainingText.substring(0, splitPoint).trim());
    remainingText = remainingText.substring(splitPoint).trim();
  }
  return chunks.filter(c => c.length > 0);
}

export async function transformAndVectorize(extractedData) {
  console.log('--- Memulai Transformasi dan Vektorisasi (v2.1) ---');
  const transformedChunks = [];
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Variabel lingkungan GEMINI_API_KEY tidak ditemukan.');
  }
  
  // Model ini (text-embedding-004) menghasilkan vektor dengan 768 dimensi.
  const embeddingUrl = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`;

  for (const item of extractedData) {
    console.log(`    Memulai transformasi untuk: ${item.source_document}`);
    const chunks = forceChunking(item.content_text);
    console.log(`    Memecah teks menjadi ${chunks.length} chunk yang dijamin aman.`);

    for (const [index, chunk] of chunks.entries()) {
      console.log(`    Membuat embedding untuk chunk ${index + 1}/${chunks.length}...`);
      try {
        const response = await fetch(embeddingUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: "models/text-embedding-004",
            content: { parts: [{ text: chunk }] }
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API Gemini merespons dengan status ${response.status}: ${errorText}`);
        }

        const responseData = await response.json();
        const embeddingValues = responseData.embedding?.values;

        if (!embeddingValues) {
          throw new Error('Respons API tidak mengandung embedding yang valid.');
        }

        transformedChunks.push({
          source_document: item.source_document,
          content_text: chunk,
          content_embedding: embeddingValues
        });
        console.log(`    ✅ Embedding berhasil dibuat untuk chunk ${index + 1}.`);
      } catch (apiError) {
        console.error(`    ❌ Gagal membuat embedding untuk chunk ${index + 1}:`, apiError.message);
        throw new Error(`Gagal memproses chunk ${index + 1} dari ${item.source_document}: ${apiError.message}`);
      }
    }
  }
  console.log(`--- Transformasi dan Vektorisasi selesai. Total ${transformedChunks.length} chunk dibuat. ---`);
  return transformedChunks;
}