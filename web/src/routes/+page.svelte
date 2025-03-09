<script lang="ts">
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';

	const handleLogin = () => {
		goto('/login');
	};
</script>

<div class="flex justify-center items-center min-h-screen">
	<Card class="w-[400px] shadow-lg">
		<CardHeader>
			<CardTitle class="text-xl font-semibold">Welcome to Work Order Management System</CardTitle>
		</CardHeader>
		<CardContent class="text-center">
			<p class="text-gray-500">Manage work order with easy and efficient.</p>
			<Button class="mt-4 w-full" onclick={handleLogin}>Login</Button>
		</CardContent>
	</Card>
</div>
