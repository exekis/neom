"use client";

import { useUser } from "@clerk/nextjs";

export type ClerkSafe = {
	isLoaded: boolean;
	isLoading: boolean;
	isSignedIn: boolean;
	user: ReturnType<typeof useUser>["user"] | null;
	userId: string | null;
};

export function useClerkSafe(): ClerkSafe {
	const { isLoaded, isSignedIn, user } = useUser();

	return {
		isLoaded,
		isLoading: !isLoaded,
		isSignedIn: isLoaded ? isSignedIn : false,
		user: isLoaded ? user : null,
		userId: isLoaded && user ? user.id : null,
	};
}

export {};
export {}
