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
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Settings size={20} className="text-orange-600 dark:text-orange-400" />
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

          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <p className="text-sm text-orange-800 dark:text-orange-300 mb-2">
              <strong>Camp SDK Not Configured</strong>
            </p>
            <p className="text-sm text-orange-700 dark:text-orange-400">
              Set the <code className="bg-orange-100 dark:bg-orange-800 px-1 rounded">VITE_ORIGIN_CLIENT_ID</code> environment variable to enable Camp Network features.
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardBody className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading Camp authentication...</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardBody className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
            <GraduationCap size={20} className="text-orange-600 dark:text-orange-400" />
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

            <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/10 dark:to-orange-800/10 rounded-xl border border-orange-200/50 dark:border-orange-700/30">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 p-1.5 bg-orange-100 dark:bg-orange-800/30 rounded-lg">
                  <ExternalLink size={16} className="text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-1">
                    Own Your Digital IP
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-300 leading-relaxed">
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
                <CheckCircle size={16} className="text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium text-orange-700 dark:text-orange-400">
                  Connected to Camp
                </span>
              </div>
              <Button
                variant="light"
                size="sm"
                onClick={disconnect}
                className="text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 h-auto min-h-0 px-3 py-1.5 text-xs font-medium"
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
                    <div key={i} className="animate-pulse flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
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
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
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
                          <div className="px-3 py-1.5 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-medium rounded-full border border-orange-200 dark:border-orange-700">
                            Connected
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="light"
                            onClick={platform.linkAction}
                            className="h-auto min-h-0 px-3 py-1.5 text-xs font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
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
