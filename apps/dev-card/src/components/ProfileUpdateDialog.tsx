"use client"

import { useState, useRef } from "react"
import { updateUserProfile } from "@/services/auth"
import { UpdateUserProfileRequest } from "@/types/api"

interface ProfileUpdateDialogProps {
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
  currentName?: string
  currentAvatar?: string
  currentBio?: string
}

export function ProfileUpdateDialog({
  isOpen,
  onClose,
  onUpdate,
  currentName,
  currentAvatar,
  currentBio,
}: ProfileUpdateDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    user_nick_name: currentName || "",
    user_avatar: currentAvatar || "",
    user_bio: currentBio || "",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, user_avatar: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError(null)

      const updateData: UpdateUserProfileRequest = {}

      if (formData.user_nick_name !== currentName) {
        updateData.user_nick_name = formData.user_nick_name
      }
      if (formData.user_avatar !== currentAvatar) {
        updateData.user_avatar = formData.user_avatar
      }
      if (formData.user_bio !== currentBio) {
        updateData.user_bio = formData.user_bio
      }

      const result = await updateUserProfile(updateData)

      if (result.success) {
        onUpdate()
        onClose()
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Update Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Avatar</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={handleAvatarClick}
              className="w-20 h-20 bg-black/60 rounded-xl border-2 hover:border-[#9F8EFF] transition-colors overflow-hidden"
              style={{ borderColor: '#9F8EFF50' }}
            >
              <img
                src={formData.user_avatar || "/images/monad-icon.svg"}
                alt="Avatar preview"
                className="w-full h-full object-cover"
              />
            </button>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
            <input
              type="text"
              value={formData.user_nick_name}
              onChange={(e) => setFormData(prev => ({ ...prev, user_nick_name: e.target.value }))}
              className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#9F8EFF]"
              placeholder="Your name"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
            <textarea
              value={formData.user_bio}
              onChange={(e) => setFormData(prev => ({ ...prev, user_bio: e.target.value }))}
              rows={3}
              className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#9F8EFF] resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-500 to-slate-400 text-white rounded-lg hover:from-violet-600 hover:to-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
