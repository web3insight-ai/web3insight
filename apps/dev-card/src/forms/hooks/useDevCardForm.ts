"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/hooks/useAuth"
import { orpc } from "@/orpc/client"
import {
  devCardFormSchema,
  devCardFormSchemaWithTwitter,
  type DevCardFormValues,
} from "@/schemas/form.schema"
import type { Ecosystem } from "@/schemas/auth.schema"

interface UseDevCardFormOptions {
  ecosystem: Ecosystem
}

// Helper function to get building options from ecosystems
function getBuildingOnOptions(ecosystems: string[], ecosystem: Ecosystem): string[] {
  const baseOption = ecosystem === "mantle" ? "Mantle" : "Monad"
  const filtered = ecosystems.filter((e) => e !== baseOption).slice(0, 10)
  return [baseOption, ...filtered]
}

export function useDevCardForm({ ecosystem }: UseDevCardFormOptions) {
  const router = useRouter()
  const queryClient = useQueryClient()

  // Get user type from localStorage
  const [userType, setUserType] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("userType") || "dev"
    }
    return "dev"
  })

  const isDev = userType === "dev"
  const baseEcosystem = ecosystem === "mantle" ? "Mantle" : "Monad"

  // Select schema based on user type
  const schema = isDev ? devCardFormSchema : devCardFormSchemaWithTwitter

  // Get auth state
  const {
    user,
    loading: authLoading,
    authenticated,
    getDisplayAvatar,
    getDisplayName,
    getGithubUsername,
    getGithubUserId,
    privyUser,
  } = useAuth({ ecosystem })

  // React Hook Form setup
  const form = useForm<DevCardFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      avatar: "",
      name: "",
      github: "",
      twitter: "",
      title: "",
      bio: "",
      buildingOn: [baseEcosystem],
    },
    mode: "onBlur",
  })

  const githubUsername = form.watch("github")

  // Fetch user ecosystems from GitHub
  const {
    data: ecosystemsResult,
    isLoading: loadingEcosystems,
  } = useQuery({
    ...orpc.github.getUserByUsername.queryOptions({
      input: { username: githubUsername },
    }),
    enabled: !!githubUsername && authenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const [ecosystemsLoaded, setEcosystemsLoaded] = useState(false)

  // Building options from GitHub ecosystems
  const buildingOnOptions = ecosystemsResult?.success && ecosystemsResult.data?.ecosystems
    ? getBuildingOnOptions(ecosystemsResult.data.ecosystems, ecosystem)
    : []

  // Mark ecosystems as loaded when we have data or after timeout
  useEffect(() => {
    if (ecosystemsResult?.success || !loadingEcosystems) {
      setEcosystemsLoaded(true)
    }
  }, [ecosystemsResult, loadingEcosystems])

  // Update profile mutation
  const updateProfileMutation = useMutation({
    ...orpc.auth.updateProfile.mutationOptions(),
    onSuccess: (result) => {
      if (result.success && result.data?.id) {
        queryClient.invalidateQueries({ queryKey: orpc.auth.key() })
        router.push(`/${ecosystem}/${result.data.id}`)
      }
    },
  })

  // Fetch Twitter user data mutation
  const twitterMutation = useMutation({
    ...orpc.twitter.getUserByUsername.mutationOptions(),
  })

  // Populate form with user data when authenticated
  useEffect(() => {
    if (authenticated && user) {
      // Avatar priority: Twitter > API > GitHub
      let finalAvatar = ""

      const apiAvatar = user.user_avatar
      const isTwitterAvatar =
        apiAvatar && (apiAvatar.includes("pbs.twimg.com") || apiAvatar.includes("twimg.com"))
      const isValidApiAvatar = apiAvatar && apiAvatar !== `/images/${ecosystem}-icon.svg` && apiAvatar !== "/images/monad-icon.svg"

      if (isTwitterAvatar) {
        finalAvatar = apiAvatar
      } else if (isValidApiAvatar) {
        finalAvatar = apiAvatar
      } else {
        finalAvatar = getDisplayAvatar()
      }

      const name = user.nick_name || getDisplayName()
      const github = user.github_login || getGithubUsername()
      const bio = user.user_bio || ""
      const title = user.user_title || ""
      const twitter = user.user_custom_x || ""

      let defaultBio = bio
      if (!bio) {
        defaultBio = "Building amazing things with code!"
      }

      // Get existing building on selection
      let existingBuildingOn: string[] = [baseEcosystem]
      if (user.user_custom_labels && Array.isArray(user.user_custom_labels) && user.user_custom_labels.length > 0) {
        const userLabels = user.user_custom_labels.filter((label) => label !== baseEcosystem)
        existingBuildingOn = [baseEcosystem, ...userLabels]
      }

      // Reset form with populated values
      form.reset({
        avatar: finalAvatar,
        name,
        github,
        twitter,
        title,
        bio: defaultBio,
        buildingOn: existingBuildingOn,
      })
    }
  }, [user, authenticated, baseEcosystem, privyUser])

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !authenticated) {
      router.push(`/${ecosystem}`)
    }
  }, [authLoading, authenticated, router, ecosystem])

  // Handle avatar file upload
  const handleAvatarChange = (file: File) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      form.setValue("avatar", reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Connect Twitter - fetch user data and update form
  const connectTwitter = async () => {
    const twitterHandle = form.getValues("twitter").replace("@", "").trim()

    if (!twitterHandle) {
      form.setError("twitter", { message: "Please enter a Twitter username first" })
      return false
    }

    try {
      const result = await twitterMutation.mutateAsync({ username: twitterHandle })

      if (result.success && result.data) {
        // Update bio if available and under limit
        if (result.data.bio) {
          const bio = result.data.bio.slice(0, 50)
          form.setValue("bio", bio)
        }

        // Update avatar - Twitter avatar takes priority
        if (result.data.avatar) {
          form.setValue("avatar", result.data.avatar)
        }

        return true
      } else {
        form.setError("twitter", { message: result.message || "Failed to fetch Twitter data" })
        return false
      }
    } catch {
      form.setError("twitter", { message: "Failed to connect to Twitter" })
      return false
    }
  }

  // Toggle building on selection
  const toggleBuildingOn = (item: string) => {
    const current = form.getValues("buildingOn")
    const isSelected = current.includes(item)

    // Base ecosystem cannot be deselected
    if (isSelected && item === baseEcosystem) {
      return
    }

    if (isSelected) {
      form.setValue(
        "buildingOn",
        current.filter((i) => i !== item)
      )
    } else if (current.length < 6) {
      form.setValue("buildingOn", [...current, item])
    }
  }

  // Submit handler
  const onSubmit = async (data: DevCardFormValues) => {
    if (!user?.id) {
      form.setError("root", { message: "User not logged in, please login first" })
      return
    }

    const profileData = {
      user_nick_name: data.name,
      user_bio: data.bio,
      user_title: data.title,
      user_custom_x: data.twitter,
      user_custom_labels: data.buildingOn,
      github_login: data.github,
      user_avatar: data.avatar && data.avatar !== `/images/${ecosystem}-icon.svg` && data.avatar !== "/images/monad-icon.svg"
        ? data.avatar
        : undefined,
    }

    try {
      await updateProfileMutation.mutateAsync({
        ecosystem,
        data: profileData,
      })
    } catch (err) {
      form.setError("root", {
        message: err instanceof Error ? err.message : "Failed to create card",
      })
    }
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isLoading: authLoading || (authenticated && !ecosystemsLoaded),
    isSubmitting: updateProfileMutation.isPending,
    isConnectingTwitter: twitterMutation.isPending,
    buildingOnOptions,
    isDev,
    ecosystem,
    baseEcosystem,
    authenticated,
    handleAvatarChange,
    connectTwitter,
    toggleBuildingOn,
  }
}
