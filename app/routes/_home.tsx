import { json, LoaderFunctionArgs } from "@remix-run/node";
import { prisma } from "~/prisma.server";
import { Outlet, useLoaderData } from "@remix-run/react";
import { getUser } from "~/services/auth/session.server";
import { MainLayout } from "~/components/MainLayout";

export const loader = async (ctx: LoaderFunctionArgs) => {
	const userData = await getUser(ctx.request);

	// For now, just return empty history for Strapi users
	// This will need to be updated after a proper schema migration
	const history: {
		query: string;
		id: string;
	}[] = [];

	const pinned = await prisma.query.findMany({
		where: {
			pin: true,
		},
		select: {
			id: true,
			query: true,
		},
	});

	return json({
		user: userData, // The actual user data from Strapi
		pinned,
		history,
	});
};

export default function HomeLayout() {
	const { history, user } = useLoaderData<typeof loader>();

	return (
		<MainLayout history={history} user={user}>
			<Outlet context={{ user }} />
		</MainLayout>
	);
}
