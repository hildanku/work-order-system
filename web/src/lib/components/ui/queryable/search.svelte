<script lang="ts">
	import { useDebounce } from 'runed';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Input } from '$lib/components/ui/input';
	import { SearchIcon, XIcon } from 'lucide-svelte';
	import { ICON_SIZE } from '@/const';
	import { Button } from '../button';

	let search = $state($page.url.searchParams.get('q') ?? '');

	function handleValueChange(value: string) {
		search = value;
		$page.url.searchParams.set('q', search);
		goto(`${$page.url.pathname}?${$page.url.searchParams.toString()}`, {
			keepFocus: true,
			noScroll: true
		});
	}

	function handleClear() {
		search = '';
		$page.url.searchParams.delete('q');
		goto(`${$page.url.pathname}?${$page.url.searchParams.toString()}`, {
			keepFocus: true,
			noScroll: true
		});
	}
</script>

<div class="flex h-fit flex-row rounded-lg border border-border">
	<Input
		oninput={useDebounce(() => {
			handleValueChange(search);
		}, 500)}
		placeholder="Search..."
		bind:value={search}
		class="py-0 border-none h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
	></Input>
	{#if search !== ''}
		<Button onclick={handleClear} size="sm" variant="ghost">
			<XIcon size={ICON_SIZE} />
		</Button>
	{:else}
		<Button size="sm" variant="ghost" class="hover:bg-transparent">
			<SearchIcon size={ICON_SIZE} />
		</Button>
	{/if}
</div>
