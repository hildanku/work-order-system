<script lang="ts">
	import * as Form from '$lib/components/ui/form'
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms'
	import { getClient } from '@/client'
	import { createMutation, createQuery } from '@tanstack/svelte-query'
	import { z } from 'zod'
	import { ResponseError } from '@/types'
	import { toast } from 'svelte-sonner'
	import { goto } from '$app/navigation'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import { Input } from '@/components/ui/input'
	import { ACCESS_TOKEN, ICON_SIZE } from '@/const'
	import { SaveIcon } from 'lucide-svelte'
	// import { createUserSchema, updateUserSchema } from '@root/lib/zod/user'
	import { appFetch } from '@/fetch'
	import * as Select from '@/components/ui/select'
    import { ROLE } from '@root/helpers/const'
	import { userSchema } from '@root/helpers/validator/user.validator';

	type UpsertFormProps = {
		data: SuperValidated<Infer<typeof userSchema>>
		id?: string
	}

	type MutationArgs =
		| { id: undefined; data: z.infer<typeof userSchema> }
		| { id: string; data: z.infer<typeof omittedUpdateUserSchema> }

	const omittedUpdateUserSchema = userSchema.omit({ avatar: true })

	const client = getClient()
	let { data, id }: UpsertFormProps = $props()

	const upsertQuery = createQuery({
		queryKey: ['user', id],
		queryFn: async () => {
			const response = await $client.user[':id'].$get(
				{ param: { id: id || '' } },
				{
					fetch: appFetch,
					init: { headers: { Authorization: localStorage.getItem(ACCESS_TOKEN) || '' } }
				}
			)

			return response.json()
		},
		enabled: !!id
	})

	const upsertMutation = createMutation({
		mutationKey: ['user'],
		mutationFn: async (args: MutationArgs) => {
			const { id, data } = args
			if (id !== undefined) {
				const response = await $client.user[':id'].$patch(
					{
						param: { id },
						form: { ...data }
					},
					{
						fetch: appFetch,
						init: { headers: { Authorization: localStorage.getItem(ACCESS_TOKEN) || '' } }
					}
				)

				const resData = await response.json()

				if (response.status !== 200)
					throw new ResponseError(
						response.status,
						null,
						resData.message ? resData.message : 'Update user failed'
					)
				if (!resData.results)
					throw new ResponseError(
						response.status,
						resData.results,
						resData.message ? resData.message : 'Update user failed'
					)

				return resData.results
			} else {
				const response = await $client.user.index.$post(
					{
						form: { ...data }
					},
					{
						fetch: appFetch,
						init: { headers: { Authorization: localStorage.getItem(ACCESS_TOKEN) || '' } }
					}
				)

				const resData = await response.json()

				if (response.status !== 201)
					throw new ResponseError(
						response.status,
						null,
						resData.message ? resData.message : 'Create user failed'
					)
				if (!resData.results)
					throw new ResponseError(
						response.status,
						resData.results,
						resData.message ? resData.message : 'Create user failed'
					)

				return resData.results
			}
		},

		onSuccess: () => {
			toast.success(id ? 'Update user success' : 'Create user success')
			goto('/management/users')
		},

		onError: (error) => {
			if (error instanceof ResponseError) {
				toast.error(error.message)
				return
			}

			toast.error('Something went wrong')
		}
	})

	const form = superForm(data, {
		validationMethod: 'auto',
		validators: id ? zodClient(omittedUpdateUserSchema) : zodClient(userSchema),
		SPA: true,
		onUpdate: async ({ form: fd }) => {
			if (fd.valid) {
				$upsertMutation.mutate({ id, data: fd.data })
			}
		}
	})

	const { form: formData, enhance, reset } = form

	$effect(() => {
		const res = $upsertQuery.data?.results
		if (res) {
			reset({ data: { ...res, phone: res.phone || undefined } })
		}
	})
</script>

<form method="POST" use:enhance class="flex flex-col">
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
	<Form.Field {form} name="role">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Role</Form.Label>
				<Select.Root type="single" bind:value={$formData.role} name={props.name}>
					<Select.Trigger {...props} class="capitalize">
						{$formData.role ? $formData.role : 'Select role'}
					</Select.Trigger>
					<Select.Content>
						{#each ROLE as r}
							{#if r !== 'production_manager'}
								<Select.Item value={r} label={r} class="capitalize" />
							{/if}
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
		<Form.Field {form} name="confirm_password">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Confirm Password</Form.Label>
					<Input
						disabled={$upsertMutation.isPending}
						{...props}
						bind:value={$formData.confirm_password}
						placeholder="Confirm Password"
						type="password"
					/>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors class="text-xs font-normal" />
		</Form.Field>
	{/if}

	<Form.Button disabled={$upsertMutation.isPending} class="my-2.5 ms-auto">
		<span class="flex flex-row items-center gap-2.5">
			<span>Save</span>
			<SaveIcon size={ICON_SIZE} />
		</span>
	</Form.Button>
</form>
