<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements'
	import Sort from '../tableCell/sort.svelte'

	type CustomContainerProps = HTMLAttributes<HTMLDivElement> & {
		value: string
		key: string
		parentKey: string
	}

	let { value, key, parentKey, ...rest }: CustomContainerProps = $props()
</script>

<div {...rest}>
	<Sort {value} {key} {parentKey} />
</div>
