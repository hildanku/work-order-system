<script lang="ts" generics="TData,TValue">
	import { createSvelteTable, FlexRender } from '@/components/ui/data-table'
	import {
		getCoreRowModel,
		getSortedRowModel,
		type ColumnDef,
		type Row,
		type RowSelectionState,
		type SortingState,
		type VisibilityState
	} from '@tanstack/table-core'
	import * as Table from '$lib/components/ui/table'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import { Ellipsis, RefreshCwIcon, TrashIcon, LoaderCircle } from 'lucide-svelte'
	import { Button } from '@/components/ui/button'
	import type { TableActions, TableBulkBar } from '@/types'
	import { cn, flyAndScale } from '@/utils'
	import { MediaQuery } from 'runed'
	import { ICON_SIZE } from '@/const'
	import { createMutation } from '@tanstack/svelte-query'

	type DataTableProps<TData, TValue> = {
		columns: ColumnDef<TData, TValue>[]
		data: TData[]
		actions: TableActions<TData>
		bulkBar?: TableBulkBar<void, Error, Row<TData>[]>
	}

	let { data, columns, actions, bulkBar }: DataTableProps<TData, TValue> = $props()
	let sorting = $state<SortingState>([])
	let columnVisibility = $state<VisibilityState>({})
	let rowSelection = $state<RowSelectionState>({})
	let bulkBarMutation = bulkBar ? createMutation(bulkBar.mutation) : undefined

	const table = createSvelteTable<TData>({
		get data() {
			return data
		},
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onColumnVisibilityChange: (updater) => {
			if (typeof updater === 'function') {
				columnVisibility = updater(columnVisibility)
			} else {
				columnVisibility = updater
			}
		},
		onRowSelectionChange: (updater) => {
			if (typeof updater === 'function') {
				rowSelection = updater(rowSelection)
			} else {
				rowSelection = updater
			}
		},
		state: {
			get sorting() {
				return sorting
			},
			get columnVisibility() {
				return columnVisibility
			},
			get rowSelection() {
				return rowSelection
			}
		},
		defaultColumn: { minSize: 1 }
	})

	const screen = new MediaQuery('(max-width: 768px)')
</script>

<div class="relative rounded-lg border border-border">
	<Table.Root class="w-full">
		<Table.Header>
			{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
				<Table.Row>
					{#each headerGroup.headers as header (header.id)}
						<Table.Head
							class={cn(
								'text-nowrap',
								header.id === 'actions' || header.id === 'select' || header.getSize() === 1 ?
									'w-1'
								:	'',
								header.id === 'actions' ? 'sticky -right-1 z-10 '
								: header.id === 'select' ? 'sticky -left-1 z-0'
								: '',
								(header.id === 'select' || header.id === 'actions') && screen.matches ?
									'bg-background'
								:	''
							)}
						>
							{#if header.id === 'actions'}
								<DropdownMenu.Root>
									<DropdownMenu.Trigger>
										{#snippet child({ props })}
											<Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
												<Ellipsis class="size-4" />
											</Button>
										{/snippet}
									</DropdownMenu.Trigger>
									<DropdownMenu.Content align="end" class="z-20">
										{#each table
											.getAllColumns()
											.filter((col) => col.getCanHide()) as column (column.id)}
											<DropdownMenu.CheckboxItem
												class="capitalize"
												checked={column.getIsVisible()}
												onCheckedChange={(value) => column.toggleVisibility(!!value)}
											>
												{#if typeof column.columnDef.header === 'string'}
													{column.columnDef.header}
												{:else}
													{column.columnDef.id}
												{/if}
											</DropdownMenu.CheckboxItem>
										{/each}
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							{:else if !header.isPlaceholder}
								<FlexRender content={header.column.columnDef.header} context={header.getContext()} />
							{/if}
						</Table.Head>
					{/each}
				</Table.Row>
			{/each}
		</Table.Header>
		<Table.Body>
			{#each table.getRowModel().rows as row (row.id)}
				<Table.Row data-state={row.getIsSelected() && 'selected'}>
					{#each row.getVisibleCells() as cell (cell.id)}
						{#if cell.column.id === 'actions'}
							<Table.Cell
								class={cn([
									cell.column.id === 'actions' ? 'sticky -right-1 w-1 ' : '',
									cell.column.id === 'actions' && screen.matches ? 'bg-background ' : ''
								])}
							>
								<DropdownMenu.Root>
									<DropdownMenu.Trigger>
										{#snippet child({ props })}
											<Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
												<span class="sr-only">Open menu</span>
												<Ellipsis class="size-4" />
											</Button>
										{/snippet}
									</DropdownMenu.Trigger>
									{@render actions.content(cell.row.original)}
								</DropdownMenu.Root>
							</Table.Cell>
						{:else}
							<Table.Cell
								class={cn(
									cell.column.getSize() === 1 ? 'w-1' : '',
									cell.column.id === 'select' ? 'sticky -left-1' : '',
									cell.column.id === 'select' && screen.matches ? 'bg-background' : ''
								)}
							>
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
							</Table.Cell>
						{/if}
					{/each}
				</Table.Row>
			{:else}
				<Table.Row>
					<Table.Cell colspan={columns.length} class="h-24 text-center">No results.</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
{#if bulkBar}
	{#if table.getFilteredSelectedRowModel().rows.length > 0}
		<div
			transition:flyAndScale
			class="fixed bottom-[10%] flex flex-1 flex-row items-center justify-center self-center text-sm"
		>
			<div
				class="flex max-sm:w-[80vw] w-[50vw] flex-row rounded-lg border border-foreground/20 bg-muted p-2.5 text-muted-foreground shadow-sm lg:w-[40vw]"
			>
				<div class="flex w-1/2 flex-row items-center gap-1">
					<span class="text-nowrap">
						{table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length}
						row(s) selected
					</span>
					<Button
						onclick={() => table.resetRowSelection(true)}
						size="sm"
						variant="outline"
						disabled={$bulkBarMutation?.isPending}
					>
						<RefreshCwIcon size={ICON_SIZE} />
						Reset
					</Button>
				</div>
				<div class="flex ms-auto w-fit lg:w-1/2">
					<Button
						onclick={() => {
							const rows = table.getFilteredSelectedRowModel().rows
							if ($bulkBarMutation) {
								$bulkBarMutation.mutateAsync(rows).then(() => table.resetRowSelection(true))
							}
						}}
						size="sm"
						variant="destructive"
						class="ms-auto"
						disabled={$bulkBarMutation?.isPending}
					>
						{#if $bulkBarMutation?.isPending}
							<LoaderCircle class="animate-spin" size={ICON_SIZE} />
						{:else}
							<TrashIcon size={ICON_SIZE} />
						{/if}
						Delete
					</Button>
				</div>
			</div>
		</div>
	{/if}
{/if}
