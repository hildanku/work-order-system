<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import Button from '@/components/ui/button/button.svelte';
	import { TrashIcon } from 'lucide-svelte';
	import { ICON_SIZE } from '@/const';
	import { cn } from '@/utils';

	type Props = {
		onFileAdded?: (file: File | null) => void;
		file?: File | null;
	} & HTMLInputAttributes;

	let {
		onFileAdded: fileAdded,
		disabled,
		accept,
		file = null,
		...rest
	}: Props = $props();

	let dragCounter = $state(0);
	let isDragging = $state(false);
	let fileInput: HTMLInputElement;

	function isFileTypeAccepted(file: File, accept?: string): boolean {
		if (!accept) return true;
		const acceptedTypes = accept.split(',').map((type) => type.trim().toLowerCase());
		const fileType = file.type.toLowerCase();
		const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;

		return acceptedTypes.some((type) => {
			if (type.endsWith('/*')) {
				const baseType = type.split('/')[0];
				return fileType.startsWith(`${baseType}/`);
			}
			return type === fileType || type === fileExtension;
		});
	}

	function handleDragEnter(e: DragEvent) {
		if (disabled) return;
		e.preventDefault();
		e.stopPropagation();
		dragCounter++;
		isDragging = true;
	}

	function handleDragLeave(e: DragEvent) {
		if (disabled) return;
		e.preventDefault();
		e.stopPropagation();
		dragCounter--;
		if (dragCounter === 0) {
			isDragging = false;
		}
	}

	function handleDragOver(e: DragEvent) {
		if (disabled) return;
		e.preventDefault();
		e.stopPropagation();
	}

	function handleDrop(e: DragEvent) {
		if (disabled) return;
		e.preventDefault();
		e.stopPropagation();
		isDragging = false;
		dragCounter = 0;

		if (e.dataTransfer?.files.length > 0) {
			const droppedFile = e.dataTransfer.files[0];
			handleFile(droppedFile);
		}
	}

	function handleFileInput(e: Event) {
		if (disabled) return;
		const target = e.target as HTMLInputElement;
		if (target.files?.length > 0) {
			handleFile(target.files[0]);
		}
	}

	function handleFile(newFile: File) {
		if (disabled) return;

		if (isFileTypeAccepted(newFile, accept || 'image/*')) {
			file = newFile; // Simpan hanya satu file
			if (fileAdded) {
				fileAdded(file);
			}
		}
	}

	function removeFile() {
		if (disabled) return;
		fileInput.value = '';
		file = null;
		if (fileAdded) {
			fileAdded(null);
		}
	}
</script>

<div
		role="none"
		class={cn([
		'flex w-full cursor-pointer flex-col items-center rounded-lg border border-border p-2.5 text-center',
		disabled ? 'cursor-not-allowed' : ''
	])}
		class:dragging={isDragging}
		ondragenter={handleDragEnter}
		ondragleave={handleDragLeave}
		ondragover={handleDragOver}
		ondrop={handleDrop}
		onclick={(e) => {
		if (disabled) return;
		if (e.target === e.currentTarget) {
			fileInput.click();
		}
	}}
>
	<input
			type="file"
			bind:this={fileInput}
			onchange={handleFileInput}
			style="display: none;"
			{...rest}
	/>

	<div class="pointer-events-none m-5 w-fit text-foreground/50">
		{#if isDragging}
			<p>Drop a file here!</p>
		{:else}
			<p>Click or drag a file here to upload</p>
		{/if}
	</div>

	{#if file}
		<div class="flex w-full flex-col gap-2.5 p-2.5">
			<h3>Selected File:</h3>
			<div class="flex flex-row items-center justify-between gap-2.5">
				<div class="flex flex-row gap-2.5">
					<span class="line-clamp-1">{file.name}</span>
				</div>
				<Button
						{disabled}
						type="button"
						variant={'destructive'}
						size={'icon'}
						onclick={removeFile}
				>
					<TrashIcon size={ICON_SIZE} />
				</Button>
			</div>
		</div>
	{/if}
</div>

<style>
	.dropzone.dragging {
		background-color: #f0f0f0;
		border-color: #666;
	}
</style>
