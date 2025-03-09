<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
	import { Badge } from '@/components/ui/badge';
	import { fade, slide } from 'svelte/transition';
	import type { WorkOrderProgressEntity } from '@root/modules/progress/progress.repository';

	export let progress: WorkOrderProgressEntity;

	const getStatusVariant = (status: WorkOrderProgressEntity['status']) => {
		const variants = {
			completed: 'default',
			in_progress: 'secondary',
			pending: 'outline',
			canceled: 'destructive'
		};
		return variants[status] ?? 'outline';
	};

	const formatDate = (timestamp: number) => {
		if (!timestamp) return 'Unknown date';
		return new Date(timestamp).toLocaleDateString('id-ID', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};
</script>

<Card>
	<CardHeader>
		<CardTitle>Work Order Progress</CardTitle>
	</CardHeader>
	<CardContent>
		<div transition:fade class="relative">
			<!-- Timeline line -->
			<div class="absolute inset-0 flex justify-center">
				<div class="h-full w-0.5 bg-border"></div>
			</div>

			<!-- Timeline item -->
			<div class="relative space-y-8">
				<div transition:slide class="flex gap-4">
					<!-- Timeline dot -->
					<div class="relative flex h-10 w-10 items-center justify-center">
						<div class="absolute h-3 w-3 rounded-full bg-primary"></div>
					</div>

					<!-- Timeline content -->
					<div class="flex-1">
						<div class="flex items-center justify-between">
							<h4 class="font-medium">Status Updated</h4>
							<Badge variant={getStatusVariant(progress.status)}>
								{progress.status}
							</Badge>
						</div>
						<p class="mt-1 text-sm text-muted-foreground">
							{progress.description || 'No additional information'}
						</p>
						<time class="mt-2 block text-xs text-muted-foreground">
							{formatDate(progress.timestamp)}
						</time>
					</div>
				</div>
			</div>
		</div>
	</CardContent>
</Card>
