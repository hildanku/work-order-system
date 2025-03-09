<script lang="ts">
	import { page } from '$app/stores';
	import { getClient } from '@/client';
	import { Button } from '@/components/ui/button';
	import WorkOrderTimeline from '@/components/ui/work-order/work-order-timeline.svelte';
	import WorkOrderDetail from '@/components/ui/work-order/work-order-detail.svelte';
	import { ACCESS_TOKEN, ICON_SIZE } from '@/const';
	import { appFetch } from '@/fetch';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import { ChevronLeft } from 'lucide-svelte';
	import { fade } from 'svelte/transition';
	import type { ComponentType } from 'svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
	import { goto } from '$app/navigation';
	import ProgressForm from './progress-form.svelte';
	import { progressSchema } from '@root/helpers/validator/progress.validator';
	import type { z } from 'zod';
	import { ResponseError } from '@/types';
	import { toast } from 'svelte-sonner';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient, type Infer } from 'sveltekit-superforms/adapters';

	const woId = $page.params.woId;
	const client = getClient();

	type UpsertFormProps = {
		data: SuperValidated<Infer<typeof progressSchema>>;
		id?: string;
	};
	let { data, id }: UpsertFormProps = $props();
	let showProgressModal = $state(false);

	const insertMutation = createMutation({
		mutationKey: ['progress'],
		mutationFn: async (data: z.infer<typeof progressSchema>) => {
			const response = await $client.progress.timeline.$post(
				{
					form: {
						work_order: woId,
						status: data.status,
						description: data.description,
						date_start: data.date_start,
						date_end: data.date_end
					}
				},
				{
					fetch: appFetch,
					init: { headers: { Authorization: localStorage.getItem(ACCESS_TOKEN) || '' } }
				}
			);

			const resData = await response.json();

			if (!response.ok || response.status !== 201) {
				throw new ResponseError(
					response.status,
					resData.results,
					resData.message ? resData.message : 'Create progress failed'
				);
			}

			return resData.results;
		},
		onSuccess: () => {
			toast.success('Update progress success');
			$workOrderTimelineQuery.refetch(); // Refresh timeline setelah update
		},
		onError: (error) => {
			if (error instanceof ResponseError) {
				toast.error(error.message);
				return;
			}
			toast.error('Something went wrong');
		}
	});

	const form = superForm(data, {
		validationMethod: 'auto',
		validators: zodClient(progressSchema),
		SPA: true,
		dataType: 'json',
		onUpdate: async ({ form: fd }) => {
			if (fd.valid) {
				$insertMutation.mutate(fd.data);
			}
		}
	});
	const { form: formData, enhance, reset } = form;
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
		<Button
			onclick={() => goto('/dashboard/work-orders/')}
			variant="outline"
			size="sm"
			class="w-fit"
		>
			<ChevronLeft size={ICON_SIZE} />
			<span class="text-sm">Back</span>
		</Button>
		<Button onclick={() => (showProgressModal = true)}>Update Progress</Button>
	</div>
	{#if $workOrderQuery.isLoading}
		<p>Loading...</p>
	{:else}
		<div transition:fade class="grid gap-4 lg:grid-cols-2">
			<div>
				<WorkOrderDetail workOrder={$workOrderQuery.data.results[0]} />
			</div>
			<!-- Progress form modal -->
			<ProgressForm
				bind:showModal={showProgressModal}
				onSubmit={(data) => {
					console.log('Form submitted:', data);
					showProgressModal = false;
				}}
			/>
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
