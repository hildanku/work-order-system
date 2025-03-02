<script lang="ts">
	import { ICON_SIZE } from '@/const'
	import { LoaderCircle } from 'lucide-svelte'
</script>

<div class="flex h-full w-full items-center justify-center">
	<div class="flex flex-row items-center gap-1">
        <LoaderCircle class="animate-spin" size={ICON_SIZE} />
		<span>loading..</span>
	</div>
</div>
