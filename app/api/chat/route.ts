import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';
import { client } from "@/sanity/lib/client"
import { groq } from "next-sanity"

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();

  // 1. Fetch products from Sanity to give the AI context
  const products = await client.fetch(
    groq`*[_type == "product"] {
      _id,
      name,
      "slug": slug.current,
      price,
      description,
      categories,
      colors
    }`
  );

  // 2. Create a system prompt with the product catalog
  const systemPrompt = `
    You are a helpful Personal Stylist for "DressCode", a premium fashion store.
    
    Here is our current product catalog:
    ${JSON.stringify(products, null, 2)}
    
    Your goal is to help customers find the perfect items.
    - If they ask for a recommendation, suggest specific products from the catalog.
    - Always mention the product Name and Price.
    - Be friendly, stylish, and concise.
    - If you suggest a product, you can format it as **Product Name** ($Price).
    - Do not invent products that are not in the catalog.
  `;

  // 3. Call OpenAI
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
  });

  // 4. Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);

  // 5. Respond with the stream
  return new StreamingTextResponse(stream);
}
