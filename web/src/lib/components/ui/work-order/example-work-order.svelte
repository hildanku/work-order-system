<script lang="ts">
	import WorkOrderDetails from '$lib/components/ui/work-order/work-order-detail.svelte';
	import WorkOrderTimeline from '$lib/components/ui/work-order/work-order-timeline.svelte';
	import type { ComponentType } from 'svelte';
	import { fade } from 'svelte/transition';

	// Types
	type WorkOrder = {
		id: string;
		title: string;
		status: 'pending' | 'in-progress' | 'completed';
		priority: 'low' | 'medium' | 'high';
		assignee: string;
		location: string;
		description: string;
		createdAt: string;
		dueDate: string;
	};

	type TimelineItem = {
		id: string;
		title: string;
		description: string;
		date: string;
		icon?: ComponentType;
		status: 'pending' | 'in-progress' | 'completed';
	};

	// Props
	type Props = {
		workOrder: WorkOrder;
		timelineItems: TimelineItem[];
	};

	let { workOrder, timelineItems }: Props = $props();
</script>

<div transition:fade class="grid gap-4 lg:grid-cols-2">
	<div>
		<WorkOrderDetails {workOrder} />
	</div>
	<div>
		<WorkOrderTimeline {timelineItems} />
	</div>
</div>
