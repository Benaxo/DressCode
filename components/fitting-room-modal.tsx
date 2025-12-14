"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Sparkles, Upload, X } from "lucide-react"
import Image from "next/image"

interface FittingRoomModalProps {
    garmentUrl: string
    category?: string
}

const CLOTHING_CATEGORIES = ["t-shirt", "shirt", "pants", "jeans", "shorts", "dress", "jacket", "coat", "hoodie", "sweater", "top", "bottom", "upper_body", "lower_body"]

function isClothingCategory(category?: string): boolean {
    if (!category) return true
    return CLOTHING_CATEGORIES.some(c => category.toLowerCase().includes(c))
}

export function FittingRoomModal({ garmentUrl, category }: FittingRoomModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [resultImage, setResultImage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { toast } = useToast()
    
    const isClothing = isClothingCategory(category)
    
    // Show disabled button with message for accessories
    if (!isClothing) {
        return (
            <div className="space-y-2">
                <button 
                    disabled
                    className="w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-gray-300 dark:bg-gray-700 px-6 font-semibold text-gray-500 dark:text-gray-400 cursor-not-allowed"
                >
                    <Sparkles className="h-5 w-5" />
                    Virtual Try-On
                </button>
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                    ⚠️ Try-on is only available for clothing items (t-shirts, pants, dresses...)
                </p>
            </div>
        )
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast({ title: "Error", description: "Image must be less than 10MB", variant: "destructive" })
                return
            }
            const reader = new FileReader()
            reader.onloadend = () => setSelectedImage(reader.result as string)
            reader.readAsDataURL(file)
        }
    }

    const handleTryOn = async () => {
        if (!selectedImage) return

        setIsLoading(true)
        try {
            const response = await fetch("/api/try-on", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: selectedImage, garmentUrl, category }),
            })

            const data = await response.json()
            if (data.result) {
                setResultImage(data.result)
                toast({ title: "Success!", description: "Your try-on image is ready." })
            } else {
                toast({ title: "Error", description: data.error || "Failed to generate image.", variant: "destructive" })
            }
        } catch {
            toast({ title: "Error", description: "Something went wrong.", variant: "destructive" })
        } finally {
            setIsLoading(false)
        }
    }

    const clearImage = () => {
        setSelectedImage(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button className="btn-tryon w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-pink-500 px-6 font-semibold text-white">
                    <Sparkles className="h-5 w-5" />
                    Virtual Try-On
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>Virtual Fitting Room</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div className="space-y-4">
                        <h3 className="font-medium text-sm text-gray-500">1. Upload your photo</h3>
                        <div
                            onClick={() => !selectedImage && fileInputRef.current?.click()}
                            className="border-2 border-dashed rounded-lg h-[300px] flex flex-col items-center justify-center relative bg-gray-50 dark:bg-gray-900 cursor-pointer hover:border-fuchsia-400 transition-colors"
                        >
                            {selectedImage ? (
                                <>
                                    <Image src={selectedImage} alt="User" fill className="object-contain p-2" />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); clearImage() }}
                                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 z-10"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </>
                            ) : (
                                <div className="text-center space-y-2">
                                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                                    <p className="text-sm text-gray-500">Click to upload image</p>
                                    <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                        </div>
                        <Button
                            onClick={handleTryOn}
                            disabled={!selectedImage || isLoading}
                            className="w-full bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                "Try On Now"
                            )}
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-medium text-sm text-gray-500">2. Result</h3>
                        <div className="border rounded-lg h-[300px] flex items-center justify-center bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
                            {resultImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={resultImage} alt="Result" className="h-full w-full object-contain" />
                            ) : (
                                <div className="text-center text-gray-400">
                                    <Sparkles className="h-12 w-12 mx-auto opacity-20" />
                                    <p className="text-sm mt-2">Result will appear here</p>
                                </div>
                            )}
                        </div>
                        {resultImage && (
                            <Button variant="outline" className="w-full" onClick={() => window.open(resultImage, '_blank')}>
                                Download Image
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
