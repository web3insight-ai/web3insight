'use client';

import { Button, Card, CardBody } from "@nextui-org/react";
import { Brain, AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { authModalOpenAtom } from "../atoms";

interface DevInsightPageProps {
  requiresAuth: boolean;
  error?: string;
  user?: any;
  githubHandle?: string;
}

export default function DevInsightPageClient({
  requiresAuth,
  error,
  user,
  githubHandle,
}: DevInsightPageProps) {
  const [, setAuthModalOpen] = useAtom(authModalOpenAtom);

  // Auto-trigger login modal for unauthenticated users
  useEffect(() => {
    if (requiresAuth) {
      setAuthModalOpen(true);
    }
  }, [requiresAuth, setAuthModalOpen]);

  if (error) {
    return (
      <div className="min-h-dvh bg-background dark:bg-background-dark flex items-center justify-center px-6">
        <Card className="w-full max-w-md bg-white dark:bg-surface-dark border border-border dark:border-border-dark">
          <CardBody className="p-8 text-center">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full inline-flex mb-4">
              <AlertCircle size={24} className="text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Error Loading DevInsight
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error}
            </p>
            <Button
              color="primary"
              onPress={() => window.location.reload()}
            >
              Try Again
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  // For unauthenticated users, show a simple message and let the modal handle login
  if (requiresAuth) {
    return (
      <div className="min-h-dvh bg-background dark:bg-background-dark pb-24">
        <div className="w-full max-w-content mx-auto px-6 pt-8">
          {/* Header and Overview */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Brain size={20} className="text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">DevInsight</h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
              AI-powered Web3 development insights and analysis
            </p>
          </div>

          {/* Simple message - modal will handle the login */}
          <div className="text-center py-12">
            <div className="space-y-4">
              <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto">
                <Brain size={32} className="text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Sign in to access DevInsight
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Connect your GitHub account to unlock AI-powered Web3 development insights
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // This would be the authenticated state - for now just show a placeholder with the GitHub handle
  return (
    <div className="min-h-dvh bg-background dark:bg-background-dark pb-24">
      <div className="w-full max-w-content mx-auto px-6 pt-8">
        {/* Header and Overview */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain size={20} className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
              @{githubHandle} DevInsight
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
            AI-powered Web3 development insights and analysis
          </p>
        </div>

        {/* Loading State - Analysis not yet implemented */}
        <div className="text-center py-12">
          <div className="space-y-4">
            <Loader2 size={32} className="animate-spin text-primary mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Starting DevInsight Analysis
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Fetching GitHub profile data for @{githubHandle}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
