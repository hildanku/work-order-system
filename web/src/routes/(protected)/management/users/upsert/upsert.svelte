<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { getClient } from '@/client';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import { z } from 'zod';
	import { ResponseError } from '@/types';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { Input } from '@/components/ui/input';
	import { ACCESS_TOKEN, ICON_SIZE } from '@/const';
	import { SaveIcon, CameraIcon } from 'lucide-svelte';
	import { appFetch } from '@/fetch';
	import * as Select from '@/components/ui/select';
	import { ROLE_OBJ } from '@root/helpers/const';
	import { userSchema } from '@root/helpers/validator/user.validator';

	export type AvatarChangeOptions = {
		onLoad: (e: ProgressEvent<FileReader>) => void;
		onAfterLoad?: (f: File) => void;
	};
	export function handleAvatarChange(event: Event, options: AvatarChangeOptions) {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = options.onLoad;
			reader.readAsDataURL(file);
			if (options.onAfterLoad) options.onAfterLoad(file);
		}
	}

	type UpsertFormProps = {
		data: SuperValidated<Infer<typeof userSchema>>;
		id?: string;
	};
	let avatarPreviewUrl = $state('');
	let avatarInputRef = $state<HTMLInputElement | undefined>(undefined);

	type MutationArgs =
		| { id: undefined; data: z.infer<typeof userSchema> }
		| { id: string; data: z.infer<typeof omittedUpdateUserSchema> };

	const omittedUpdateUserSchema = userSchema.omit({});

	const client = getClient();
	let { data, id }: UpsertFormProps = $props();

	const upsertQuery = createQuery({
		queryKey: ['user', id],
		queryFn: async () => {
			const response = await $client.user[':id'].$get(
				{ param: { id: id || '' } },
				{
					fetch: appFetch,
					init: { headers: { Authorization: localStorage.getItem(ACCESS_TOKEN) || '' } }
				}
			);

			return response.json();
		},
		enabled: !!id
	});

	const upsertMutation = createMutation({
		mutationKey: ['user'],
		mutationFn: async (args: MutationArgs) => {
			const { id, data } = args;
			if (id !== undefined) {
				const response = await $client.user[':id'].$patch(
					{
						param: { id },
						form: {
							...data,
							avatar: data.avatar ? data.avatar : undefined
						}
					},
					{
						fetch: appFetch,
						init: { headers: { Authorization: localStorage.getItem(ACCESS_TOKEN) || '' } }
					}
				);

				const resData = await response.json();

				if (response.status !== 200)
					throw new ResponseError(
						response.status,
						null,
						resData.message ? resData.message : 'Update user failed'
					);
				if (!resData.results)
					throw new ResponseError(
						response.status,
						resData.results,
						resData.message ? resData.message : 'Update user failed'
					);

				return resData.results;
			} else {
				const response = await $client.user.index.$post(
					{
						form: { ...data }
					},
					{
						fetch: appFetch,
						init: { headers: { Authorization: localStorage.getItem(ACCESS_TOKEN) || '' } }
					}
				);

				const resData = await response.json();

				if (response.status !== 201)
					throw new ResponseError(
						response.status,
						null,
						resData.message ? resData.message : 'Create user failed'
					);
				if (!resData.results)
					throw new ResponseError(
						response.status,
						resData.results,
						resData.message ? resData.message : 'Create user failed'
					);

				return resData.results;
			}
		},

		onSuccess: () => {
			toast.success(id ? 'Update user success' : 'Create user success');
			goto('/management/users');
		},

		onError: (error) => {
			if (error instanceof ResponseError) {
				toast.error(error.message);
				return;
			}

			toast.error('Something went wrong');
		}
	});

	const form = superForm(data, {
		validationMethod: 'auto',
		validators: id ? zodClient(omittedUpdateUserSchema) : zodClient(userSchema),
		SPA: true,
		onUpdate: async ({ form: fd }) => {
			if (fd.valid) {
				$upsertMutation.mutate({ id, data: fd.data });
			}
		}
	});

	const { form: formData, enhance, reset } = form;

	$effect(() => {
		const res = $upsertQuery.data?.results;
		if (res) {
			reset({ data: { ...res, phone: res.phone || undefined } });
		}
	});
	function handleAvatarClick() {
		avatarInputRef?.click();
	}
	export const AVATAR_FORMAT = ['image/jpeg', 'image/png'];
