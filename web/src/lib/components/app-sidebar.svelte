<script lang="ts" module>
	import Frame from 'lucide-svelte/icons/frame';
	import GalleryVerticalEnd from 'lucide-svelte/icons/gallery-vertical-end';
	const data = {
		teams: [
			{
				name: 'Acme Inc',
				logo: GalleryVerticalEnd,
				plan: 'Enterprise'
			}
		],

		navMain: [
			{
				title: 'Management',
				url: '#',
				icon: DatabaseIcon,
				isActive: true,
				items: [
					{
						title: 'Users',
						url: '/management/users'
					},
					{
						title: 'Products',
						url: '/management/products'
					},
					{
						title: 'Work Order',
						url: '/management/work-orders'
					},
					{
						title: 'Report',
						url: '#'
					}
				]
			}
		],
		projects: [
			{
				name: 'Dashboard',
				url: '/management',
				icon: Frame
			}
		],
		operatorNav: [
			{
				name: 'Work Order',
				url: '/work-order',
				icon: Frame
			}
		]
	};
</script>

<script lang="ts">
	import NavMain from '$lib/components/nav-main.svelte';
	import NavProjects from '$lib/components/nav-projects.svelte';
	import NavUser from '$lib/components/nav-user.svelte';
	import TeamSwitcher from '$lib/components/team-switcher.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';
	import { DatabaseIcon } from 'lucide-svelte';
	import NavOperator from './nav-operator.svelte';

	import { getLocalUser } from '../../routes/+layout.svelte';
	import type { Writable } from 'svelte/store';
	import type { User } from '@root/config/db/schema';

	const localUser = getLocalUser() as Writable<User>;
	let {
		ref = $bindable(null),
		collapsible = 'icon',
		...restProps
	}: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root bind:ref {collapsible} {...restProps}>
	<Sidebar.Header>
		<TeamSwitcher teams={data.teams} />
	</Sidebar.Header>
	<Sidebar.Content>
		{#if $localUser.role === 'production_manager'}
			<NavProjects projects={data.projects} />
			<NavMain items={data.navMain} />
		{:else}
			<NavOperator projects={data.operatorNav} />
		{/if}
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser user={$localUser} />
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>
