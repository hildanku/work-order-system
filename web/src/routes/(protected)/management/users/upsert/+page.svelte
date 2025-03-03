<script lang="ts">
	import { goto } from '$app/navigation'
	import { Button } from '@/components/ui/button'
	import { ICON_SIZE } from '@/const'
	import { ChevronLeft } from 'lucide-svelte'
	import UpsertForm from './upsert.svelte'
	import { page } from '$app/stores'

	let { data } = $props()
</script>

<div class="flex min-h-[100vh] flex-1 flex-col gap-2.5 rounded-xl md:min-h-min">
	<div class="flex flex-row justify-between">
		<Button
			onclick={() => goto('/management/users?page=1&limit=10&sort=created_at')}
			variant="outline"
			size="sm"
			class="w-fit"
		>
			<ChevronLeft size={ICON_SIZE} />
			<span class="text-sm">Back</span>
		</Button>
    </div>
<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
	<UpsertForm data={data.form} id={$page.url.searchParams.get('id') || undefined} />
</div>
</div>
