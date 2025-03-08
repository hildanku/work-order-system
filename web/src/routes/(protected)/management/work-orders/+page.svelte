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
	import type { TableActions, TableBulkBar } from '@/types';
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
			const response = await $client.workOrder.index.$get(
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
			accessorKey: 'id',
			header: () => {
				return renderComponent(CustomContainer, {
					value: 'ID',
					key: 'id',
					parentKey: 'work-order'
				});
			},
			cell: ({ row }) => `${row.original.work_orders?.id}`,

			enableHiding: false
		},
		{
			accessorKey: 'order_code',
			header: () => {
				return renderComponent(CustomContainer, {
					value: 'Order Code',
					key: 'order_code',
					parentKey: 'work-order'
				});
			},
			cell: ({ row }) => `${row.original.work_orders?.order_code}`,

			enableHiding: false
		},
		{
			accessorKey: 'products.name',
			header: () => {
				return renderComponent(CustomContainer, {
					value: 'Product',
					key: 'product',
					parentKey: 'work-order'
				});
			},
			cell: ({ row }) => `${row.original.products?.name}`,
			size: 1,
			enableHiding: false
		},
		{
			accessorKey: 'users',
			header: () => {
				return renderComponent(CustomContainer, {
					value: 'Users',
					key: 'user',
					parentKey: 'work-order'
				});
			},
			cell: ({ row }) => `${row.original.users?.name}`,

			enableHiding: false
		},
		{
			accessorKey: 'quantity',
			header: () => {
				return renderComponent(CustomContainer, {
					value: 'Quantity',
					key: 'quantity',
					parentKey: 'work-order'
				});
			},
			cell: ({ row }) => `${row.original.work_orders.quantity}`,

			enableHiding: false
		},
		{
			accessorKey: 'status',
			header: () => {
				return renderComponent(CustomContainer, {
					value: 'Status',
					key: 'status',
					parentKey: 'work-order'
				});
			},
			cell: ({ row }) => `${row.original.work_orders?.status}`,

			enableHiding: false
		},
		{
			accessorKey: 'deadline',
			header: () => {
				return renderComponent(CustomContainer, {
					value: 'Deadline',
					key: 'deadline',
					parentKey: 'work-order'
				});
			},
			cell: ({ row }) => `${row.original.work_orders?.deadline}`,

			enableHiding: false
		},
		/* 	{
			id: 'Updated',
			accessorKey: 'updated_at',
			header: () => {
				return renderComponent(CustomContainer, {
					value: 'Updated',
					key: 'updated_at',
					parentKey: 'work-order'
				});
			},
			cell: ({ row }) => {
				return renderComponent(CompactDate, {
					dateString: row.original.work_orders.updated_at | ''
				});
			},
			size: 1
		}, */
		{
			id: 'Created',
			accessorKey: 'created_at',
			header: () => {
				return renderComponent(CustomContainer, {
					value: 'Created',
					key: 'created_at',
					parentKey: 'user'
				});
			},
			cell: ({ row }) => {
				return renderComponent(CompactDate, {
					dateString: row.original.work_orders.created_at
				});
			},
			size: 1
		},
		{
			id: 'actions',
			enableHiding: false
		}
	];

	const actions: TableActions<WorkOrderEntity> = {
		content: actionContent
	};

	const bulkBar: TableBulkBar<void, Error, Row<WorkOrderEntity>[]> = {
		mutation: {
			mutationFn: async (data) => {
				for (const workOrder of data.map((d) => d.original)) {
					await $client.workOrder[':id'].$delete(
						{ param: { id: workOrder.id } },
						{
							fetch: appFetch,
							init: { headers: { Authorization: localStorage.getItem(ACCESS_TOKEN) || '' } }
						}
					);
				}
			},
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ['workOrder'] });
				$workOrderQuery.refetch();
				toast.success('work order is deleted');
			},
			onError: () => {
				toast.error('work order failed to delete');
			}
		}
	};
</script>

{#snippet actionContent(data: WorkOrderEntity)}
	<DropdownMenu.Content side="left" align="start">
		<DropdownMenu.Group>
			<DropdownMenu.GroupHeading>Actions</DropdownMenu.GroupHeading>
			<DropdownMenu.Item
				class="cursor-pointer"
				onclick={() => goto(`/management/work-orders/upsert?id=${data.id}`)}
			>
				<span>Edit</span>
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
{/snippet}
<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
	<div class="flex min-h-[100vh] flex-1 flex-col gap-2.5 rounded-xl md:min-h-min">
		<div class="flex flex-row justify-between">
			<p class="pb-5 text-xl font-bold">Manage Work Order Data</p>
			<div class="flex flex-row gap-2.5">
				<Search />
				<Button onclick={() => goto(`/management/work-orders/upsert`)} size="sm">
					<PlusIcon size={ICON_SIZE} />
					<span>New Work Order</span>
				</Button>
			</div>
		</div>
		{#if $workOrderQuery.isLoading || $workOrderQuery.isError || !$workOrderQuery.data}
			<Loading />
		{:else if $workOrderQuery.isSuccess}
			<DataTable {bulkBar} data={$workOrderQuery.data.results.items} {columns} {actions} />
			<div class="flex flex-row justify-between">
				<Limit totalItems={$workOrderQuery.data.results.meta.totalItems} />
				<Pagination totalItems={$workOrderQuery.data.results.meta.totalItems} />
			</div>
		{/if}
	</div>
</div>
