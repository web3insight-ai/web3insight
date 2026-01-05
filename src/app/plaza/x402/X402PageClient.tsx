"use client";

import { useState } from "react";
import { Button } from "@nextui-org/react";
import { Plus } from "lucide-react";
import { DonateRepoList, RegisterRepoModal } from "~/x402/widgets";

export default function X402PageClient() {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const handleRegistrationSuccess = () => {
    // Modal handles close, list will refetch via TanStack Query
  };

  return (
    <div className="min-h-dvh bg-background dark:bg-background-dark">
      <div className="w-full max-w-content mx-auto px-6 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
                x402 Donate
              </h1>
              <p className="text-base text-gray-500 dark:text-gray-400 mt-1">
                Support open source projects with crypto donations
              </p>
            </div>

            <Button
              color="primary"
              size="sm"
              className="font-medium"
              onPress={() => setIsRegisterModalOpen(true)}
              startContent={<Plus size={16} />}
            >
              Register Repo
            </Button>
          </div>
        </header>

        {/* Main Content - Project List */}
        <main>
          <DonateRepoList />
        </main>
      </div>

      {/* Registration Modal */}
      <RegisterRepoModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={handleRegistrationSuccess}
      />
    </div>
  );
}
