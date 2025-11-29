"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { usePrivy } from "@privy-io/react-auth"
import Image from "next/image"

export default function ConnectPage() {
  const router = useRouter()
  const [isDev, setIsDev] = useState(true)
  const { login, ready, authenticated } = usePrivy()

  // Initialize and save user type to localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Set default to "dev"
      localStorage.setItem('userType', 'dev')
    }
  }, [])

  // Redirect to create page if already logged in
  useEffect(() => {
    if (ready && authenticated) {
      router.push('/monad/create')
    }
  }, [ready, authenticated, router])

  // Update localStorage whenever isDev changes
  const handleTypeChange = (isDevOption: boolean) => {
    setIsDev(isDevOption)
    const type = isDevOption ? "dev" : "not-dev"
    if (typeof window !== 'undefined') {
      localStorage.setItem('userType', type)
    }
  }

  const handleConnect = async () => {
    if (ready) {
      // Set flag to redirect to create page after login
      if (typeof window !== 'undefined') {
        localStorage.setItem('redirectToCreate', 'true')
      }
      // Trigger Privy login (userType already saved in localStorage)
      login()
    }
  }

  return (
    <div className="min-h-dvh bg-black text-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image src="/images/bg-synthwave.jpeg" alt="Synthwave background" fill className="object-cover" priority />
      </div>

      {/* Top gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/80 to-transparent z-10" />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center min-h-dvh px-4 py-6 md:py-8">
        {/* Header logos */}
        <header className="flex items-center justify-center gap-1.5 md:gap-2 mb-4 md:mb-2 mt-2 md:mt-4">
          <Image src="/images/monad.svg" alt="MONAD" width={80} height={20} className="h-4 md:h-5 w-auto" />
          <Image src="/images/seperator.svg" alt="" width={10} height={10} className="h-2.5 w-auto opacity-50" />
          <Image
            src="/images/openbuild-logo.svg"
            alt="OpenBuild"
            width={80}
            height={20}
            className="h-4 md:h-5 w-auto"
          />
          <Image src="/images/seperator.svg" alt="" width={10} height={10} className="h-2.5 w-auto opacity-50" />
          <Image
            src="/images/web3insight_logo.svg"
            alt="web3insight"
            width={80}
            height={20}
            className="h-4 md:h-5 w-auto"
          />
        </header>

        {/* Main content - title, toggle, card, button, footer - all together */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-0">
          {/* Title section */}
          <div className="text-center mb-4 md:mb-4">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1]">
              <span className="block md:inline">Monad</span>
              <span className="block md:inline md:ml-4">Dev Card</span>
            </h1>
            <p className="mt-3 md:mt-3 text-white text-lg md:text-xl font-medium">
              {"Not just a profile—it's your proof of build"}
            </p>
          </div>

          {/* Toggle buttons */}
          <div className="p-1 bg-zinc-700/20 rounded-lg shadow-[0px_0px_32px_0px_rgba(159,142,255,0.30)] outline outline-1 outline-offset-[-1px] outline-white/20 inline-flex justify-center items-center gap-1 mb-10 md:mb-8">
            <button
              onClick={() => handleTypeChange(true)}
              className={`h-7 px-3 py-px rounded-md inline-flex justify-center items-center gap-1 transition-all whitespace-nowrap ${
                isDev
                  ? "bg-violet-500/20 shadow-[0px_2px_5px_0px_rgba(131,110,249,0.40)] outline outline-1 outline-offset-[-1px] outline-violet-500"
                  : "opacity-80"
              }`}
            >
              <Image
                src="/images/star.svg"
                alt=""
                width={14}
                height={14}
                className={`w-3.5 h-3.5 ${isDev ? "[&_path]:fill-violet-500" : "[&_path]:fill-white"}`}
              />
              <span className="text-center text-white text-xs font-semibold leading-4 whitespace-nowrap">
                {"I'm a dev"}
              </span>
            </button>
            <button
              onClick={() => handleTypeChange(false)}
              className={`h-7 px-3 py-px rounded-md inline-flex justify-center items-center gap-1 transition-all whitespace-nowrap ${
                !isDev
                  ? "bg-violet-500/20 shadow-[0px_2px_5px_0px_rgba(131,110,249,0.40)] outline outline-1 outline-offset-[-1px] outline-violet-500"
                  : "opacity-80"
              }`}
            >
              <Image
                src="/images/star.svg"
                alt=""
                width={14}
                height={14}
                className={`w-3.5 h-3.5 ${!isDev ? "[&_path]:fill-violet-500" : "[&_path]:fill-white"}`}
              />
              <span className="text-center text-white text-xs font-semibold leading-4 whitespace-nowrap">
                {"I'm not a dev"}
              </span>
            </button>
          </div>

          {/* Card, button, and footer text grouped together */}
          <div className="flex flex-col items-center gap-4 md:gap-5">
            <div
              className="w-[190px] h-[300px] md:w-[174px] md:h-[276px] lg:w-[200px] lg:h-[316px] rounded-[22px] shadow-[0px_18px_24px_12px_rgba(131,110,249,0.80)] overflow-hidden bg-black"
              style={{
                border: "2.76px solid transparent",
                backgroundImage: "linear-gradient(black, black), linear-gradient(to bottom, #FFFFFF, #927EFF)",
                backgroundOrigin: "border-box",
                backgroundClip: "padding-box, border-box",
              }}
            >
              <Image
                src="/images/monad-mascot.png"
                alt="Monad mascot"
                width={232}
                height={368}
                className="w-full h-full object-cover"
              />
            </div>

            <button
              onClick={handleConnect}
              className="w-[190px] md:w-[174px] lg:w-[200px] h-9 px-6 py-1.5 bg-gradient-to-r from-violet-500 to-slate-400 rounded-[50px] shadow-[0px_0px_10px_0px_rgba(159,142,255,0.50)] outline outline-2 outline-offset-[-2px] outline-indigo-300 inline-flex justify-center items-center gap-2 hover:shadow-[0px_0px_20px_0px_rgba(159,142,255,0.70)] hover:-translate-y-0.5 transition-all"
            >
              <span className="text-center text-white text-sm font-semibold whitespace-nowrap">
                {!ready ? "Loading..." : "Connect"}
              </span>
            </button>

            <p className="text-center text-white text-xs font-medium leading-5 mt-1">
              {"We'll analyze your repos, lines of code, and vibes."}
              <br />
              {"Nothing sensitive. Only public data."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
