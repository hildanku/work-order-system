<script lang="ts">
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogFooter
	} from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import type { z } from 'zod';
	import { progressSchema } from '@root/helpers/validator/progress.validator';
	import { createMutation } from '@tanstack/svelte-query';
	import { enhance } from '$app/forms';
	import * as Popover from '$lib/components/ui/popover';
	import { Calendar } from '$lib/components/ui/calendar';
	import { CalendarIcon } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { buttonVariants } from '$lib/components/ui/button';
	import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date';

	// Props type
	type Props = {
		showModal?: boolean;
		onSubmit?: (data: z.infer<typeof progressSchema>) => void;
	};

	// Create props using $props() rune
	let { showModal = $bindable(false), ...resProps }: Props = $props();

	// Form data state
	const formData = $state({
		work_order: '',
		status: 'pending',
		description: '',
		date_start: Date.now(),
		date_end: Date.now()
	});

	// Loading state
	let isSubmitting = $state(false);
	// Date picker state
	let dateStartValue = $state<CalendarDate | undefined>();
	let dateEndValue = $state<CalendarDate | undefined>();
	/** Handle form submission */
	const handleSubmit = async (e: SubmitEvent) => {
		e.preventDefault();
		isSubmitting = true;

		try {
			if (dateStartValue) {
				formData.date_start = dateStartValue.toDate(getLocalTimeZone()).getTime();
			}
			if (dateEndValue) {
				formData.date_end = dateEndValue.toDate(getLocalTimeZone()).getTime();
			}
			// Validate form data
			const validatedData = progressSchema.parse(formData);

			// Call onSubmit callback if provided
			if (resProps.onSubmit) {
				resProps.onSubmit(validatedData);
			}

			// Reset form
			formData.work_order = '';
			formData.status = 'pending';
			formData.description = '';
			formData.date_start = Date.now();
			formData.date_end = Date.now();
			dateStartValue = undefined;
			dateEndValue = undefined;
		} catch (error) {
			console.error('Validation error:', error);
		} finally {
			isSubmitting = false;
		}
	};

	// Status options
	const statusOptions = ['pending', 'in_progress', 'completed', 'canceled'] as const;

	const progressMutation = createMutation({});
</script>

<Dialog bind:open={showModal}>
	<DialogContent class="sm:max-w-[425px]">
		<DialogHeader>
			<DialogTitle>Update Work Order Progress</DialogTitle>
		</DialogHeader>

		<form use:enhance onsubmit={handleSubmit} class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="work_order">Work Order ID</Label>
				<Input
					id="work_order"
					bind:value={formData.work_order}
					placeholder="Enter work order ID"
					disabled={isSubmitting}
					required
				/>
			</div>

			<div class="grid gap-2">
				<Label for="status">Status</Label>
				<Select type="single" bind:value={formData.status}>
					<SelectTrigger id="status">
						{formData.status}
					</SelectTrigger>
					<SelectContent>
						{#each statusOptions as status}
							<SelectItem value={status}>
								{status.replace('_', ' ')}
							</SelectItem>
						{/each}
					</SelectContent>
				</Select>
			</div>

			<div class="grid gap-2">
				<Label for="description">Description</Label>
				<Textarea
					id="description"
					bind:value={formData.description}
					placeholder="Enter progress description"
					disabled={isSubmitting}
					required
				/>
			</div>
			<div class="grid gap-2">
				<Label for="date_start">Start Date</Label>
				<Popover.Root>
					<Popover.Trigger
						class={cn(
							buttonVariants({ variant: 'outline' }),
							'w-full justify-start pl-4 text-left font-normal',
							!dateStartValue && 'text-muted-foreground'
						)}
					>
						{dateStartValue ? dateStartValue.toString() : 'Pick a start date'}
						<CalendarIcon class="ml-auto size-4 opacity-50" />
					</Popover.Trigger>
					<Popover.Content class="w-auto p-0" side="bottom" align="start">
						<Calendar
							type="single"
							class="rounded-lg bg-background"
							bind:value={dateStartValue}
							minValue={today(getLocalTimeZone())}
							onValueChange={(value) => {
								dateStartValue = value;
							}}
						/>
					</Popover.Content>
				</Popover.Root>
			</div>

			<div class="grid gap-2">
				<Label for="date_end">End Date</Label>
				<Popover.Root>
					<Popover.Trigger
						class={cn(
							buttonVariants({ variant: 'outline' }),
							'w-full justify-start pl-4 text-left font-normal',
							!dateEndValue && 'text-muted-foreground'
						)}
					>
						{dateEndValue ? dateEndValue.toString() : 'Pick an end date'}
						<CalendarIcon class="ml-auto size-4 opacity-50" />
					</Popover.Trigger>
					<Popover.Content class="w-auto p-0" side="bottom" align="start">
						<Calendar
							type="single"
							class="rounded-lg bg-background"
							bind:value={dateEndValue}
							minValue={dateStartValue || today(getLocalTimeZone())}
							onValueChange={(value) => {
								dateEndValue = value;
							}}
						/>
					</Popover.Content>
				</Popover.Root>
			</div>
			<DialogFooter>
				<Button variant="outline" onclick={() => (showModal = false)} type="button">Cancel</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? 'Saving...' : 'Save Progress'}
				</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
