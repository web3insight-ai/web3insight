'use client';

import { Card, CardBody, Avatar, Button } from "@nextui-org/react";
import Link from "next/link";
import {
  User as UserIcon,
  Calendar,
  Shield,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Brain,
} from "lucide-react";
import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";

import { getRoleName } from "@/utils/role";
import { getPrivyUserDisplayInfo } from "~/auth/helper";

import Section from "$/section";
import { PrivyAccountsWidget } from "~/auth/widgets/privy-accounts";

interface ProfilePageProps {
  user: Record<string, unknown>;
  error: string | null;
  expired: boolean;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ProfilePageClient({ user, error, expired }: ProfilePageProps) {
  const { ready, authenticated, login, user: privyUser } = usePrivy();

  // Get user display info from Privy based on login method
  const userInfo = getPrivyUserDisplayInfo(privyUser);

  // Get GitHub handle from Privy linked accounts for DevInsight button
  const githubAccount = privyUser?.linkedAccounts?.find(acc => acc.type === 'github_oauth');
  const githubHandle = githubAccount?.username || null;

  // Handle expired token - trigger Privy login
  useEffect(() => {
    if (expired && ready && !authenticated) {
      // Show Privy login after a short delay
      setTimeout(() => {
        login();
      }, 100);
    }
  }, [expired, ready, authenticated, login]);

  // If token expired, show error state
  if (expired || !user) {
    return (
      <div className="min-h-dvh flex flex-col">
        <div className="w-full max-w-content mx-auto px-6 py-8">
          <Section
            title="Profile"
            summary="Manage your account information and settings"
          >
            <div className="max-w-2xl mx-auto">
              <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark">
                <CardBody className="text-center py-12">
                  <AlertTriangle
                    size={48}
                    className="text-warning mx-auto mb-4"
                  />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Session Expired
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {error || "Your session has expired. Please sign in again to access your profile."}
                  </p>
                  <Button
                    color="primary"
                    onClick={() => login()}
                    className="font-medium"
                  >
                    Sign In Again
                  </Button>
                </CardBody>
              </Card>
            </div>
          </Section>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-dvh flex flex-col">
      <div className="w-full max-w-content mx-auto px-6 py-6">
        <Section
          title="Profile"
          summary="Manage your account information and settings"
        >
          <div className="max-w-4xl mx-auto space-y-6">

            {/* Profile Header Card */}
            <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark overflow-hidden">
              <CardBody className="p-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  <div className="flex-shrink-0">
                    <Avatar
                      src={userInfo.avatarUrl || user.avatar_url || user.profile?.user_avatar}
                      name={userInfo.displayName.substring(0, 1).toUpperCase()}
                      size="lg"
                      className="w-24 h-24 text-large"
                      isBordered
                    />
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {userInfo.displayName}
                      </h1>
                      {githubHandle && (
                        <Link href="/devinsight">
                          <Button
                            variant="light"
                            size="sm"
                            startContent={<Brain size={14} />}
                            className="font-medium hover:bg-gray-100 dark:hover:bg-surface-elevated px-3 py-1.5 h-auto min-h-0 rounded-full bg-gray-50 dark:bg-surface-dark border border-gray-200 dark:border-border-dark text-gray-700 dark:text-gray-300"
                          >
                            DevInsight
                          </Button>
                        </Link>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center justify-center md:justify-start gap-2">
                        <Calendar size={16} />
                        <span>
                          Joined {formatDate(user.profile?.created_at || new Date().toISOString())}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* First Row: Account Information | Roles & Permissions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Account Information */}
              <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark">
                <CardBody className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gray-100 dark:bg-surface-elevated rounded-lg">
                      <UserIcon size={20} className="text-gray-600 dark:text-gray-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Account Information
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        User ID
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white font-mono bg-gray-50 dark:bg-surface-elevated px-3 py-2 rounded-lg">
                        {user.profile?.user_id || user.id}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        Username
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {userInfo.displayName}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        Primary Account
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {userInfo.primaryAccount}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        Account Status
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-5 h-5 bg-gray-100 dark:bg-surface-elevated rounded-full">
                          <CheckCircle size={12} className="text-gray-600 dark:text-gray-400" />
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Active</span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Roles & Permissions */}
              <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark">
                <CardBody className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gray-100 dark:bg-surface-elevated rounded-lg">
                      <Shield size={20} className="text-gray-600 dark:text-gray-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Roles & Permissions
                    </h2>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-3">
                      Available Roles
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {user.role?.allowed_roles?.map((role: string) => (
                        <div
                          key={role}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full border bg-gray-50 dark:bg-surface-elevated text-gray-600 dark:text-gray-400 border-gray-200 dark:border-border-dark"
                        >
                          {getRoleName(role)}
                        </div>
                      )) || (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          No roles available
                        </p>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Connected Accounts */}
            <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark">
              <CardBody className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gray-100 dark:bg-surface-elevated rounded-lg">
                    <ExternalLink size={20} className="text-gray-600 dark:text-gray-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Connected Accounts
                  </h2>
                </div>

                {/* Privy Accounts Widget */}
                <PrivyAccountsWidget />
              </CardBody>
            </Card>
          </div>
        </Section>
      </div>
    </div>
  );
}
