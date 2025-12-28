"use client"

import { Suspense } from "react"
import { DevCardForm } from "@/forms/DevCardForm"

function CreateForm() {
  return <DevCardForm ecosystem="monad" />
}

export default function CreatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <CreateForm />
    </Suspense>
  )
}
