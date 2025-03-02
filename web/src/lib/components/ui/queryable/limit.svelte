<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import * as Select from '$lib/components/ui/select/index.js'
	import { LIMIT } from '@/const'
	import { recalculatePage } from '@/hooks/pagination.svelte'

	type LimitProps = { value?: number[]; totalItems: number }

	let { value, totalItems }: LimitProps = $props()
	let limit = $state(Number($page.url.searchParams.get('limit') ?? 10))
	let pageNumber = $state(Number($page.url.searchParams.get('page') ?? 1))

	function handleValueChange(value: string) {
		limit = Number(value)
		const recal = recalculatePage(pageNumber, totalItems, 0, limit)
		$page.url.searchParams.set('limit', limit.toString())
		$page.url.searchParams.set('page', recal.toString())
		goto(`${$page.url.pathname}?${$page.url.searchParams.toString()}`, {
			keepFocus: true,
			noScroll: true
		})
	}
</script>

<Select.Root type={'single'} value={limit.toString()} onValueChange={handleValueChange}>
	<Select.Trigger class="w-[100px]">
		<span class="text-sm font-medium">Limit: {limit}</span>
	</Select.Trigger>
	<Select.Content>
		{#if value}
			{#each value as l}
				<Select.Item value={l.toString()}>{l}</Select.Item>
			{/each}
		{:else}
			{#each LIMIT as l}
				<Select.Item value={l.toString()}>{l}</Select.Item>
			{/each}
		{/if}
	</Select.Content>
</Select.Root>
