"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef, type ReactNode, useLayoutEffect } from "react"
import { Sparkles, MessageCircle } from "lucide-react"
import { useMotionValue } from "framer-motion"
import type { MotionValue } from "framer-motion"
import type { RefObject } from "react"

interface ShowcaseItem {
    image: string
    origin: "left" | "right"
}

const showcaseItems: ShowcaseItem[] = [
    { image: "/images/pexels-anubhaw-anand-3756030.jpg", origin: "right" },
    { image: "/images/pexels-dystopiasavagestudios-19373013.jpg", origin: "left" },
    { image: "/images/pexels-ogproductionz-15647646.jpg", origin: "left" },
    { image: "/images/pexels-ogproductionz-17243661.jpg", origin: "right" },
    { image: "/images/pexels-mohammad-gharib-2150556332-34769616.jpg", origin: "left" },
]

const gridLayout = [
    [0, null, 1, null],
    [null, 2, null, null],
    [3, null, null, 4],
]

const ShowcaseImage = ({ item }: { item: ShowcaseItem }) => {
    const ref = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    })
    const scale = useTransform(scrollYProgress, [0, 0.4, 0.7, 1], [0, 1, 1, 0])

    return (
        <motion.div
            ref={ref}
            className="relative h-full w-full"
            style={{
                transformOrigin: item.origin === "left" ? "bottom left" : "bottom right",
                scale,
            }}
        >
            <img
                src={item.image}
                alt="Fashion showcase"
                className="h-full w-full object-cover rounded-xl shadow-2xl transition-all hover:scale-95"
            />
        </motion.div>
    )
}

// Gradient Card Components
type MouseMotionState = {
    elementLeft: MotionValue<string>
    elementTop: MotionValue<string>
    opacity: MotionValue<number>
}

function useMouse(): [MouseMotionState, RefObject<HTMLDivElement | null>] {
    const elementX = useMotionValue<number | null>(null)
    const elementY = useMotionValue<number | null>(null)
    const elementLeft = useTransform(elementX, (v) => v === null ? "-9999px" : `${v}px`)
    const elementTop = useTransform(elementY, (v) => v === null ? "-9999px" : `${v}px`)
    const opacity = useMotionValue<number>(0)
    const ref = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!ref.current) return
            const { left, top } = ref.current.getBoundingClientRect()
            elementX.set(e.clientX - left)
            elementY.set(e.clientY - top)
            opacity.set(1)
        }
        const handleMouseLeave = () => {
            elementX.set(null)
            elementY.set(null)
            opacity.set(0)
        }
        ref.current?.addEventListener("mousemove", handleMouseMove)
        ref.current?.addEventListener("mouseleave", handleMouseLeave)
        return () => {
            ref.current?.removeEventListener("mousemove", handleMouseMove)
            ref.current?.removeEventListener("mouseleave", handleMouseLeave)
        }
    }, [elementX, elementY, opacity])

    return [{ elementLeft, elementTop, opacity }, ref]
}

const FeatureCard = ({ icon, title, description }: { icon: ReactNode; title: string; description: string }) => {
    const [mouse, ref] = useMouse()

    return (
        <div ref={ref} className="group relative transform-gpu overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-1 transition-transform hover:scale-[1.02] active:scale-95 shadow-lg">
            <motion.div
                className="absolute -translate-x-1/2 -translate-y-1/2 transform-gpu rounded-full transition-transform duration-500 group-hover:scale-[3] bg-gradient-to-br from-fuchsia-500 via-pink-500 to-orange-400"
                style={{
                    maskImage: "radial-gradient(200px circle at center, white, transparent)",
                    width: "400px",
                    height: "400px",
                    left: mouse.elementLeft,
                    top: mouse.elementTop,
                    opacity: mouse.opacity,
                }}
            />
            <div className="absolute inset-px rounded-[15px] bg-white dark:bg-gray-900" />
            <div className="relative p-6">
                <div className="mb-4 inline-flex rounded-lg bg-gradient-to-r from-fuchsia-500 to-pink-500 p-3 text-white shadow-md">
                    {icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
    )
}

export function MarketingHero() {
    return (
        <div className="w-full">
            {/* Hero Section with Scroll Effect */}
            <section className="relative w-full min-h-screen">
                <div className="absolute left-1/2 top-20 -translate-x-1/2 text-center z-10">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">
                        ↓ Scroll to explore
                    </span>
                </div>

                <div className="pointer-events-none sticky top-1/2 z-20 -translate-y-1/2 text-center mix-blend-difference">
                    <h2 className="text-6xl md:text-8xl font-bold tracking-tighter text-white">
                        Try Before
                        <br />
                        <span className="bg-gradient-to-r from-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                            You Buy
                        </span>
                    </h2>
                    <p className="mt-4 text-white/60 text-lg">Virtual Try-On with AI</p>
                </div>

                {/* Showcase Grid */}
                <div className="relative z-0 mb-[30vh] mt-[40vh] px-4 max-w-6xl mx-auto">
                    {gridLayout.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex w-full gap-4 mb-4">
                            {row.map((itemIndex, colIndex) => (
                                <div key={colIndex} className="aspect-square flex-1">
                                    {itemIndex !== null && showcaseItems[itemIndex] && (
                                        <ShowcaseImage item={showcaseItems[itemIndex]} />
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section with Cards */}
            <section className="py-20 px-4 bg-gradient-to-b from-muted/50 to-background">
                <div className="max-w-4xl mx-auto text-center mb-12">
                    <h3 className="text-3xl font-bold mb-4">Why DressCode?</h3>
                    <p className="text-muted-foreground">Experience the future of online shopping</p>
                </div>

                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FeatureCard
                        icon={<Sparkles className="h-6 w-6" />}
                        title="AI Virtual Try-On"
                        description="See how clothes look on you before buying with our cutting-edge AI technology."
                    />
                    <FeatureCard
                        icon={<MessageCircle className="h-6 w-6" />}
                        title="AI Style Assistant"
                        description="Chat with our AI to get personalized recommendations and find the perfect outfit for any occasion."
                    />
                    <FeatureCard
                        icon={
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        }
                        title="Instant Results"
                        description="Get your virtual try-on results in seconds, not minutes. Fast and reliable."
                    />
                    <FeatureCard
                        icon={
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        }
                        title="Shop with Confidence"
                        description="Reduce returns and find your perfect fit every time you shop."
                    />
                </div>
            </section>
        </div>
    )
}
