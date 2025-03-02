<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import LoginForm from './login.svelte';
	import { toggleMode } from 'mode-watcher';
	import { Moon, Sun } from 'lucide-svelte';

	let { data } = $props();
</script>

<div class="grid w-full">
	<span class="absolute flex flex-row gap-2.5 items-center right-5 top-5 h-fit w-fit font-medium">
		<a href="/register"> Register </a>
		<Button onclick={toggleMode} variant="ghost" size="icon" class="me-4 ms-auto">
			<Sun
				class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
			/>
			<Moon
				class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
			/>
			<span class="sr-only">Toggle theme</span>
		</Button>
	</span>
	<Card.Root class="m-auto h-fit w-2/3 border-none bg-transparent lg:w-1/2">
		<Card.Header>
			<Card.Title class="text-2xl lg:text-lg">Login</Card.Title>
			<Card.Description>Enter your account information to continue</Card.Description>
		</Card.Header>
		<Card.Content>
			<LoginForm data={data.form} />
		</Card.Content>
	</Card.Root>
</div>
