import {
	Button,
	Image,
	Input,
	Select,
	SelectItem,
	Link,
	Card,
	CardBody,
	CardHeader,
	Divider,
} from "@nextui-org/react";
import { json, type MetaFunction } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { Search, ExternalLink, Award, CheckCircle2 } from "lucide-react";
import { prisma } from "~/prisma.server";
import Logo from "../images/logo.png";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Footer } from "~/components/Footer";
import { mintBadge } from "~/services/chain.server";
import { isAddress } from "viem";

export const meta: MetaFunction = () => [
	{ title: "Claim Reward - Web3Insights" },
	{ property: "og:title", content: "Claim Reward - Web3Insights" },
	{
		name: "description",
		content: "Claim your reward for contributing to Web3 projects.",
	},
];

export const loader = async () => {
	const projects = await prisma.project.findMany({
		select: { id: true, name: true },
		where: {
			name: "Mantle Network"
		}
	});
	return json({ projects });
};

export const action = async ({ request }: { request: Request }) => {
	const formData = await request.formData();
	const projectId = formData.get("projectId") as string;
	const githubHandle = formData.get("githubHandle") as string;
	const intent = formData.get("intent") as string;

	if (!projectId || !githubHandle) {
		return json({ error: "Missing required fields" }, { status: 400 });
	}

	const project = await prisma.project.findUnique({ where: { id: projectId } });

	if (!project) {
		return json({ error: "Project not found" }, { status: 404 });
	}

	if (intent === "claim") {
		const walletAddress = formData.get("walletAddress") as string;
		if (!walletAddress || !isAddress(walletAddress)) {
			return json({ error: "Please provide a valid wallet address" }, { status: 400 });
		}

		try {
			const result = await mintBadge(walletAddress as `0x${string}`);
			if (!result.success) {
				return json({ error: result.error }, { status: 500 });
			}
			return json({
				project,
				githubHandle,
				transactionHash: result.transactionHash,
				success: true,
				isEligible: true
			});
		} catch (error) {
			return json({ error: "Failed to mint badge" }, { status: 500 });
		}
	}

	return json({ project, githubHandle, isEligible: true });
};

export default function ClaimReward() {
	const { projects } = useLoaderData<typeof loader>();
	const fetcher = useFetcher<typeof action>();
	const [selectedProject, setSelectedProject] = useState<string | null>(projects[0]?.id || null);

	return (
		<div className="min-h-dvh flex flex-col">
			<div className="flex-grow flex items-center justify-center px-4 py-8">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="w-full max-w-[640px] mx-auto"
				>
					<div className="space-y-2 text-center flex flex-col items-center">
						<motion.div
							initial={{ scale: 0.8 }}
							animate={{ scale: 1 }}
							transition={{ type: "spring", stiffness: 200 }}
							className="mb-8"
						>
							<Image src={Logo} width={128} alt="Web3Insights Logo" />
						</motion.div>
						<h1 className="text-2xl md:text-3xl font-bold">
							Claim Your Reward
						</h1>
					</div>

					{!fetcher.data?.isEligible && (
						<fetcher.Form method="POST" className="mt-8 space-y-4">
							<input type="hidden" name="intent" value="check" />
							<Select
								label="Select Project"
								placeholder="Choose a project"
								onChange={(e) => setSelectedProject(e.target.value)}
								name="projectId"
								isRequired
								defaultSelectedKeys={[projects[0]?.id]}
							>
								{projects.map((project) => (
									<SelectItem key={project.id} value={project.id}>
										{project.name}
									</SelectItem>
								))}
							</Select>

							<Input
								label="GitHub Handle"
								placeholder="Enter your GitHub handle"
								name="githubHandle"
								type="text"
								className="max-w-full"
								isRequired
							/>

							<Button
								isLoading={fetcher.state === "submitting"}
								startContent={
									fetcher.state === "submitting" ? null : (
										<Search size={16} strokeWidth={1.5} />
									)
								}
								size="lg"
								type="submit"
								color="primary"
								className="w-full"
							>
								{fetcher.state === "submitting"
									? "Checking..."
									: "Check Eligibility"}
							</Button>
						</fetcher.Form>
					)}

					<div className="flex-grow" />

					<AnimatePresence>
						{fetcher.data?.isEligible && !("error" in fetcher.data) && (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{ duration: 0.5 }}
								className="mt-auto pt-8"
							>
								<Card className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
									<CardHeader className="flex gap-3">
										<Award size={24} className="text-blue-500" />
										<div className="flex flex-col">
											<p className="text-md font-semibold">Reward Details</p>
											<p className="text-small text-gray-600">
												For {fetcher.data.project.name}
											</p>
										</div>
									</CardHeader>
									<Divider />
									<CardBody>
										<div className="space-y-4">
											<p className="flex items-center gap-2">
												<span className="font-semibold">GitHub Handle:</span>{" "}
												{fetcher.data.githubHandle}
												<Link
													href={`https://github.com/${fetcher.data.githubHandle}`}
													target="_blank"
													rel="noopener noreferrer"
													className="text-primary hover:opacity-70 transition-opacity"
												>
													<ExternalLink size={14} />
												</Link>
											</p>
											{fetcher.data.transactionHash && (
												<motion.div
													initial={{ opacity: 0, scale: 0.9 }}
													animate={{ opacity: 1, scale: 1 }}
													transition={{ duration: 0.5 }}
													className="bg-green-50 p-4 rounded-lg border border-green-200"
												>
													<div className="flex items-center gap-2 mb-2 text-green-600">
														<CheckCircle2 size={20} />
														<span className="font-semibold">Transaction Successful!</span>
													</div>
													<p className="text-sm text-gray-600 mb-2">
														Transaction Hash:
													</p>
													<code className="block bg-white p-2 rounded text-xs font-mono mb-3 break-all">
														{fetcher.data.transactionHash}
													</code>
													<Link
														href={`https://sepolia.mantlescan.xyz/tx/${fetcher.data.transactionHash}`}
														target="_blank"
														rel="noopener noreferrer"
														className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
													>
														View on Explorer <ExternalLink size={12} />
													</Link>
												</motion.div>
											)}
										</div>
										<div className="mt-4">
											{!fetcher.data.success && (
												<fetcher.Form method="POST" className="flex-1">
													<input type="hidden" name="intent" value="claim" />
													<input type="hidden" name="projectId" value={fetcher.data.project.id} />
													<input type="hidden" name="githubHandle" value={fetcher.data.githubHandle} />
													<div className="flex gap-2">
														<Input
															placeholder="Enter your Mantle wallet address"
															name="walletAddress"
															type="text"
															className="flex-1"
															isRequired
															classNames={{
																input: "font-mono",
															}}
														/>
														<Button
															type="submit"
															color="success"
															endContent={<Award size={16} />}
															isLoading={fetcher.state === "submitting"}
														>
															{fetcher.state === "submitting" ? "Claiming..." : "Claim"}
														</Button>
													</div>
												</fetcher.Form>
											)}
										</div>
									</CardBody>
								</Card>
							</motion.div>
						)}
					</AnimatePresence>

					{fetcher.data && "error" in fetcher.data && (
						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="mt-4 text-red-500"
						>
							{fetcher.data.error}
						</motion.p>
					)}
				</motion.div>
			</div>
			<Footer />
		</div>
	);
}
