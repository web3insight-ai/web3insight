import { Card, CardBody, Button, Divider } from '@nextui-org/react';
import { CampModal, useAuthState, useConnect, useSocials, useLinkSocials } from '@campnetwork/origin/react';
import { useOriginAvailable } from '@/providers/OriginProvider';
import {
  Twitter,
  Music,
  CheckCircle,
  ExternalLink,
  GraduationCap,
  Settings,
} from 'lucide-react';

export interface OriginAuthWidgetProps {
  className?: string;
}

export function OriginAuthWidget({ className }: OriginAuthWidgetProps) {
  const { isAvailable } = useOriginAvailable();

  // Always call hooks but handle unavailability through context
  const authState = useAuthState();
  const connectHooks = useConnect();
  const socialsHooks = useSocials();
  const linkHooks = useLinkSocials();

  const { authenticated, loading } = authState;
  const { disconnect } = connectHooks;
  const { data: socialsData, isLoading: socialsLoading } = socialsHooks;
  const { linkTwitter, linkSpotify } = linkHooks;

  interface SocialsData {
    twitter?: boolean;
    spotify?: boolean;
  }

  const socialPlatforms = [
    {
      name: 'Twitter',
      key: 'twitter',
      icon: Twitter,
      color: 'primary' as const,
      isLinked: (socialsData as SocialsData)?.twitter || false,
      linkAction: () => linkTwitter(),
    },
    {
      name: 'Spotify',
      key: 'spotify',
      icon: Music,
      color: 'success' as const,
      isLinked: (socialsData as SocialsData)?.spotify || false,
      linkAction: () => linkSpotify(),
    },
  ];

  // Handle when Origin SDK is not available
  if (!isAvailable) {
    return (
      <Card className={className}>
        <CardBody className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gray-100 dark:bg-surface-elevated rounded-lg">
              <Settings size={20} className="text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Camp Network
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configuration required
              </p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-surface-elevated rounded-lg border border-gray-200 dark:border-border-dark">
            <p className="text-sm text-gray-800 dark:text-gray-300 mb-2">
              <strong>Camp SDK Not Configured</strong>
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-400">
              Set the <code className="bg-gray-100 dark:bg-surface-dark px-1 rounded">VITE_ORIGIN_CLIENT_ID</code> environment variable to enable Camp Network features.
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardBody className="flex items-center justify-center py-12">
          <div className="relative">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-gray-200 dark:border-gray-600">
              <div className="absolute top-0 left-0 h-10 w-10 rounded-full border-3 border-transparent border-t-gray-500 dark:border-t-gray-400 animate-spin" />
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardBody className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gray-100 dark:bg-surface-elevated rounded-lg">
            <GraduationCap size={20} className="text-gray-600 dark:text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Camp Network
          </h2>
        </div>

        {!authenticated ? (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Connect to Camp Network to link your social accounts and access camp features.
              </p>

              <CampModal />
            </div>

            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-surface-dark dark:to-surface-elevated rounded-xl border border-gray-200/50 dark:border-border-dark">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 p-1.5 bg-gray-100 dark:bg-surface-elevated rounded-lg">
                  <ExternalLink size={16} className="text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Own Your Digital IP
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                    Connect to Camp Network&apos;s AI-native blockchain to tokenize and monetize your IP with provenance tracking
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Connected to Camp
                </span>
              </div>
              <Button
                variant="light"
                size="sm"
                onClick={disconnect}
                className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-elevated h-auto min-h-0 px-3 py-1.5 text-xs font-medium"
              >
                Disconnect
              </Button>
            </div>

            <Divider />

            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Connected Social Accounts
              </h3>

              {socialsLoading ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center justify-between p-4 bg-gray-50 dark:bg-surface-dark rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded" />
                        <div className="w-20 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
                      </div>
                      <div className="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {socialPlatforms.map((platform) => {
                    const IconComponent = platform.icon;
                    return (
                      <div
                        key={platform.key}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-surface-dark rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent
                            size={20}
                            className="text-gray-700 dark:text-gray-300"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {platform.name}
                            </p>
                          </div>
                        </div>

                        {platform.isLinked ? (
                          <div className="px-3 py-1.5 bg-gray-100 dark:bg-surface-elevated text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full border border-gray-200 dark:border-border-dark">
                            Connected
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="light"
                            onClick={platform.linkAction}
                            className="h-auto min-h-0 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-elevated"
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
