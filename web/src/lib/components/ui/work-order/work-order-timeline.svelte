<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import type { ComponentType } from 'svelte';
	import { fade, slide } from 'svelte/transition';


	let { timelineItems }: Props = $props();

	// Get status badge variant
	const getStatusVariant = (status: TimelineItem['status']) => {
		switch (status) {
			case 'completed':
				return 'default';
			case 'in-progress':
				return 'secondary';
			case 'pending':
				return 'outline';
			default:
				return 'outline';
		}
	};
</script>

<Card>
	<CardHeader>
		<CardTitle>Timeline</CardTitle>
	</CardHeader>
	<CardContent>
		<div transition:fade class="relative">
			<!-- Timeline line -->
			<div class="absolute inset-0 flex justify-center">
				<div class="h-full w-0.5 bg-border"></div>
			</div>

			<!-- Timeline items -->
			<div class="relative space-y-8">
				{#each timelineItems as item}
					<div transition:slide class="flex gap-4">
						<!-- Timeline dot and icon -->
						<div class="relative flex h-10 w-10 items-center justify-center">
							<div class="absolute h-3 w-3 rounded-full bg-primary"></div>
							{#if item.icon}
								<div
									class="absolute -inset-1 flex items-center justify-center rounded-full bg-muted p-2"
								>
									<svelte:component this={item.icon} class="h-4 w-4" />
								</div>
							{/if}
						</div>

						<!-- Timeline content -->
						<div class="flex-1">
							<div class="flex items-center justify-between">
								<h4 class="font-medium">{item.title}</h4>
								<Badge variant={getStatusVariant(item.status)}>
									{item.status}
								</Badge>
							</div>
							<p class="mt-1 text-sm text-muted-foreground">{item.description}</p>
							<time class="mt-2 block text-xs text-muted-foreground">{item.date}</time>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</CardContent>
</Card>
