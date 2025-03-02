<script lang="ts">
	import { goto } from '$app/navigation'
	import { navigating, page as pageStore } from '$app/stores'
	import * as Pagination from '$lib/components/ui/pagination/index.js'
	import { onMount } from 'svelte'

	type PaginationProps = {
		totalItems: number
		page?: number
	}

	let { totalItems, page = $bindable(1) }: PaginationProps = $props()
	let perPage = $state(10)

	onMount(() => {
		page = Number($pageStore.url.searchParams.get('page') ?? 1)
		perPage = Number($pageStore.url.searchParams.get('limit') ?? 10)

		$pageStore.url.searchParams.set('page', page.toString())
		goto(`${$pageStore.url.pathname}?${$pageStore.url.searchParams.toString()}`, {
			keepFocus: true,
			noScroll: true
		})
	})

	$effect(() => {
		if ($navigating) {
			perPage = Number($pageStore.url.searchParams.get('limit') ?? 10)
			page = Number($pageStore.url.searchParams.get('page') ?? 1)
		}
	})
</script>

<Pagination.Root
	onPageChange={(p) => {
		$pageStore.url.searchParams.set('page', p.toString())
		goto(`${$pageStore.url.pathname}?${$pageStore.url.searchParams.toString()}`, {
			keepFocus: true,
			noScroll: true
		})
	}}
	count={totalItems}
	bind:page
	{perPage}
	class="mx-0 w-fit"
>
	{#snippet children({ pages, currentPage })}
		<Pagination.Content>
			<Pagination.Item>
				<Pagination.PrevButton />
			</Pagination.Item>
			{#each pages as page (page.key)}
				{#if page.type === 'ellipsis'}
					<Pagination.Item>
						<Pagination.Ellipsis />
					</Pagination.Item>
				{:else}
					<Pagination.Item>
						<Pagination.Link {page} isActive={currentPage === page.value}>
							{page.value}
						</Pagination.Link>
					</Pagination.Item>
				{/if}
			{/each}
			<Pagination.Item>
				<Pagination.NextButton />
			</Pagination.Item>
		</Pagination.Content>
	{/snippet}
</Pagination.Root>
