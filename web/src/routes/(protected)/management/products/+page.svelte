<script lang="ts">
	import type { ProductEntity } from '@root/modules/product/product.repository';
	import { SearchParams } from '@/hooks/searchParams.svelte';
	import { getClient } from '@/client';
	import { createQuery, QueryClient } from '@tanstack/svelte-query';
	import { appFetch } from '@/fetch';
	import * as DropdownMenu from '@/components/ui/dropdown-menu';
	import { navigating } from '$app/stores';
	import type { ColumnDef, Row } from '@tanstack/table-core';
	import { renderComponent, renderSnippet } from '@/components/ui/data-table';
	import { Checkbox } from '@/components/ui/checkbox';
	import Sort from '@/components/ui/tableCell/sort.svelte';
	import CustomContainer from '@/components/ui/misc/customContainer.svelte';
	import CompactDate from '@/components/ui/tableCell/compactDate.svelte';
	import type { TableActions, TableBulkBar } from '@/types';
	import { ACCESS_TOKEN, ICON_SIZE, PRODUCT_PATH_PREFIX } from '@/const';
	import { goto } from '$app/navigation';
	import { Pagination, Search } from '@/components/ui/queryable';
	import { Button } from '@/components/ui/button';
	import Loading from '@/components/ui/loading/loading.svelte';
	import DataTable from '@/components/ui/data-table/data-table.svelte';
	import Limit from '@/components/ui/queryable/limit.svelte';

	import { toast } from 'svelte-sonner';
	import { PlusIcon } from 'lucide-svelte';

	const searchParams = new SearchParams();
	const client = getClient();
	const queryClient = new QueryClient();

	const productQuery = createQuery({
		queryKey: [
			'product',
			searchParams.page,
			searchParams.limit,
			searchParams.sort,
			searchParams.order,
			searchParams.search
		],
		queryFn: async () => {
			const response = await $client.product.index.$get(
				{
					query: {
						page: searchParams.page.toString(),
						limit: searchParams.limit.toString(),
						order: searchParams.order,
						sort: searchParams.sort,
						q: searchParams.search
					}
				},
				{
					fetch: appFetch,
					init: { headers: { Authorization: localStorage.getItem(ACCESS_TOKEN) || '' } }
				}
			);
			return await response.json();
		}
	});

	$effect(() => {
		if ($navigating) {
			$productQuery.refetch();
		}
	});

	const columns: ColumnDef<ProductEntity>[] = [
		{
			id: 'select',
			header: ({ table }) =>
				renderComponent(Checkbox, {
					checked: table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected(),
					indeterminate: table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
					onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
					controlledChecked: true,
					'aria-label': 'Select all'
				}),
			cell: ({ row }) =>
				renderComponent(Checkbox, {
					checked: row.getIsSelected(),
					onCheckedChange: (value) => row.toggleSelected(!!value),
					controlledChecked: true,
					'aria-label': 'Select row'
				}),
			enableSorting: false,
			enableHiding: false,
			size: 1
		},
		{
			accessorKey: 'image',
			header: 'Image',
			cell: ({ row }) => {
				return renderSnippet(imageCell, row.original);
			},
			enableHiding: false
		},
		{
			accessorKey: 'name',
			header: () => {
				return renderComponent(Sort, { value: 'Name', key: 'name', parentKey: 'product' });
			},
			enableHiding: false
		},
		{
			accessorKey: 'description',
			header: 'Description',
			cell: ({ row }) => row.original.description,
			enableHiding: true
		},
		{
			id: 'Updated',
			accessorKey: 'updated_at',
			header: () => {
				return renderComponent(CustomContainer, {
					value: 'Updated',
					key: 'updated_at',
					parentKey: 'product'
				});
			},
			cell: ({ row }) => {
				return row.original.updated_at
					? renderComponent(CompactDate, { dateString: row.original.updated_at })
					: '-';
			},
			size: 1
		},
		{
			id: 'Created',
			accessorKey: 'created_at',
			header: () => {
				return renderComponent(CustomContainer, {
					value: 'Created',
					key: 'created_at',
					parentKey: 'product'
				});
			},
			cell: ({ row }) => {
				return renderComponent(CompactDate, {
					dateString: row.original.created_at
				});
			},
			size: 1
		},
		{
			id: 'actions',
			enableHiding: false
		}
	];

	const actions: TableActions<ProductEntity> = {
		content: actionContent
	};

	const bulkBar: TableBulkBar<void, Error, Row<ProductEntity>[]> = {
		mutation: {
			mutationFn: async (data) => {
				for (const items of data.map((d) => d.original)) {
					await $client.product[':id'].$delete(
						{ param: { id: items.id.toString() } },
						{ init: { headers: { Authorization: localStorage.getItem(ACCESS_TOKEN) || '' } } }
					);
				}
			},
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ['product'] });
				$productQuery.refetch();
				toast.success('Product deleted successfully');
			},
			onError: () => {
				toast.error('Gagal menghapus produk');
			}
		}
	};
</script>

{#snippet imageCell(data: ProductEntity)}
	{#if data?.image}
		<!-- svelte-ignore a11y_img_redundant_alt -->
		<img class="max-w-[12rem]" src={PRODUCT_PATH_PREFIX + data.image} alt="Product Image" />
	{:else}
		<p class="text-red-500">No Image</p>
	{/if}
{/snippet}

{#snippet actionContent(data: ProductEntity)}
	<DropdownMenu.Content side="left" align="start" sideOffset={20}>
		<DropdownMenu.Group>
			<DropdownMenu.GroupHeading>Actions</DropdownMenu.GroupHeading>
			<DropdownMenu.Item
				class="cursor-pointer"
				onclick={() => goto(`/management/products/upsert?id=${data.id}`)}
			>
				<span>Edit</span>
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
{/snippet}

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
	<div class="flex min-h-[100vh] flex-1 flex-col gap-2.5 rounded-xl md:min-h-min">
		<div class="flex flex-row justify-between">
			<p class="pb-5 text-xl font-bold">Manage Product Data</p>
			<div class="flex flex-row gap-2.5">
				<Search />
				<Button onclick={() => goto(`/management/products/upsert`)} size="sm">
					<PlusIcon size={ICON_SIZE} />
					<span>New Product</span>
				</Button>
			</div>
		</div>
		{#if $productQuery.isLoading || $productQuery.isError || !$productQuery.data}
			<Loading />
		{:else if $productQuery.isSuccess}
			<DataTable {bulkBar} data={$productQuery.data.results.items} {columns} {actions} />
			<div class="flex flex-row justify-between">
				<Limit totalItems={$productQuery.data.results.meta.totalItems} />
				<Pagination totalItems={$productQuery.data.results.meta.totalItems} />
			</div>
		{/if}
	</div>
</div>
