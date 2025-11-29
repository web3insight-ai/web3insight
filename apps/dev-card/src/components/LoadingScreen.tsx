import Image from "next/image"

interface LoadingScreenProps {
  message?: string
}

export default function LoadingScreen({ message }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.3; filter: blur(20px); }
          50% { opacity: 0.6; filter: blur(30px); }
        }
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
        .glow-animation {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>

      <div className="text-white text-center relative">
        {/* Background glow effect */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-40 h-40 rounded-full glow-animation"
            style={{
              background: 'radial-gradient(circle, rgba(111, 84, 255, 0.4) 0%, transparent 70%)'
            }}
          />
        </div>

        {/* Monad Logo with float animation */}
        <div className="mb-3 relative inline-block float-animation">
          <Image
            src="/images/monad-icon.svg"
            alt="Monad"
            width={80}
            height={80}
            className="w-20 h-20 drop-shadow-[0_0_20px_rgba(111,84,255,0.6)]"
          />
        </div>

        {/* Loading status text */}
        {message && (
          <div className="text-sm text-gray-400 animate-pulse relative z-10">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}

