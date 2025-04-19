import {
	Image,
	Button,
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@nextui-org/react";
import { Link } from "@remix-run/react";
import { History } from "lucide-react";
import Logo from "../images/logo.png";
import { useMediaQuery } from "react-responsive";
import AuthStatus from "./auth/AuthStatus";

type UserData = {
	id: number;
	username: string;
	email: string;
	confirmed: boolean;
	blocked?: boolean;
	createdAt?: string;
	updatedAt?: string;
};

type NavToolbarProps = {
	history: {
		query: string;
		id: string;
	}[];
	user: UserData | null;
};

export function NavToolbar({ history, user }: NavToolbarProps) {
	const isDesktop = useMediaQuery({ minWidth: 1024 });
	const isMobile = useMediaQuery({ maxWidth: 767 });

	return (
			<div className="flex items-center justify-between w-full px-4 py-2 sm:px-6 lg:px-8 max-w-[1200px] mx-auto">
			{/* Logo on the left side */}
			<Link to="/" className="flex items-center gap-2">
							<Image
								src={Logo}
								width={isDesktop ? 32 : 24}
								alt="Web3Insights Logo"
							/>
							{!isMobile && (
								<span className="text-sm font-bold text-gray-800">
									Web3Insights
								</span>
							)}
						</Link>

			{/* Right-side controls */}
			<div className="flex items-center gap-4">
				{/* Recent searches popover */}
				<Popover placement="bottom-end">
					<PopoverTrigger>
						<Button
							variant="light"
							size="sm"
							startContent={<History size={16} />}
							className="text-gray-500"
						>
							Recent
						</Button>
					</PopoverTrigger>
					<PopoverContent>
						<div className="px-1 py-2">
							<div className="text-sm font-medium text-gray-900 mb-2">
								Recent Searches
							</div>
							{history.length === 0 ? (
								<p className="text-sm text-gray-500">No recent searches</p>
							) : (
								<div className="grid gap-1">
									{history.map((item) => (
										<Link
											key={item.id}
											to={`/query/${item.id}`}
											className="block p-2 text-sm text-gray-500 hover:bg-gray-100 rounded"
										>
											{item.query}
										</Link>
									))}
								</div>
							)}
						</div>
					</PopoverContent>
				</Popover>

				{/* Auth status component */}
				<AuthStatus user={user} />
			</div>
		</div>
	);
}
