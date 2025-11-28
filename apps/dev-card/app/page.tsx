"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push("/monad")
  }, [router])

  return <div className="h-screen bg-black flex items-center justify-center text-white">Loading...</div>
}
