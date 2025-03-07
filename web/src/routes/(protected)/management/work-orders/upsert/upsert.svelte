<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { SaveIcon } from 'lucide-svelte';
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
	import { WORK_ORDER_STATUS } from '@root/helpers/const';
	import AsyncCombobox from '@/components/ui/async-combobox/combobox.svelte';
	import type { DropdownItem } from '@/components/ui/async-combobox';
	import type { ProductEntity } from '@root/modules/product/product.repository';

	type UpsertFormProps = {
		data: SuperValidated<Infer<typeof workOrderSchema>>;
		id?: string;
	};

	const client = getClient();

	let { data, id }: UpsertFormProps = $props();

	let selectedProduct = $state('');
	let products = writable<DropdownItem<string>[]>([]);
	const productsQuery = createQuery({
		queryKey: ['products'],
		queryFn: async () => {
			const response = await $client.product.index.$get(
				{
					query: {
						page: '1',
						q: '',
						sort: 'created_at',
						order: 'DESC',
						limit: '12'
					}
				},
				{
					fetch: appFetch,
					init: {
						headers: {
							Authorization: localStorage.getItem(ACCESS_TOKEN) || ''
						}
					}
				}
			);
			const data = await response.json();
			return data.results;
		}
	});
	async function productLoadFn(search: string) {
		const products = await $client.product.index.$get(
			{
				query: {
					q: search,
					limit: '5',
					sort: 'id'
				}
			},
			{
				fetch: appFetch,

				init: {
					headers: { Authorization: localStorage.getItem(ACCESS_TOKEN) || '' }
				}
			}
		);

		const resData = await products.json();
		console.log('85', resData.results.items);
		return resData.results.items.map((c: ProductEntity) => ({
			value: c.id.toString(),
			label: c.name
		}));
	}
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
							...data,
							product: Number(data.product),
							user: Number(data.user)
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
	function handleOnSelect<T extends { label: string; value: string }>(originalData: T) {
		$formData.product = Number(originalData.value);
	}
</script>

{#if $upsertQuery.isLoading}
	<Loading />
{:else}
	<form method="POST" use:enhance class="flex flex-col gap-4" enctype="multipart/form-data">
		<Form.Field {form} name="product">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Product</Form.Label>
					<div class="rounded-lg bg-background">
						<AsyncCombobox
							bind:value={selectedProduct}
							onSelect={handleOnSelect}
							items={products}
							loadFn={productLoadFn}
							{...props}
						/>
					</div>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors class="text-xs font-normal" />
		</Form.Field>
		<Form.Field {form} name="user">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Product</Form.Label>
					<div class="rounded-lg bg-background">
						<AsyncCombobox
							bind:value={selectedProduct}
							onSelect={handleOnSelect}
							items={products}
							loadFn={productLoadFn}
							{...props}
						/>
					</div>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors class="text-xs font-normal" />
		</Form.Field>

		<Form.Field {form} name="user">
			<Form.Control>
				<Form.Label>User ID</Form.Label>
				<Input type="number" bind:value={$formData.user} placeholder="User ID" />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="order_code">
			<Form.Control>
				<Form.Label>Order Code</Form.Label>
				<Input bind:value={$formData.order_code} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="quantity">
			<Form.Control>
				<Form.Label>Quantity</Form.Label>
				<Input type="number" bind:value={$formData.quantity} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="status">
			<Form.Control>
				<Form.Label>Status</Form.Label>
				<Select.Root bind:value={$formData.status}>
					<Select.Trigger>
						{$formData.status || 'Select Status'}
					</Select.Trigger>
					<Select.Content>
						{#each WORK_ORDER_STATUS as status}
							<Select.Item value={status}>
								{status}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="deadline">
			<Form.Control>
				<Form.Label>Deadline (days)</Form.Label>
				<Input type="number" bind:value={$formData.deadline} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Button disabled={$upsertMutation.isPending} class="my-2.5 ms-auto w-full lg:w-fit">
			<span class="flex flex-row items-center gap-2.5">
				<span class="lg:hidden">Save</span>
				<SaveIcon size={ICON_SIZE} />
			</span>
		</Form.Button>
	</form>
{/if}
