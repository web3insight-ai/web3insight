"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Wallet, Check, Loader2, Pencil } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { orpc } from "@/orpc/client"
import { evmWalletAddressSchema } from "@/schemas/auth.schema"
import type { Ecosystem } from "@/schemas/auth.schema"

const walletFormSchema = z.object({
  wallet_address: evmWalletAddressSchema,
})

type WalletFormData = z.infer<typeof walletFormSchema>

interface WalletAddressInputProps {
  ecosystem: Ecosystem
  isOwnCard: boolean
}

const ECOSYSTEM_COLORS: Record<Ecosystem, { accent: string; bg: string; border: string }> = {
  mantle: {
    accent: "#5EEAD4",
    bg: "rgba(94, 234, 212, 0.1)",
    border: "rgba(94, 234, 212, 0.25)",
  },
  monad: {
    accent: "#9F8EFF",
    bg: "rgba(159, 142, 255, 0.1)",
    border: "rgba(159, 142, 255, 0.25)",
  },
  openbuild: {
    accent: "#01DB83",
    bg: "rgba(1, 219, 131, 0.1)",
    border: "rgba(1, 219, 131, 0.25)",
  },
}

export function WalletAddressInput({ ecosystem, isOwnCard }: WalletAddressInputProps) {
  const [showSuccess, setShowSuccess] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const queryClient = useQueryClient()
  const colors = useMemo(() => ECOSYSTEM_COLORS[ecosystem], [ecosystem])

  const { data: extraResult } = useQuery({
    ...orpc.auth.getUserExtra.queryOptions({
      input: { tag: ecosystem },
    }),
    enabled: isOwnCard,
  })

  const savedAddress = extraResult?.success
    ? (extraResult.data?.wallet_address as string | undefined) ?? ""
    : ""

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<WalletFormData>({
    resolver: zodResolver(walletFormSchema),
    defaultValues: { wallet_address: "" },
    mode: "onBlur",
  })

  // Reason: Sync saved address into form once fetched from the API
  useEffect(() => {
    if (savedAddress) {
      setValue("wallet_address", savedAddress, { shouldDirty: false })
    }
  }, [savedAddress, setValue])

  const mutation = useMutation({
    ...orpc.auth.updateUserExtra.mutationOptions(),
    onSuccess: () => {
      setShowSuccess(true)
      setIsEditing(false)
      queryClient.invalidateQueries({
        queryKey: orpc.auth.getUserExtra.queryOptions({
          input: { tag: ecosystem },
        }).queryKey,
      })
      setTimeout(() => setShowSuccess(false), 2000)
    },
  })

  const onSubmit = useCallback(
    (data: WalletFormData) => {
      mutation.mutate({
        tag: ecosystem,
        user_extra: { wallet_address: data.wallet_address },
      })
    },
    [ecosystem, mutation]
  )

  const handleEdit = useCallback(() => {
    setIsEditing(true)
  }, [])

  const handleCancel = useCallback(() => {
    // Reason: Reset form to the saved value and exit editing mode
    reset({ wallet_address: savedAddress })
    setIsEditing(false)
  }, [reset, savedAddress])

  if (!isOwnCard) return null

  const isPending = mutation.isPending
  const hasError = !!errors.wallet_address || mutation.isError
  // Reason: Show read-only display when address is saved and not currently editing
  const showReadOnly = !!savedAddress && !isEditing

  return (
    <motion.div
      className="w-full max-w-md mx-auto px-4 mb-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {showReadOnly ? (
          <motion.div
            key="display"
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="flex items-center gap-2 flex-1 rounded-xl px-3 py-2.5 min-w-0"
              style={{
                backgroundColor: colors.bg,
                border: `1px solid ${colors.border}`,
              }}
            >
              <Wallet
                className="w-4 h-4 shrink-0"
                style={{ color: colors.accent }}
                aria-hidden="true"
              />
              <span
                className="text-xs truncate"
                style={{ color: colors.accent }}
                title={savedAddress}
              >
                {savedAddress}
              </span>
            </div>

            <button
              type="button"
              onClick={handleEdit}
              aria-label="Edit wallet address"
              className="shrink-0 rounded-xl px-4 font-medium text-sm transition-all flex items-center gap-1.5"
              style={{
                color: colors.accent,
                border: `1px solid ${colors.border}`,
                minHeight: "44px",
              }}
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2">
              <label htmlFor={`wallet-${ecosystem}`} className="sr-only">
                Wallet Address
              </label>

              <div
                className="flex items-center gap-2 flex-1 rounded-xl px-3 py-2.5 transition-colors"
                style={{
                  backgroundColor: colors.bg,
                  border: `1px solid ${hasError ? "#ef4444" : colors.border}`,
                }}
              >
                <Wallet
                  className="w-4 h-4 shrink-0"
                  style={{ color: colors.accent }}
                  aria-hidden="true"
                />
                <input
                  id={`wallet-${ecosystem}`}
                  type="text"
                  placeholder="0x..."
                  aria-label="EVM Wallet Address"
                  autoComplete="off"
                  spellCheck={false}
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 outline-none min-w-0"
                  {...register("wallet_address")}
                />
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Reason: Show cancel button only when editing an existing address */}
                {savedAddress && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    aria-label="Cancel editing"
                    className="rounded-xl px-3 font-medium text-sm text-gray-400 transition-all hover:text-white"
                    style={{ minHeight: "44px" }}
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="submit"
                  disabled={!isDirty || isPending}
                  aria-label="Save wallet address"
                  className="shrink-0 rounded-xl px-4 font-medium text-sm text-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: colors.accent,
                    minHeight: "44px",
                  }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {isPending ? (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </motion.span>
                    ) : showSuccess ? (
                      <motion.span
                        key="success"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Check className="w-4 h-4" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="save"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        Save
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </form>

            <AnimatePresence>
              {(errors.wallet_address || mutation.isError) && (
                <motion.p
                  className="text-xs text-red-400 mt-1.5 pl-9"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  role="alert"
                >
                  {errors.wallet_address?.message ?? "Failed to save wallet address"}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