</script>

<form method="POST" use:enhance class="flex flex-col" enctype="multipart/form-data">
	<Form.Field {form} name="name">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Name</Form.Label>
				<Input
					disabled={$upsertMutation.isPending}
					{...props}
					bind:value={$formData.name}
					placeholder="Input name"
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors class="text-xs font-normal" />
	</Form.Field>
	{#if !id}
		<Form.Field {form} name="username">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Username</Form.Label>
					<Input
						disabled={$upsertMutation.isPending}
						{...props}
						bind:value={$formData.username}
						placeholder="Input username"
					/>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors class="text-xs font-normal" />
		</Form.Field>
	{/if}
	<Form.Field {form} name="role" class="min-w-[150px]">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Role</Form.Label>
				<Select.Root type="single" bind:value={$formData.role} name={props.name}>
					<Select.Trigger {...props} class="capitalize">
						{$formData.role ? ROLE_OBJ[$formData.role as keyof typeof ROLE_OBJ] : 'Select Role'}
					</Select.Trigger>
					<Select.Content>
						{#each Object.keys(ROLE_OBJ) as dt}
							<Select.Item
								value={dt}
								label={ROLE_OBJ[dt as keyof typeof ROLE_OBJ]}
								class="capitalize"
							/>
						{/each}
					</Select.Content>
				</Select.Root>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors class="text-xs font-normal" />
	</Form.Field>
	{#if !id}
		<Form.Field {form} name="password">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Password</Form.Label>
					<Input
						disabled={$upsertMutation.isPending}
						{...props}
						bind:value={$formData.password}
						placeholder="Input password"
						type="password"
					/>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors class="text-xs font-normal" />
		</Form.Field>
		<Form.Field {form} name="avatar">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Avatar</Form.Label>
					<Form.Description>Change your profile picture</Form.Description>
					<div class="my-2.5 flex h-full w-full items-center justify-center">
						<button type="button" onclick={() => handleAvatarClick()}>
							{#if avatarPreviewUrl !== '/public/avatar/null'}
								<img
									src={avatarPreviewUrl}
									alt="Avatar Preview"
									class="h-[10rem] w-[10rem] rounded-full object-cover lg:h-[12rem] lg:w-[12rem]"
								/>
							{:else}
								<div
									class="flex h-[10rem] w-[10rem] items-center justify-center rounded-full border border-border bg-muted lg:h-[12rem] lg:w-[12rem]"
								>
									<CameraIcon size={ICON_SIZE} />
								</div>
							{/if}
						</button>
					</div>
					<input
						bind:this={avatarInputRef}
						disabled={$upsertMutation.isPending}
						{...props}
						onchange={(e) =>
							handleAvatarChange(e, {
								onLoad: (e) => {
									avatarPreviewUrl = e.target?.result as string;
								},
								onAfterLoad: (f) => {
									formData.update((form) => {
										form.avatar = f;
										return form;
									});
								}
							})}
						type="file"
						hidden
						placeholder="Input your avatar"
						accept={AVATAR_FORMAT.toString()}
					/>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors class="text-xs font-normal" />
		</Form.Field>
		<h1>s</h1>
	{/if}

	<Form.Button disabled={$upsertMutation.isPending} class="my-2.5 ms-auto">
		<span class="flex flex-row items-center gap-2.5">
			<span>Save</span>
			<SaveIcon size={ICON_SIZE} />
		</span>
	</Form.Button>
</form>
