<script lang="ts">
	import { page } from '$app/stores';
	import { getClient } from '@/client';
	import { Button } from '@/components/ui/button';
	import WorkOrderTimeline from '@/components/ui/work-order/work-order-timeline.svelte';
	import WorkOrderDetail from '@/components/ui/work-order/work-order-detail.svelte';
	import { ACCESS_TOKEN, ICON_SIZE } from '@/const';
	import { appFetch } from '@/fetch';
	import { createQuery } from '@tanstack/svelte-query';
	import { ChevronLeft } from 'lucide-svelte';
	import { fade } from 'svelte/transition';
	import type { ComponentType } from 'svelte';

	const orderCode = $page.params.orderCode;
	const client = getClient();

	const workOrderQuery = createQuery({
		queryKey: ['workOrder', orderCode],
		queryFn: async () => {
			const response = await $client.workOrder['assigned'][':orderCode'].$get(
				{
					param: { orderCode }
				},
				{
					fetch: appFetch,
					init: { headers: { Authorization: localStorage.getItem(ACCESS_TOKEN) || '' } }
				}
			);
			return response.json();
		},
		enabled: !!orderCode
	});
</script>

<div class="flex flex-row justify-between py-5">
	<Button onclick={() => history.back()} variant="outline" size="sm" class="w-fit">
		<ChevronLeft size={ICON_SIZE} />
		<span class="text-sm">Back</span>
	</Button>
	{#if $workOrderQuery.isLoading}
	<p>Loading...</p>
	{:else}
	<div transition:fade class="grid gap-4 lg:grid-cols-2">
		<div>
			<WorkOrderDetail workOrder={$workOrderQuery.data.results[0]} />
		</div>
		<div>
			<!-- <WorkOrderTimeline {timelineItems} /> -->
		</div>
	</div>
	{/if}
</div>
