<script lang="ts">
	let { children } = $props();
</script>

<div class="grid h-screen w-full lg:grid-cols-2">
	<div class="hidden w-full overflow-hidden bg-white lg:grid">
		<span class="absolute left-5 top-5 h-fit w-fit font-medium text-white">Optik Zolaris</span>
		<img class="h-full w-full object-cover" src="/auth_hero.jpg" alt="" />
	</div>
	{@render children()}
</div>
