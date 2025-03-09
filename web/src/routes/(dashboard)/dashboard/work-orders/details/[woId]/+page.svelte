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
	import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
	import { Badge } from '@/components/ui/badge';

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

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
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
				{#if $workOrderTimelineQuery.data?.results?.length}
					<Card>
						<CardHeader>
							<CardTitle>Work Order Progress</CardTitle>
						</CardHeader>
						<CardContent>
							<div transition:fade class="relative">
								<div class="absolute inset-0 flex justify-center">
									<div class="h-full w-0.5 bg-border"></div>
								</div>
								<div class="relative space-y-8">
									{#each $workOrderTimelineQuery.data.results as progress (progress.work_order_progress.id)}
										<WorkOrderTimeline progress={progress.work_order_progress} />
									{/each}
								</div>
							</div>
						</CardContent>
					</Card>
				{:else}
					<p>No timeline data available</p>
				{/if}
			</div>
		</div>
	{/if}
</div>
