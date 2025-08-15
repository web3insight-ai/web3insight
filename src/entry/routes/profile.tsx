import { Card, CardBody, Avatar, Button, Divider } from "@nextui-org/react";
import { LoaderFunctionArgs, MetaFunction, json, redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import {
  User as UserIcon,
  Calendar,
  Clock,
  Shield,
  Github,
  Mail,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Brain,
} from "lucide-react";
import { useAtom } from "jotai";
import { useEffect } from "react";

import { getTitle } from "@/utils/app";
import { getRoleName, getEffectiveRole } from "@/utils/role";
import { getGitHubHandle } from "~/profile-analysis/helper";

import { authModalOpenAtom } from "../atoms";
import DefaultLayout from "../layouts/default";
import Section from "../components/section";
import { WalletBindWidget } from "~/auth/widgets/wallet-bind";
import { OriginAuthWidget } from "~/origin/widgets/OriginAuthWidget";

import { fetchCurrentUser } from "~/auth/repository";

export const meta: MetaFunction = () => {
  const title = getTitle();

  return [
    { title: `My Profile | ${title}` },
    { name: "description", content: `Manage your ${title} profile` },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Get user data with proper error handling
  const userResult = await fetchCurrentUser(request);

  // Handle expired token (401)
  if (!userResult.success && userResult.code === "401") {
    return json({
      user: null,
      error: userResult.message,
      expired: true,
    });
  }

  // Handle no user (redirect to home)
  if (!userResult.data) {
    return redirect("/");
  }

  return json({
    user: userResult.data,
    error: null,
    expired: false,
  });
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ProfilePage() {
  const { user, error, expired } = useLoaderData<typeof loader>();
  const [, setAuthModalOpen] = useAtom(authModalOpenAtom);

  // Get effective role (highest priority role from allowed roles)
  const effectiveRole = user?.role ? getEffectiveRole(user.role.default_role, user.role.allowed_roles) : 'user';

  // Get GitHub handle for AI analysis
  const githubHandle = user ? getGitHubHandle(user) : null;

  // Handle expired token
  useEffect(() => {
    if (expired) {
      // Show auth modal after a short delay
      setTimeout(() => {
        setAuthModalOpen(true);
      }, 100);
    }
  }, [expired, setAuthModalOpen]);

  // If token expired, show error state
  if (expired || !user) {
    return (
      <DefaultLayout user={null}>
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
                      onClick={() => setAuthModalOpen(true)}
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
      </DefaultLayout>
    );
  }

  const githubBind = user.binds?.find(bind => bind.bind_type === 'github');
  const emailBind = user.binds?.find(bind => bind.bind_type === 'email');
  const walletBinds = user.binds?.filter(bind => bind.bind_type === 'wallet') || [];

  return (
    <DefaultLayout user={user}>
      <div className="min-h-dvh flex flex-col">
        <div className="w-full max-w-content mx-auto px-6 py-8">
          <Section
            title="Profile"
            summary="Manage your account information and settings"
          >
            <div className="max-w-4xl mx-auto space-y-8">

              {/* Profile Header Card */}
              <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark overflow-hidden">
                <CardBody className="p-8">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="flex-shrink-0">
                      <Avatar
                        src={user.avatar_url || user.profile?.user_avatar}
                        name={user.username?.substring(0, 1).toUpperCase() || 'U'}
                        size="lg"
                        className="w-24 h-24 text-large"
                        isBordered
                      />
                    </div>

                    <div className="flex-1 text-center md:text-left">
                      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {user.profile?.user_nick_name || user.username || 'User'}
                        </h1>
                        {githubBind && githubHandle && (
                          <Link
                            to={`/analyze/${githubHandle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              variant="light"
                              size="sm"
                              startContent={<Brain size={14} />}
                              className="font-medium hover:bg-gray-100 dark:hover:bg-surface-elevated px-3 py-1.5 h-auto min-h-0 rounded-full bg-gray-50 dark:bg-surface-dark border border-gray-200 dark:border-border-dark text-gray-700 dark:text-gray-300"
                            >
                              AI Analysis
                            </Button>
                          </Link>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center justify-center md:justify-start gap-2">
                          <Calendar size={16} />
                          <span>
                            Joined {formatDate(user.profile?.created_at || new Date().toISOString())}
                          </span>
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-2">
                          <Clock size={16} />
                          <span>
                            Last active {formatDate(user.profile?.updated_at || new Date().toISOString())}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* First Row: Account Information | Roles & Permissions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Account Information */}
                <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark">
                  <CardBody className="p-6">
                    <div className="flex items-center gap-3 mb-6">
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
                          {user.profile?.user_nick_name || user.username || 'Not set'}
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
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gray-100 dark:bg-surface-elevated rounded-lg">
                        <Shield size={20} className="text-gray-600 dark:text-gray-400" />
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Roles & Permissions
                      </h2>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-3">
                          Current Role
                        </p>
                        <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-500/30">
                          <div className="flex items-center justify-center w-5 h-5 bg-slate-200 dark:bg-slate-500/30 rounded-full">
                            <Shield size={12} className="text-slate-600 dark:text-slate-400" />
                          </div>
                          <span className="font-medium text-sm">
                            {getRoleName(effectiveRole)}
                          </span>
                        </div>
                      </div>

                      <Divider />

                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-3">
                          Available Roles
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {user.role?.allowed_roles?.map((role) => {
                            const isCurrentRole = role === effectiveRole;
                            return (
                              <div
                                key={role}
                                className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full border ${
                                  isCurrentRole
                                    ? 'bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-500/30'
                                    : 'bg-gray-50 dark:bg-surface-elevated text-gray-600 dark:text-gray-400 border-gray-200 dark:border-border-dark'
                                }`}
                              >
                                {getRoleName(role)}
                              </div>
                            );
                          }) || (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              No additional roles available
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Second Row: Connected Accounts | Camp Network */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Connected Accounts */}
                <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark">
                  <CardBody className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gray-100 dark:bg-surface-elevated rounded-lg">
                        <ExternalLink size={20} className="text-gray-600 dark:text-gray-400" />
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Connected Accounts
                      </h2>
                    </div>

                    <div className="space-y-4">
                      {githubBind && (
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-surface-elevated rounded-lg">
                          <div className="flex items-center gap-3">
                            <Github size={20} className="text-gray-700 dark:text-gray-300" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                GitHub
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                @{githubBind.bind_key}
                              </p>
                            </div>
                          </div>
                          <div className="px-3 py-1.5 bg-gray-100 dark:bg-surface-elevated text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full border border-gray-200 dark:border-border-dark">
                            Verified
                          </div>
                        </div>
                      )}

                      {emailBind && (
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-surface-elevated rounded-lg">
                          <div className="flex items-center gap-3">
                            <Mail size={20} className="text-gray-700 dark:text-gray-300" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Email
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {emailBind.bind_key}
                              </p>
                            </div>
                          </div>
                          <div className="px-3 py-1.5 bg-gray-100 dark:bg-surface-elevated text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full border border-gray-200 dark:border-border-dark">
                            Verified
                          </div>
                        </div>
                      )}

                      {/* Wallet Binding Widget - replaces individual wallet entries */}
                      <WalletBindWidget user={user} />

                      {(!githubBind && !emailBind && walletBinds.length === 0) && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
                          No connected accounts
                        </p>
                      )}
                    </div>
                  </CardBody>
                </Card>

                {/* Camp Network (Origin Network Integration) */}
                <OriginAuthWidget className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark" />
              </div>
            </div>
          </Section>
        </div>
      </div>
    </DefaultLayout>
  );
}

