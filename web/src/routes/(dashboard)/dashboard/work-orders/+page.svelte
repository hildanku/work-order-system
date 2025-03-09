<script lang="ts">
	import { getClient } from '@/client';
	import { ACCESS_TOKEN, ICON_SIZE } from '@/const';
	import { appFetch } from '@/fetch';
	import { SearchParams } from '@/hooks/searchParams.svelte';
	import { createQuery, QueryClient } from '@tanstack/svelte-query';
	import { navigating } from '$app/stores';
	import type { ColumnDef, Row } from '@tanstack/table-core';
	import type { WorkOrderEntity } from '@root/modules/work-order/work-order.repository';
	import { renderComponent } from '@/components/ui/data-table';
	import { Checkbox } from '@/components/ui/checkbox';
	import CustomContainer from '@/components/ui/misc/customContainer.svelte';
	import type { TableActions } from '@/types';
	import { toast } from 'svelte-sonner';
	import * as DropdownMenu from '@/components/ui/dropdown-menu';
	import { goto } from '$app/navigation';
	import Search from '@/components/ui/queryable/search.svelte';
	import { Button } from '@/components/ui/button';
	import { PlusIcon } from 'lucide-svelte';
	import Loading from '@/components/ui/loading/loading.svelte';
	import DataTable from '@/components/ui/data-table/data-table.svelte';
	import Limit from '@/components/ui/queryable/limit.svelte';
	import Pagination from '@/components/ui/queryable/pagination.svelte';
	import CompactDate from '@/components/ui/tableCell/compactDate.svelte';
	import type { ExpandedWorkOrderEntity } from '@root/modules/work-order/work-order.repository';

	const searchParams = new SearchParams();
	const client = getClient();
	const queryClient = new QueryClient();
	// for now use unsafety
	const workOrderQuery = createQuery({
		queryKey: [
			'workOrder',
			searchParams.page,
			searchParams.limit,
			searchParams.sort,
			searchParams.order,
			searchParams.search
		],
		queryFn: async () => {
			const response = await $client.workOrder['assigned'].$get(
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
			return response.json();
		}
	});

	$effect(() => {
		if ($navigating) {
			$workOrderQuery.refetch();
		}
	});

	const columns: ColumnDef<ExpandedWorkOrderEntity>[] = [
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
			accessorKey: 'order_code',
			header: () =>
				renderComponent(CustomContainer, {
					value: 'Order Code',
					key: 'order_code',
					parentKey: 'work-order'
				}),
			cell: ({ row }) => `${row.original.work_orders?.order_code}`,
			enableHiding: false
		},
		{
			accessorKey: 'products.name',
			header: () =>
				renderComponent(CustomContainer, {
					value: 'Product',
					key: 'product',
					parentKey: 'work-order'
				}),
			cell: ({ row }) => `${row.original.products?.name}`,
			size: 1,
			enableHiding: false
		},
		{
			accessorKey: 'status',
			header: () =>
				renderComponent(CustomContainer, {
					value: 'Status',
					key: 'status',
					parentKey: 'work-order'
				}),
			cell: ({ row }) => `${row.original.work_orders?.status}`,
			enableHiding: false
		},
		{
			accessorKey: 'deadline',
			header: () =>
				renderComponent(CustomContainer, {
					value: 'Deadline',
					key: 'deadline',
					parentKey: 'work-order'
				}),
			cell: ({ row }) =>
				renderComponent(CompactDate, { dateString: row.original.work_orders?.deadline }),
			enableHiding: false
		},
		{
			id: 'Created',
			accessorKey: 'created_at',
			header: () =>
				renderComponent(CustomContainer, {
					value: 'Created',
					key: 'created_at',
					parentKey: 'user'
				}),
			cell: ({ row }) =>
				renderComponent(CompactDate, { dateString: row.original.work_orders.created_at }),
			size: 1
		},
		{
			id: 'actions',
			enableHiding: false
		}
	];

	const actions: TableActions<ExpandedWorkOrderEntity> = {
		content: actionContent
	};
</script>

{#snippet actionContent(data: ExpandedWorkOrderEntity)}
	<DropdownMenu.Content side="left" align="start">
		<DropdownMenu.Group>
			<DropdownMenu.GroupHeading>Actions</DropdownMenu.GroupHeading>
			<DropdownMenu.Item
				class="cursor-pointer"
				onclick={() => goto(`/dashboard/work-orders/details/${data?.work_orders.id}`)}
			>
				<span>View Details</span>
			</DropdownMenu.Item>
			<DropdownMenu.Item
				class="cursor-pointer"
				onclick={() => goto(`/dashboard/work-orders/update/${data?.work_orders.id}`)}
			>
				<span>Update Status</span>
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
{/snippet}

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
	<div class="flex min-h-[100vh] flex-1 flex-col gap-2.5 rounded-xl md:min-h-min">
		<div class="flex flex-row justify-between">
			<p class="pb-5 text-xl font-bold">Assigned Work Orders</p>
			<div class="flex flex-row gap-2.5">
				<Search />
			</div>
		</div>
		{#if $workOrderQuery.isLoading || $workOrderQuery.isError}
			<Loading />
		{:else if $workOrderQuery.isSuccess}
			<DataTable data={$workOrderQuery.data.results.items} {columns} {actions} />
			<div class="flex flex-row justify-between">
				<Limit totalItems={$workOrderQuery.data.results.meta.totalItems} />
				<Pagination totalItems={$workOrderQuery.data.results.meta.totalItems} />
			</div>
		{/if}
	</div>
</div>
