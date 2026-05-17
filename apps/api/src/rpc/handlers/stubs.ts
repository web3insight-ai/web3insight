import { ORPCError } from '@orpc/server';
import { os } from '../orpc';

/**
 * Stub routers for the 7 sub-contracts not yet migrated from REST controllers.
 * Each procedure throws NOT_IMPLEMENTED so the contract surface compiles
 * end-to-end and the client can discover available routes via OpenAPI.
 *
 * To migrate a router: replace the stub here with handlers/<router>.ts
 * following the pattern in handlers/total.ts.
 */

function notImplemented<T>(): T {
  throw new ORPCError('NOT_IMPLEMENTED', {
    message: 'This RPC procedure is not yet migrated. Use the legacy REST endpoint.',
  });
}

export const rankStubRouter = os.rank.router({
  ecosystemsTop: os.rank.ecosystemsTop.handler(() => notImplemented()),
  reposTop: os.rank.reposTop.handler(() => notImplemented()),
  reposTop7d: os.rank.reposTop7d.handler(() => notImplemented()),
  reposTopByDev7d: os.rank.reposTopByDev7d.handler(() => notImplemented()),
  actorsTop: os.rank.actorsTop.handler(() => notImplemented()),
  yearsRankReport: os.rank.yearsRankReport.handler(() => notImplemented()),
});

export const repoStubRouter = os.repo.router({
  activeDeveloper: os.repo.activeDeveloper.handler(() => notImplemented()),
});

export const authStubRouter = os.auth.router({
  oauthLogin: os.auth.oauthLogin.handler(() => notImplemented()),
  me: os.auth.me.handler(() => notImplemented()),
  getUserExtra: os.auth.getUserExtra.handler(() => notImplemented()),
  updateUserExtra: os.auth.updateUserExtra.handler(() => notImplemented()),
  publicById: os.auth.publicById.handler(() => notImplemented()),
  updateUserByTag: os.auth.updateUserByTag.handler(() => notImplemented()),
  getUserByTagAndId: os.auth.getUserByTagAndId.handler(() => notImplemented()),
  updateMe: os.auth.updateMe.handler(() => notImplemented()),
  getMagic: os.auth.getMagic.handler(() => notImplemented()),
  bindWallet: os.auth.bindWallet.handler(() => notImplemented()),
  privyTokenAuth: os.auth.privyTokenAuth.handler(() => notImplemented()),
  bindOpenBuild: os.auth.bindOpenBuild.handler(() => notImplemented()),
  getOpenBuildRecord: os.auth.getOpenBuildRecord.handler(() => notImplemented()),
});

export const adminStubRouter = os.admin.router({
  listEcosystems: os.admin.listEcosystems.handler(() => notImplemented()),
  listEcosystemRepos: os.admin.listEcosystemRepos.handler(() => notImplemented()),
  markEcosystemRepo: os.admin.markEcosystemRepo.handler(() => notImplemented()),
  testVersion: os.admin.testVersion.handler(() => notImplemented()),
});

export const customStubRouter = os.custom.router({
  createAnalysis: os.custom.createAnalysis.handler(() => notImplemented()),
  updateAnalysis: os.custom.updateAnalysis.handler(() => notImplemented()),
  deleteAnalysis: os.custom.deleteAnalysis.handler(() => notImplemented()),
  shareAnalysis: os.custom.shareAnalysis.handler(() => notImplemented()),
  listMyAnalyses: os.custom.listMyAnalyses.handler(() => notImplemented()),
  listPublicAnalyses: os.custom.listPublicAnalyses.handler(() => notImplemented()),
  getAnalysis: os.custom.getAnalysis.handler(() => notImplemented()),
  externalUser: os.custom.externalUser.handler(() => notImplemented()),
  externalGithubById: os.custom.externalGithubById.handler(() => notImplemented()),
  externalGithubByUsername: os.custom.externalGithubByUsername.handler(() => notImplemented()),
  eventUsers: os.custom.eventUsers.handler(() => notImplemented()),
});

export const donateStubRouter = os.donate.router({
  createDonation: os.donate.createDonation.handler(() => notImplemented()),
  listDonations: os.donate.listDonations.handler(() => notImplemented()),
  getDonationById: os.donate.getDonationById.handler(() => notImplemented()),
  getDonationByName: os.donate.getDonationByName.handler(() => notImplemented()),
  updateDonation: os.donate.updateDonation.handler(() => notImplemented()),
});

export const githubStubRouter = os.github.router({
  proxy: os.github.proxy.handler(() => notImplemented()),
});
