<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { CalendarIcon, SaveIcon } from 'lucide-svelte';
	import Loading from '@/components/ui/loading/loading.svelte';
	import * as Select from '@/components/ui/select/';
	import { Input } from '@/components/ui/input';
	import { Textarea } from '@/components/ui/textarea';
	import { ACCESS_TOKEN, ICON_SIZE } from '@/const';
	import { cn } from '@/utils';
	import { goto } from '$app/navigation';
	import { getClient } from '@/client';
	import { appFetch } from '@/fetch.js';
	import { ResponseError } from '@/types.js';

	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import type { InferResponseType } from 'hono';
	import { toast } from 'svelte-sonner';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import type { z } from 'zod';
	import { workOrderSchema } from '@root/helpers/validator/work-order.validator';
	import { writable } from 'svelte/store';
	import { WORK_ORDER_STATUS_OBJ } from '@root/helpers/const';
	import AsyncCombobox from '@/components/ui/async-combobox/combobox.svelte';
	import type { DropdownItem } from '@/components/ui/async-combobox';
	import type { ProductEntity } from '@root/modules/product/product.repository';
	import type { UserEntity } from '@root/modules/user/user.repository';
	import * as Popover from '@/components/ui/popover';
	import {
		CalendarDate,
		DateFormatter,
		getLocalTimeZone,
		today,
		type DateValue
	} from '@internationalized/date';

	import { buttonVariants } from '@/components/ui/button/button.svelte';
	import Calendar from '@/components/ui/calendar/calendar.svelte';

	type UpsertFormProps = {
		data: SuperValidated<Infer<typeof workOrderSchema>>;
		id?: string;
	};

	const client = getClient();

	let { data, id }: UpsertFormProps = $props();

	let selectedProduct = $state('');
	let products = writable<DropdownItem<string>[]>([]);

	let selectedUser = $state('');
	let users = writable<DropdownItem<string>[]>([]);

	const df = new DateFormatter('id-ID', {
		dateStyle: 'long'
	});

	let dateStartValue = $state<DateValue | undefined>();
	let dateStartPlaceholder = $state<DateValue>(today(getLocalTimeZone()));

	const uQuery = createQuery({
		queryKey: ['user'],
		queryFn: async () => {
			const response = await $client.user.index.$get(
				{ query: { q: '', page: '1', sort: 'created_at', order: 'DESC', limit: '500' } },
				{
					fetch: appFetch,
					init: { headers: { Authorization: localStorage.getItem(ACCESS_TOKEN) || '' } }
				}
			);

			return response.json();
		}
	});

	const pQuery = createQuery({
		queryKey: ['product'],
		queryFn: async () => {
			const response = await $client.product.index.$get(
				{ query: { q: '', page: '1', sort: 'created_at', order: 'DESC', limit: '500' } },
				{
					fetch: appFetch,
					init: { headers: { Authorization: localStorage.getItem(ACCESS_TOKEN) || '' } }
				}
			);
			const data = await response.json(); // Harus di-await
			console.log(data); // Debugging
			return data;
		}
	});
	const upsertQuery = createQuery({
		queryKey: ['workOrder', id],
		queryFn: async () => {
			try {
				const response = await $client.workOrder[':id'].$get(
					{ param: { id: id || '' } },
					{
						fetch: appFetch,
						init: { headers: { Authorization: localStorage.getItem(ACCESS_TOKEN) || '' } }
					}
				);

				const data = await response.json();
				console.log('Full response data:', data);
				return data;
			} catch (error) {
				console.error('Error fetching product:', error);
				throw error;
			}
		},
		enabled: !!id
	});

	const upsertMutation = createMutation({
		mutationKey: ['workOrder'],
		mutationFn: async (data: z.infer<typeof workOrderSchema>) => {
			if (id) {
				const response = await $client.workOrder[':id'].$patch(
					{
						param: { id },
						form: {
							...data
						}
					},
					{
						fetch: appFetch,
						init: {
							headers: { Authorization: localStorage.getItem(ACCESS_TOKEN) || '' }
						}
					}
				);

				const resData = await response.json();

				if (response.status !== 200)
					throw new ResponseError(
						response.status,
						null,
						resData.message ? resData.message : 'update wo is failed'
					);

				if (!resData.results)
					throw new ResponseError(
						response.status,
						resData.results,
						resData.message ? resData.message : 'update wo is failed'
					);

				return resData.results;
			} else {
				const response = await $client.workOrder.index.$post(
					{
						form: { ...data }
					},
					{
						fetch: appFetch,
						init: { headers: { Authorization: localStorage.getItem(ACCESS_TOKEN) || '' } }
					}
				);

				const resData = await response.json();

				if (response.status !== 201)
					throw new ResponseError(
						response.status,
						null,
						resData.message ? resData.message : 'Create payment method failed'
					);
				if (!resData.results)
					throw new ResponseError(
						response.status,
						resData.results,
						resData.message ? resData.message : 'Create payment method failed'
					);

				return resData.results;
			}
		},
		onSuccess: () => {
			toast.success(id ? 'Update work order success' : 'Create work order success');
			goto('/management/work-orders');
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
		validators: zodClient(workOrderSchema),
		SPA: true,
		onUpdate: async ({ form: fd }) => {
			if (fd.valid) {
				$upsertMutation.mutate(fd.data);
			}
		}
	});

	const { form: formData, enhance, reset } = form;

	$effect(() => {
		const res = $upsertQuery.data?.results;
		if (res) {
			reset({ data: { ...res } });
		}
	});
</script>

{#if $upsertQuery.isLoading || $uQuery.isLoading}
	<Loading />
{:else}
	<form method="POST" use:enhance class="flex flex-col gap-4">
		<Form.Field {form} name="product" class="min-w-[150px]">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Product</Form.Label>
					<Select.Root
						type="single"
						bind:value={
							() => $formData.product.toString(),
							(v) => {
								$formData.product = Number(v);
								return v;
							}
						}
						name={props.name}
					>
						<Select.Trigger {...props} class="capitalize">
							{$formData.product
								? $pQuery.data?.results.items.find((c: ProductEntity) => c.id === $formData.product)
										?.name || ''
								: 'Select Product'}
						</Select.Trigger>
						<Select.Content>
							{#each $pQuery.data?.results?.items as product}
								<Select.Item
									value={product.id.toString()}
									label={product.name}
									class="capitalize"
								/>
							{/each}
						</Select.Content>
					</Select.Root>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors class="text-xs font-normal" />
		</Form.Field>

		<Form.Field {form} name="user" class="min-w-[150px]">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Operator</Form.Label>
					<Select.Root
						type="single"
						bind:value={
							() => $formData.user.toString(),
							(v) => {
								$formData.user = Number(v);
								return v;
							}
						}
						name={props.name}
					>
						<Select.Trigger {...props} class="capitalize">
							{$formData.user
								? $uQuery.data?.results.items.find((c: UserEntity) => c.id === $formData.user)
										?.name || ''
								: 'Select Operator'}
						</Select.Trigger>
						<Select.Content>
							{#each $uQuery.data!.results.items.filter((user: UserEntity) => user.role === 'operator') as category}
								<Select.Item
									value={category.id.toString()}
									label={category.name}
									class="capitalize"
								/>
							{/each}
						</Select.Content>
					</Select.Root>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors class="text-xs font-normal" />
		</Form.Field>
		<Form.Field {form} name="quantity">
			<Form.Control>
				<Form.Label>Quantity(pcs)</Form.Label>
				<Input type="number" bind:value={$formData.quantity} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="status" class="min-w-[150px]">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Status</Form.Label>
					<Select.Root type="single" bind:value={$formData.status} name={props.name}>
						<Select.Trigger {...props} class="capitalize">
							{$formData.status
								? WORK_ORDER_STATUS_OBJ[$formData.status as keyof typeof WORK_ORDER_STATUS_OBJ]
								: 'Select Status'}
						</Select.Trigger>
						<Select.Content>
							{#each Object.keys(WORK_ORDER_STATUS_OBJ) as dt}
								<Select.Item
									value={dt}
									label={WORK_ORDER_STATUS_OBJ[dt as keyof typeof WORK_ORDER_STATUS_OBJ]}
									class="capitalize"
								/>
							{/each}
						</Select.Content>
					</Select.Root>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors class="text-xs font-normal" />
		</Form.Field>
		<Form.Field {form} name="deadline" class="flex flex-col">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Deadline</Form.Label>
					<Popover.Root>
						<Popover.Trigger
							{...props}
							class={cn(
								buttonVariants({ variant: 'outline' }),
								'w-full justify-start pl-4 text-left font-normal',
								!dateStartValue && 'text-muted-foreground'
							)}
						>
							{dateStartValue
								? df.format(dateStartValue.toDate(getLocalTimeZone()))
								: 'Pick Deadline'}
							<CalendarIcon class="ml-auto size-4 opacity-50" />
						</Popover.Trigger>
						<Popover.Content class="w-auto p-0" side="bottom" align="start">
							<Calendar
								type="single"
								class="rounded-lg bg-background"
								bind:value={dateStartValue as DateValue}
								bind:placeholder={dateStartPlaceholder}
								minValue={new CalendarDate(1900, 1, 1)}
								calendarLabel="Date start"
								onValueChange={(v) => {
									if (v) {
										$formData.deadline = v.toDate(getLocalTimeZone()).getTime();
									} else {
										$formData.deadline = 0;
									}
								}}
							/>
						</Popover.Content>
					</Popover.Root>
					<Form.FieldErrors />
					<input hidden value={$formData.deadline} name={props.name} />
				{/snippet}
			</Form.Control>
		</Form.Field>
		<Form.Button disabled={$upsertMutation.isPending} class="my-2.5 ms-auto w-full lg:w-fit">
			<span class="flex flex-row items-center gap-2.5">
				<span class="lg:hidden">Save</span>
				<SaveIcon size={ICON_SIZE} />
			</span>
		</Form.Button>
	</form>
{/if}
