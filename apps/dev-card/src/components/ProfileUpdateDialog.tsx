"use client"

import { useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { orpc } from "@/orpc/client"
import { profileUpdateFormSchema, type ProfileUpdateFormValues } from "@/schemas/form.schema"
import type { Ecosystem } from "@/schemas/auth.schema"

interface ProfileUpdateDialogProps {
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
  currentName?: string
  currentAvatar?: string
  currentBio?: string
  ecosystem: Ecosystem
}

export function ProfileUpdateDialog({
  isOpen,
  onClose,
  onUpdate,
  currentName,
  currentAvatar,
  currentBio,
  ecosystem,
}: ProfileUpdateDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProfileUpdateFormValues>({
    resolver: zodResolver(profileUpdateFormSchema),
    defaultValues: {
      user_nick_name: currentName || "",
      user_avatar: currentAvatar || "",
      user_bio: currentBio || "",
    },
  })

  // Reset form when dialog opens with new values
  useEffect(() => {
    if (isOpen) {
      reset({
        user_nick_name: currentName || "",
        user_avatar: currentAvatar || "",
        user_bio: currentBio || "",
      })
    }
  }, [isOpen, currentName, currentAvatar, currentBio, reset])

  const avatarValue = watch("user_avatar")

  // Update profile mutation
  const updateMutation = useMutation({
    ...orpc.auth.updateProfile.mutationOptions(),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: orpc.auth.key() })
        onUpdate()
        onClose()
      }
    },
  })

  if (!isOpen) return null

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setValue("user_avatar", reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: ProfileUpdateFormValues) => {
    // Only include changed fields
    const updateData: ProfileUpdateFormValues = {}

    if (data.user_nick_name !== currentName) {
      updateData.user_nick_name = data.user_nick_name
    }
    if (data.user_avatar !== currentAvatar) {
      updateData.user_avatar = data.user_avatar
    }
    if (data.user_bio !== currentBio) {
      updateData.user_bio = data.user_bio
    }

    await updateMutation.mutateAsync({
      ecosystem,
      data: updateData,
    })
  }

  const accentColor = ecosystem === "monad" ? "#9F8EFF" : ecosystem === "openbuild" ? "#01DB83" : "#5EEAD4"
  const defaultIcon = ecosystem === "monad" ? "/images/monad-icon.svg" : ecosystem === "openbuild" ? "/images/openbuild-icon.svg" : "/images/mantle-icon.png"

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Update Profile</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              className="w-20 h-20 bg-black/60 rounded-xl border-2 hover:border-opacity-100 transition-colors overflow-hidden"
              style={{ borderColor: `${accentColor}50` }}
            >
              <img
                src={avatarValue || defaultIcon}
                alt="Avatar preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = defaultIcon
                }}
              />
            </button>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
            <input
              type="text"
              {...register("user_nick_name")}
              className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none"
              style={{ ["--focus-border" as string]: accentColor }}
              placeholder="Your name"
            />
            {errors.user_nick_name && (
              <span className="text-red-400 text-xs">{errors.user_nick_name.message}</span>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
            <textarea
              {...register("user_bio")}
              rows={3}
              maxLength={100}
              className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none resize-none"
              placeholder="Share your bio (max 100 chars)"
            />
            {errors.user_bio && (
              <span className="text-red-400 text-xs">{errors.user_bio.message}</span>
            )}
          </div>

          {updateMutation.error && (
            <div className="text-red-400 text-sm">
              {updateMutation.error instanceof Error
                ? updateMutation.error.message
                : "Failed to update profile"}
            </div>
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
              disabled={updateMutation.isPending}
              className="flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background:
                  ecosystem === "monad"
                    ? "linear-gradient(to right, #8b5cf6, #64748b)"
                    : ecosystem === "openbuild"
                      ? "linear-gradient(to right, #01DB83, #01a363)"
                      : "linear-gradient(to right, #5EEAD4, #10B981)",
              }}
            >
              {updateMutation.isPending ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
