import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';
import { client } from "@/sanity/lib/client"
import { groq } from "next-sanity"
import { checkRateLimit, getRateLimitInfo } from "@/lib/rate-limit"
import { headers } from "next/headers"

export const dynamic = 'force-dynamic'

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

function getClientIP(): string {
  const headersList = headers()
  const forwardedFor = headersList.get('x-forwarded-for')
  const realIP = headersList.get('x-real-ip')
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  if (realIP) {
    return realIP
  }
  return 'unknown'
}

export async function POST(req: Request) {
  const clientIP = getClientIP()
  const rateLimit = checkRateLimit(clientIP)
  
  if (!rateLimit.allowed) {
    const resetDate = new Date(rateLimit.resetAt)
    return new Response(
      JSON.stringify({ 
        error: `Daily limit reached (20 messages/day). Resets at midnight.`,
        resetAt: resetDate.toISOString()
      }), 
      { 
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': resetDate.toISOString()
        }
      }
    )
  }

  const { messages } = await req.json();

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
    - Respond in English.
  `;

  const response = await openai.chat.completions.create({
    model: 'meta-llama/llama-3.1-70b-instruct',
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
  });

  const stream = OpenAIStream(response);

  return new StreamingTextResponse(stream, {
    headers: {
      'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString()
    }
  });
}

export async function GET() {
  const clientIP = getClientIP()
  const info = getRateLimitInfo(clientIP)
  
  return new Response(JSON.stringify({
    remaining: info.remaining,
    resetAt: new Date(info.resetAt).toISOString()
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
