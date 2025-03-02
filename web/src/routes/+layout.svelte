<script lang="ts" module>
	const LOCAL_USER = Symbol('local_user');
	export const setLocalUser = (data: LayoutData['localUser']) => setContext(LOCAL_USER, data);
	export const getLocalUser = () => getContext<ReturnType<typeof setLocalUser>>(LOCAL_USER);
</script>

<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { Toaster } from '$lib/components/ui/sonner';
	import '../app.css';
	import { browser } from '$app/environment';
	import { setClient } from '@/client';
	import { getContext, setContext, type Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import { page } from '$app/state';
	import { ACCESS_TOKEN } from '@/const';
	//import { websocketSchema } from '@root/lib/zod/websocket';
	import { z } from 'zod';
	import { toast } from 'svelte-sonner';

	const PROD = import.meta.env?.PROD ?? false;

	let { children, data }: { data: LayoutData; children: Snippet } = $props();
	let { localUser } = data;
	let socket = $state<WebSocket>();

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser
			}
		}
	});

	setLocalUser(localUser);
	setClient();
</script>

<QueryClientProvider client={queryClient}>
	<Toaster richColors />
	<ModeWatcher />
	{@render children()}
</QueryClientProvider>
