<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import type { ExpandedWorkOrderEntity } from '@root/modules/work-order/work-order.repository';

	export type ExpandedWorkOrderProps = {
		workOrder: ExpandedWorkOrderEntity;
	};

	let { workOrder: w }: ExpandedWorkOrderProps = $props();

	const getStatusVariant = (status: 'pending' | 'in_progress' | 'completed' | 'canceled') => {
		switch (status) {
			case 'completed':
				return 'default';
			case 'in_progress':
				return 'secondary';
			case 'pending':
				return 'outline';
			case 'canceled':
				return 'destructive';
			default:
				return 'outline';
		}
	};

	const formatDate = (timestamp: number | null) => {
		if (!timestamp) return 'N/A';
		return new Date(timestamp).toLocaleDateString('id-ID', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};
</script>

<Card>
	<CardHeader>
		<div class="flex items-center justify-between">
			<CardTitle>Work Order Details</CardTitle>
			<Badge variant={getStatusVariant(w.work_orders.status)}>
				{w.work_orders.status}
			</Badge>
		</div>
	</CardHeader>
	<CardContent>
		<div class="space-y-4">
			<div class="grid gap-2">
				<div class="flex justify-between">
					<span class="font-medium">Order Code</span>
					<span>{w.work_orders.order_code}</span>
				</div>
				<div class="flex justify-between">
					<span class="font-medium">Product</span>
					<span>{w.products ? w.products.name : 'N/A'}</span>
				</div>
				<div class="flex justify-between">
					<span class="font-medium">Assigned User</span>
					<span>{w.users ? w.users.name : 'Unassigned'}</span>
				</div>
				<div class="flex justify-between">
					<span class="font-medium">Quantity</span>
					<span>{w.work_orders.quantity}</span>
				</div>
				<div class="flex justify-between">
					<span class="font-medium">Created At</span>
					<span>{formatDate(w.work_orders.created_at)}</span>
				</div>
				<div class="flex justify-between">
					<span class="font-medium">Deadline</span>
					<span>{formatDate(w.work_orders.deadline)}</span>
				</div>
			</div>
			<div class="space-y-2">
				<span class="font-medium">Description</span>
				<p class="text-sm text-muted-foreground">{w.products?.description || 'No description'}</p>
			</div>
		</div>
	</CardContent>
</Card>
