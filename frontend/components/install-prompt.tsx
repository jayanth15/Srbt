"use client"

import { useState, useEffect } from "react"
import { Download, X, Share } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Check if already installed (standalone or fullscreen display mode)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
      return
    }

    // Detect iOS (no beforeinstallprompt support)
    const ua = window.navigator.userAgent.toLowerCase()
    const ios = /iphone|ipad|ipod/.test(ua)
    setIsIOS(ios)

    // Show iOS prompt after a few seconds if not dismissed before
    if (ios) {
      const dismissed = localStorage.getItem("srbt-install-dismissed")
      if (!dismissed) {
        const timer = setTimeout(() => setIsVisible(true), 3000)
        return () => clearTimeout(timer)
      }
      return
    }

    // Chrome/Android: listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      const dismissed = localStorage.getItem("srbt-install-dismissed")
      if (!dismissed) {
        setIsVisible(true)
      }
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Listen for successful install
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsVisible(false)
      setDeferredPrompt(null)
    }
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setIsInstalled(true)
    }
    setDeferredPrompt(null)
    setIsVisible(false)
  }

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem("srbt-install-dismissed", "true")
  }

  if (isInstalled) return null
  if (!isVisible) return null

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[60] px-4 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-3",
        "bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]",
        "transition-transform duration-300 ease-out",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="flex items-start gap-3 max-w-md mx-auto">
        {/* App icon */}
        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
          SR
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-sm font-semibold text-gray-900 leading-tight">
            Install SRBT Portal
          </p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            {isIOS ? (
              <>
                Tap{" "}
                <Share className="w-3 h-3 inline-block -mt-0.5 mx-0.5 text-blue-600" />
                {" "}then{" "}
                <strong className="text-gray-700">Add to Home Screen</strong>
              </>
            ) : (
              <>Add this app to your home screen for quick access.</>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 shrink-0">
          <button
            onClick={handleDismiss}
            className="self-end p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>

          {!isIOS && (
            <Button
              size="sm"
              onClick={handleInstall}
              className="h-8 px-3 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Install
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
