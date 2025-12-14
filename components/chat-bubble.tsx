"use client"

import { useChat, type Message } from "ai/react"
import { Sparkles, X, Send, AlertCircle } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import Link from "next/link"

function parseMessageContent(content: string) {
    const parts: (string | { type: 'product', name: string, price: string, slug: string })[] = []
    const productRegex = /\*\*([^*]+)\*\*\s*\(\$?([\d,.]+)\)/g
    let lastIndex = 0
    let match

    while ((match = productRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
            parts.push(content.slice(lastIndex, match.index))
        }
        const productName = match[1]
        const price = match[2]
        const slug = productName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        parts.push({ type: 'product', name: productName, price, slug })
        lastIndex = match.index + match[0].length
    }

    if (lastIndex < content.length) {
        parts.push(content.slice(lastIndex))
    }

    return parts.length > 0 ? parts : [content]
}

function MessageContent({ content }: { content: string }) {
    const parts = parseMessageContent(content)

    return (
        <div className="whitespace-pre-wrap break-words">
            {parts.map((part, i) => {
                if (typeof part === 'string') {
                    return <span key={i}>{part}</span>
                }
                return (
                    <Link
                        key={i}
                        href={`/products/${part.slug}`}
                        className="inline-flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary font-medium px-2 py-0.5 rounded transition-colors"
                    >
                        <span className="font-semibold">{part.name}</span>
                        <span className="text-xs opacity-75">${part.price}</span>
                    </Link>
                )
            })}
        </div>
    )
}

export function ChatBubble() {
    const [isOpen, setIsOpen] = useState(false)
    const [showTooltip, setShowTooltip] = useState(false)
    const [rateLimitError, setRateLimitError] = useState<string | null>(null)
    const [remaining, setRemaining] = useState<number | null>(null)
    
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        onResponse: (response: Response) => {
            const remainingHeader = response.headers.get('X-RateLimit-Remaining')
            if (remainingHeader) setRemaining(parseInt(remainingHeader))
            setRateLimitError(null)
        },
        onError: (error: Error) => {
            if (error.message.includes('429') || error.message.includes('Limit')) {
                setRateLimitError("Daily limit reached (20 messages). Come back tomorrow!")
                setRemaining(0)
            }
        }
    })
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    useEffect(() => {
        if (isOpen && remaining === null) {
            fetch('/api/chat')
                .then(res => res.json())
                .then(data => setRemaining(data.remaining))
                .catch(() => {})
        }
    }, [isOpen, remaining])

    useEffect(() => {
        if (isOpen) {
            setShowTooltip(false)
            return
        }
        const showTimer = setTimeout(() => setShowTooltip(true), 3000)
        const hideTimer = setTimeout(() => setShowTooltip(false), 8000)
        const interval = setInterval(() => {
            setShowTooltip(true)
            setTimeout(() => setShowTooltip(false), 5000)
        }, 15000)

        return () => {
            clearTimeout(showTimer)
            clearTimeout(hideTimer)
            clearInterval(interval)
        }
    }, [isOpen])

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
            {isOpen && (
                <div className="w-[380px] h-[520px] bg-background border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className="p-4 border-b bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Personal Stylist</h3>
                                <p className="text-xs opacity-90">Your AI fashion advisor</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-white/20 text-white"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                        <div className="flex flex-col gap-4">
                            {messages.length === 0 && (
                                <div className="text-center text-muted-foreground text-sm mt-8 space-y-2">
                                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 flex items-center justify-center mb-4">
                                        <Sparkles className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                                    </div>
                                    <p className="font-medium text-foreground">👋 Hello! I&apos;m your AI Stylist.</p>
                                    <p>Ask me something like:</p>
                                    <p className="italic text-violet-600 dark:text-violet-400">&quot;What should I wear for a summer wedding?&quot;</p>
                                </div>
                            )}
                            {messages.map((m: Message) => (
                                <div
                                    key={m.id}
                                    className={cn(
                                        "flex flex-col gap-1 rounded-xl px-4 py-3 text-sm max-w-[90%]",
                                        m.role === "user"
                                            ? "ml-auto bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                                            : "bg-muted/80 mr-auto"
                                    )}
                                >
                                    {m.role === "user" ? (
                                        <span className="whitespace-pre-wrap break-words">{m.content}</span>
                                    ) : (
                                        <MessageContent content={m.content} />
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="bg-muted/80 w-max rounded-xl px-4 py-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                        <span className="text-muted-foreground">Thinking...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <div className="border-t bg-muted/30">
                        {rateLimitError && (
                            <div className="px-4 py-2 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                                <AlertCircle className="h-3 w-3" />
                                {rateLimitError}
                            </div>
                        )}
                        {remaining !== null && remaining > 0 && (
                            <div className="px-4 py-1 text-xs text-muted-foreground text-center">
                                {remaining} message{remaining > 1 ? 's' : ''} remaining today
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="p-4 pt-2 flex gap-2">
                            <Input
                                value={input}
                                onChange={handleInputChange}
                                placeholder="Type your message..."
                                className="flex-1 bg-background"
                                disabled={remaining === 0}
                            />
                            <Button 
                                type="submit" 
                                size="icon" 
                                disabled={isLoading || remaining === 0}
                                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </div>
            )}

            <div className="relative">
                {!isOpen && showTooltip && (
                    <div className="absolute bottom-full right-0 mb-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg whitespace-nowrap">
                            ✨ Need help?
                            <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-indigo-600 rotate-45" />
                        </div>
                    </div>
                )}
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    size="icon"
                    className={cn(
                        "h-14 w-14 rounded-full shadow-xl transition-all duration-300",
                        isOpen 
                            ? "bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600" 
                            : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 chat-bubble-pulse"
                    )}
                >
                    {isOpen ? (
                        <X className="h-6 w-6 text-white" />
                    ) : (
                        <Sparkles className="h-6 w-6 text-white" />
                    )}
                </Button>
            </div>
        </div>
    )
}
