import { NextResponse } from "next/server";
import Replicate, { FileOutput } from "replicate";

export const dynamic = 'force-dynamic'

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

const CLOTHING_CATEGORIES = ["t-shirt", "shirt", "pants", "jeans", "shorts", "dress", "jacket", "coat", "hoodie", "sweater", "top", "bottom", "upper_body", "lower_body"];
const ACCESSORY_CATEGORIES = ["bags", "belts", "scarves", "gloves", "sunglasses", "hat", "watch", "jewelry", "shoes"];

function isClothing(category?: string): boolean {
    if (!category) return true;
    const cat = category.toLowerCase();
    return CLOTHING_CATEGORIES.some(c => cat.includes(c)) || !ACCESSORY_CATEGORIES.some(c => cat.includes(c));
}

async function extractImageUrl(output: unknown): Promise<string | null> {
    if (!output) return null;
    
    // Handle string URL directly
    if (typeof output === "string") return output;
    
    // Handle array - recurse on first element
    if (Array.isArray(output) && output.length > 0) {
        return extractImageUrl(output[0]);
    }
    
    // Handle FileOutput from Replicate
    if (output && typeof output === "object") {
        const obj = output as Record<string, unknown>;
        
        // Check for url() method (FileOutput)
        if (typeof obj.url === "function") {
            return obj.url() as string;
        }
        
        // Check for url property
        if (typeof obj.url === "string") {
            return obj.url;
        }
        
        // Check for href property
        if (typeof obj.href === "string") {
            return obj.href;
        }
        
        // Try toString() if it looks like a URL
        const str = String(output);
        if (str.startsWith("http")) {
            return str;
        }
    }
    
    return null;
}

export async function POST(req: Request) {
    try {
        const { image, garmentUrl, category } = await req.json();

        if (!image || !garmentUrl) {
            return NextResponse.json({ error: "Missing image or garment URL" }, { status: 400 });
        }

        // Only clothing is supported for virtual try-on
        if (!isClothing(category)) {
            return NextResponse.json({ 
                error: "Virtual try-on is only available for clothing items (t-shirts, pants, dresses, etc.). Accessories are not supported." 
            }, { status: 400 });
        }

        const output = await replicate.run(
            "cuuupid/idm-vton:0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985",
            {
                input: {
                    human_img: image,
                    garm_img: garmentUrl,
                    garment_des: category || "clothing",
                    crop: false,
                    seed: 42,
                    steps: 30,
                },
            }
        );

        console.log("Replicate output:", {
            type: typeof output,
            constructor: output?.constructor?.name,
            isArray: Array.isArray(output),
            keys: output && typeof output === "object" ? Object.keys(output) : [],
            toString: String(output).substring(0, 200),
        });
        
        const imageUrl = await extractImageUrl(output);
        
        if (!imageUrl) {
            console.error("Could not extract URL. Raw output:", output);
            return NextResponse.json({ error: "No image URL in response" }, { status: 500 });
        }
        
        console.log("Extracted URL:", imageUrl);

        return NextResponse.json({ result: imageUrl });
    } catch (error) {
        console.error("Try-on Error:", error);
        const message = error instanceof Error ? error.message : "Failed to generate try-on image";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
