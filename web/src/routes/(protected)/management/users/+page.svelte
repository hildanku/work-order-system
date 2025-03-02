<script lang="ts">
	import { createQuery, QueryClient } from '@tanstack/svelte-query';
	import { navigating } from '$app/stores';
	import DataTable from '@/components/ui/data-table/data-table.svelte';
	import type { ColumnDef, Row } from '@tanstack/table-core';
	import CompactDate from '@/components/ui/tableCell/compactDate.svelte';
	import { renderComponent, renderSnippet } from '@/components/ui/data-table';
	import CustomContainer from '@/components/ui/misc/customContainer.svelte';
	import type { TableActions, TableBulkBar } from '@/types';
	import * as DropdownMenu from '@/components/ui/dropdown-menu';
	import { PlusIcon } from 'lucide-svelte';
	import { Button } from '@/components/ui/button';
	import Sort from '@/components/ui/tableCell/sort.svelte';
	import { SearchParams } from '$lib/hooks/searchParams.svelte';
	import Limit from '@/components/ui/queryable/limit.svelte';
	import { Pagination, Search } from '@/components/ui/queryable';
	import { ACCESS_TOKEN, ICON_SIZE } from '@/const';
	import { goto } from '$app/navigation';
	import { Checkbox } from '@/components/ui/checkbox';
	import { getClient } from '@/client';
	import { toast } from 'svelte-sonner';
	import { appFetch } from '@/fetch';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import Loading from '@/components/ui/loading/loading.svelte';
	import type { UserEntity } from '@root/modules/user/user.repository';

	const searchParams = new SearchParams();
	const client = getClient();
	const queryClient = new QueryClient();
	const userQuery = createQuery({
		queryKey: ['user'],
		queryFn: async () => {
			const response = await $client.user.index.$get(
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
			console.log(response);
			return response.json();
		}
	});
	$effect(() => {
		if ($navigating) {
			$userQuery.refetch();
		}
	});
	const columns: ColumnDef<UserEntity>[] = [
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
			accessorKey: 'name',
			header: () => {
				return renderComponent(Sort, { value: 'Name', key: 'name', parentKey: 'user' });
			},
			enableHiding: false
		},
		{
			id: 'Username',
			accessorKey: 'username',
			header: () => {
				return renderComponent(Sort, { value: 'Username', key: 'username', parentKey: 'user' });
			},
			enableHiding: true
		},
		{
			id: 'Role',
			accessorKey: 'role',
			header: () => {
				return renderComponent(Sort, { value: 'Role', key: 'role', parentKey: 'user' });
			},
			cell: ({ row }) => {
				return renderSnippet(roleBadge, row.original.role);
			},
			enableHiding: true
		},
		{
			id: 'Updated',
			accessorKey: 'updated_at',
			header: () => {
				return renderComponent(CustomContainer, {
					value: 'Updated',
					key: 'updated_at',
					parentKey: 'user'
				});
			},
			cell: ({ row }) => {
				return renderComponent(CompactDate, {
					dateString: row.original.updated_at
				});
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
					parentKey: 'user'
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

	const actions: TableActions<UserEntity> = {
		content: actionContent
	};

	const bulkBar: TableBulkBar<void, Error, Row<UserEntity>[]> = {
		mutation: {
			mutationFn: async (data) => {
				for (const user of data.map((d) => d.original)) {
					await $client.user[':id'].$delete(
						{ param: { id: user.id.toString() } },
						{
							fetch: appFetch,
							init: { headers: { Authorization: localStorage.getItem(ACCESS_TOKEN) || '' } }
						}
					);
				}
			},
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ['user'] });
				$userQuery.refetch();
				toast.success('User deleted successfully');
			},
			onError: () => {
				toast.error('Gagal menghapus user');
			}
		}
	};
</script>

{#snippet roleBadge(role: UserEntity['role'])}
	<span class="capitalize">
		{#if role === 'production_manager'}
			<Badge>{role}</Badge>
		{:else if role === 'operator'}
			<Badge class={'bg-sky-500 hover:bg-sky-600'}>{role}</Badge>
		{:else}
			<Badge>{role}</Badge>
		{/if}
	</span>
{/snippet}

{#snippet actionContent(data: UserEntity)}
	<DropdownMenu.Content side="left" align="start">
		<DropdownMenu.Group>
			<DropdownMenu.GroupHeading>Actions</DropdownMenu.GroupHeading>
			<DropdownMenu.Item
				class="cursor-pointer"
				onclick={() => goto(`/dashboard/management/user/upsert?id=${data.id}`)}
			>
				<span>Edit</span>
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
{/snippet}
<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
	<div class="flex min-h-[100vh] flex-1 flex-col gap-2.5 rounded-xl md:min-h-min">
		<div class="flex flex-row justify-between">
			<p class="pb-5 text-xl font-bold">Manage User Data</p>
			<div class="flex flex-row gap-2.5">
				<Search />
				<Button onclick={() => goto(`/dashboard/management/user/upsert`)} size="sm">
					<PlusIcon size={ICON_SIZE} />
					<span>New User</span>
				</Button>
			</div>
		</div>
		{#if $userQuery.isLoading || $userQuery.isError || !$userQuery.data}
			<Loading />
		{:else if $userQuery.isSuccess}
			<DataTable {bulkBar} data={$userQuery.data.results.items} {columns} {actions} />
			<div class="flex flex-row justify-between">
				<Limit totalItems={$userQuery.data.results.meta.totalItems} />
				<Pagination totalItems={$userQuery.data.results.meta.totalItems} />
			</div>
		{/if}
	</div>
</div>
