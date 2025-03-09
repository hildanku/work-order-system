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

	const woId = $page.params.woId;
	const client = getClient();

	const workOrderQuery = createQuery({
		queryKey: ['workOrder', woId],
		queryFn: async () => {
			const response = await $client.workOrder['assigned'][':woId'].$get(
				{
					param: { woId }
				},
				{
					fetch: appFetch,
					init: { headers: { Authorization: localStorage.getItem(ACCESS_TOKEN) || '' } }
				}
			);
			return response.json();
		},
		enabled: !!woId
	});

	const workOrderTimelineQuery = createQuery({
		queryKey: ['workOrderTimeline', woId],
		queryFn: async () => {
			const response = await $client.progress['timeline'][':woId'].$get(
				{
					param: { woId }
				},
				{
					fetch: appFetch,
					init: { headers: { Authorization: localStorage.getItem(ACCESS_TOKEN) || '' } }
				}
			);
			return response.json();
		},
		enabled: !!woId
	});
</script>

<div class="flex flex-row justify-between py-5">
	<Button onclick={() => history.back()} variant="outline" size="sm" class="w-fit">
		<ChevronLeft size={ICON_SIZE} />
		<span class="text-sm">Back</span>
	</Button>
</div>
{#if $workOrderQuery.isLoading}
	<p>Loading...</p>
{:else}
	<div transition:fade class="grid gap-4 lg:grid-cols-2">
		<div>
			<WorkOrderDetail workOrder={$workOrderQuery.data.results[0]} />
		</div>
		<div>
			<!--- {#each $workOrderTimelineQuery.data.results as progress (progress.work_order_progress.id)}
                    <WorkOrderTimeline progress={progress.work_order_progress} />
                {/each} -->

			{#if $workOrderTimelineQuery.data?.results?.length}
				{#each $workOrderTimelineQuery.data.results as progress (progress.work_order_progress.id)}
					<WorkOrderTimeline progress={progress.work_order_progress} />
				{/each}
			{:else}
				<p>No timeline data available</p>
			{/if}
		</div>
	</div>
{/if}
