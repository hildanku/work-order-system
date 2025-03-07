<script lang="ts" generics="T={label:string,value:string}">
	import * as Popover from '@/components/ui/popover/';
	import * as Command from '@/components/ui/command/';
	import { cn } from '@/utils';
	import { Check, ChevronsUpDown } from 'lucide-svelte';
	import type { AsyncComboboxProps } from '.';
	import { tick } from 'svelte';
	import { Input } from '../input';
	import { useDebounce } from 'runed';
	import { Button } from '../button';

	let {
		open = $bindable(false),
		items,
		value = $bindable(''),
		placeholder,
		disabled,
		name,
		class: className,
		loadFn,
		onSelect,
		...rest
	}: AsyncComboboxProps<T> = $props();

	let selectedLabel = $state(placeholder);
	let isLoading = $state(false);

	$effect(() => {
		if ($items.length > 0) {
			const find = $items.find((f) => f.value === value)?.label;
			if (find) {
				selectedLabel = find;
			} else {
				selectedLabel = placeholder;
				value = '';
			}
		}
	});

	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}

	async function handleInputChange(
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) {
		try {
			isLoading = true;
			const inputEl = e.target as HTMLInputElement;
			const response = await loadFn(inputEl.value);
			if (response.length > 0) {
				$items = response;
			}
		} catch (error) {
			console.error(error);
		} finally {
			isLoading = false;
		}
	}
</script>

<input {name} {...rest} type="hidden" bind:value />
<Popover.Root bind:open>
	<Popover.Trigger
		class={cn('flex w-full flex-row items-center justify-between rounded-lg border border-border')}
		role="combobox"
	>
		<Input
			role="combobox"
			aria-expanded={open}
			class={cn(
				'w-full border-none bg-transparent p-2.5',
				disabled ? 'cursor-not-allowed' : 'cursor-pointer'
			)}
			placeholder={selectedLabel || 'Select item'}
			readonly={true}
			{disabled}
			value={selectedLabel !== placeholder ? selectedLabel : ''}
		/>
		<ChevronsUpDown class="opacity-50" />
	</Popover.Trigger>
	<Popover.Content class="w-full p-0" side="bottom" align="start">
		<Command.Root>
			<Command.Input
				oninput={useDebounce((e) => handleInputChange(e), 500)}
				autofocus
				placeholder="Search..."
				class="h-9"
			/>
			{#if isLoading}
				<div class="flex min-h-[12rem] items-center justify-center">
					<span class="text-center text-sm">Loading...</span>
				</div>
			{:else if $items.length === 0}
				<Command.List>
					<Command.Empty>No Data</Command.Empty>
				</Command.List>
			{:else}
				<Command.List>
					{#key $items}
						{#each $items as item (item.value)}
							<div class="p-1">
								<Button
									class="line-clamp-1 flex w-full flex-row items-center justify-center text-left"
									variant="ghost"
									value={item.label}
									onclick={() => {
										value = item.value;
										// closeAndFocusTrigger(ids.trigger)
										if (onSelect) {
											//@ts-ignore
											onSelect(item);
										}
									}}
								>
									{item.label}
									<Check class={cn('ml-auto', value !== item.value && 'text-transparent')} />
								</Button>
							</div>
						{/each}
					{/key}
				</Command.List>
			{/if}
		</Command.Root>
	</Popover.Content>
</Popover.Root>
