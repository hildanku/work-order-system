<script lang="ts">
	import ArrowUpDown from 'lucide-svelte/icons/arrow-up-down'
	import { Button } from '$lib/components/ui/button/index.js'
	import type { TableSortProps } from '@/types'
	import { page as pageStore } from '$app/stores'
	import { goto } from '$app/navigation'
	import { QueryClient } from '@tanstack/svelte-query'

	let { variant = 'ghost', value, key, parentKey, ...restProps }: TableSortProps = $props()

	const queryClient = new QueryClient()

	async function handleClick() {
		await queryClient.invalidateQueries({
			queryKey: [parentKey]
		})
		const searchParams = new URLSearchParams(window.location.search)
		const currentOrder = searchParams.get('order') ?? 'DESC'
		$pageStore.url.searchParams.set('sort', key)
		$pageStore.url.searchParams.set('order', currentOrder === 'ASC' ? 'DESC' : 'ASC')

		goto(`${$pageStore.url.pathname}?${$pageStore.url.searchParams.toString()}`, {
			keepFocus: true,
			noScroll: true
		})
	}
</script>

<Button onclick={handleClick} {variant} class="w-full justify-start p-0 hover:bg-transparent" {...restProps}>
	{value}
	<ArrowUpDown class="ml-2 size-4" />
</Button>
