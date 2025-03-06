<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { SaveIcon } from 'lucide-svelte';
	import Loading from '@/components/ui/loading/loading.svelte';
	import * as Select from '@/components/ui/select/';
	import { Input } from '@/components/ui/input';
	import { Textarea } from '@/components/ui/textarea';
	import { ACCESS_TOKEN, ICON_SIZE } from '@/const';
	import { cn } from '@/utils';
	import Dropzone from './dropzone.svelte';
	import { goto } from '$app/navigation';
	import { getClient } from '@/client';
	import { appFetch } from '@/fetch.js';
	import { ResponseError } from '@/types.js';
	import { productSchema } from '@root/helpers/validator/product.validator';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import type { InferResponseType } from 'hono';
	import { toast } from 'svelte-sonner';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import type { z } from 'zod';

	type UpsertFormProps = {
		data: SuperValidated<Infer<typeof productSchema>>;
		id?: string;
	};

	let file = $state<File | null>(null);
	const client = getClient();

	let { data, id }: UpsertFormProps = $props();

	const insertProduct = $client.product.index.$post;
	const updateProduct = $client.product[':id'].$patch;

	type InsertProduct = InferResponseType<typeof insertProduct>;
	type UpdateProduct = InferResponseType<typeof updateProduct>;

	const upsertQuery = createQuery({
		queryKey: ['product', id],
		queryFn: async () => {
			try {
				const response = await $client.product[':id'].$get(
					{ param: { id: id || '' } },
					{
						fetch: appFetch,
						init: { headers: { Authorization: localStorage.getItem(ACCESS_TOKEN) || '' } }
					}
				);

				const data = await response.json();
				console.log('Full response data:', data);

				// const resultImages = data.results?.image ? [data.results.image] : [];
				// const files: File[] = [];
				const resultImage = data.results?.image || null;
				let file: File | null = null;

				if (resultImage) {
					try {
						const imageResponse = await appFetch(`/public/product/${resultImage}`, {
							method: 'GET',
							headers: {
								Accept: 'image/*'
							}
						});

						const buff = await imageResponse.arrayBuffer();
						file = new File([buff], resultImage, {
							type: imageResponse.headers.get('Content-Type') || 'image/jpeg'
						});
					} catch (error) {
						console.error('Error fetching image:', resultImage, error);
					}
				}

				return {
					...data.results,
					file
				};
			} catch (error) {
				console.error('Error fetching product:', error);
				throw error;
			}
		},
		enabled: !!id
	});

	const upsertMutation = createMutation({
		mutationKey: ['product'],
		mutationFn: async (data: z.infer<typeof productSchema>) => {
			console.log('Mutation data:', data);
			const fd = new FormData();

			for (const key in data) {
				if (key !== 'image') {
					fd.set(key, data[key as keyof typeof data] as string);
				}
			}

			if (data.image instanceof File) {
				fd.append('image', data.image);
			}

			if (id) {
				const response = await appFetch(`/api/product/${id}`, {
					method: 'PATCH',
					headers: { Authorization: localStorage.getItem(ACCESS_TOKEN) || '' },
					body: fd
				});

				const resData = (await response.json()) as UpdateProduct;

				if (response.status !== 200) {
					throw new ResponseError(
						response.status,
						null,
						resData.message ? resData.message : 'Update product failed'
					);
				}
				if (!resData.results) {
					throw new ResponseError(
						response.status,
						resData.results,
						resData.message ? resData.message : 'Update product failed'
					);
				}

				return resData.results;
			} else {
				const response = await appFetch(`/api/product`, {
					method: 'POST',
					headers: { Authorization: localStorage.getItem(ACCESS_TOKEN) || '' },
					body: fd
				});

				const resData = (await response.json()) as InsertProduct;

				if (response.status !== 201) {
					throw new ResponseError(
						response.status,
						null,
						resData.message ? resData.message : 'Create product failed'
					);
				}
				if (!resData.results) {
					throw new ResponseError(
						response.status,
						resData.results,
						resData.message ? resData.message : 'Create product failed'
					);
				}

				return resData.results;
			}
		},
		onSuccess: () => {
			toast.success(id ? 'Update product success' : 'Create product success');
			goto('/management/products');
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
		validators: zodClient(productSchema),
		SPA: true,
		resetForm: false,
		onUpdate: async ({ form: fd }) => {
			if (fd.valid) {
				$upsertMutation.mutate(fd.data);
			}
		}
	});

	const { form: formData, enhance, reset } = form;

	$effect(() => {
		const res = $upsertQuery.data;
		if (res) {
			reset({
				data: {
					name: res.name,
					description: res.description,
					image: res.file || null
				}
			});

			if (res.file && res.file.length > 0) {
				file = res.file;
			}
		}
	});

	function handleFilesAdded(file: File | null) {
		$formData.image = file;
	}
</script>

{#if $upsertQuery.isLoading}
	<Loading />
{:else}
	<form method="POST" use:enhance class="flex flex-col" enctype="multipart/form-data">
		<Form.Field {form} name="name">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Name</Form.Label>
					<Input
						{...props}
						disabled={$upsertMutation.isPending}
						bind:value={$formData.name}
						placeholder="Product name"
					/>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors class="text-xs font-normal" />
		</Form.Field>
		<Form.Field {form} name="description">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Descriptions</Form.Label>
					<Textarea
						{...props}
						disabled={$upsertMutation.isPending}
						bind:value={$formData.description}
						placeholder="Product descriptions"
					/>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors class="text-xs font-normal" />
		</Form.Field>

		<Form.Field {form} name="image">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Product Photos</Form.Label>
					<Form.Description class="text-xs">1024px x 1024px</Form.Description>
					<Dropzone
						bind:file
						accept={'image/png, image/jpeg, image/webp'}
						onFileAdded={handleFilesAdded}
						{...props}
					/>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors>
				{#snippet children({ errors, errorProps })}
					<span class={cn('text-sm font-medium text-destructive')}>
						{#if errors.length > 0}
							{#each errors[0].split('\n') as error}
								<div
									{...errorProps}
									class="text-sm text-xs font-medium font-normal text-destructive"
								>
									{error}
								</div>
							{/each}
						{/if}
					</span>
				{/snippet}
			</Form.FieldErrors>
		</Form.Field>
		<Form.Button disabled={$upsertMutation.isPending || !$formData} class="my-2.5 ms-auto">
			<span class="flex flex-row items-center gap-2.5">
				<span>Save</span>
				<SaveIcon size={ICON_SIZE} />
			</span>
		</Form.Button>
	</form>
{/if}
