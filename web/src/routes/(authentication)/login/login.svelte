<script lang="ts">
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { createMutation, QueryClient, type FetchQueryOptions } from '@tanstack/svelte-query';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import type { z } from 'zod';
	import { getClient } from '@/client';
	import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/const';
	import { ResponseError } from '@/types';
	import { getLocalUser } from '../../+layout.svelte';
	import { appFetch } from '@/fetch';
	import { loginSchema } from '@root/helpers/validator/auth.validator';

	type LoginFormProps = {
		data: SuperValidated<Infer<typeof loginSchema>>;
	};

	let { data }: LoginFormProps = $props();

	const client = getClient();
	const queryClient = new QueryClient();
	const localUser = getLocalUser();

	const localUserQueryOpts: FetchQueryOptions = {
		queryKey: ['currentUser'],
		queryFn: async () => {
			const response = await $client.auth.current_user.$get(undefined, {
				fetch: appFetch,
				init: { headers: { Authorization: localStorage.getItem(ACCESS_TOKEN) as string } }
			});

			if (response.status !== 200) {
				throw new Error('Failed to fetch user');
			}

			const resData = await response.json();
			if (!resData || !resData.results) {
				throw new Error('User not found');
			}

			localUser.set(resData.results);

			return resData;
		}
	};

	const loginMutation = createMutation({
		mutationKey: ['currentUser'],
		mutationFn: async (data: z.infer<typeof loginSchema>) => {
			const response = await $client.auth.login.$post({
				form: { username: data.username, password: data.password }
			});

            console.log(response)
            
			const resData = await response.json();

			if (response.status !== 200)
				throw new ResponseError(
					response.status,
					null,
					resData.message ? resData.message : 'Login failed'
				);
			if (!resData.results)
				throw new ResponseError(
					response.status,
					resData.results,
					resData.message ? resData.message : 'Login failed'
				);

			return resData.results;
		},

		onSuccess: async (res) => {
			localStorage.setItem(ACCESS_TOKEN, res.access_token);
			localStorage.setItem(REFRESH_TOKEN, res.refresh_token);

			toast.success('Login success');
			await queryClient.fetchQuery(localUserQueryOpts);

			//if ($localUser?.role && $localUser.role === 'admin') {
			// goto('/dashboard/management/user?page=1');
			//} else {
			goto('/management/users');
			// }
		},

		onError: (error) => {
			console.error(error);
			if (error instanceof ResponseError) {
				toast.error(error.message);
				if (error.status === 400)
					rest.errors.set({
						username: ['Username is not valid'],
						password: ['Password is not valid']
					});
				return;
			}

			toast.error('Something went wrong');
		}
	});

	const form = superForm(data, {
		validationMethod: 'auto',
		validators: zodClient(loginSchema),
		SPA: true,
		onUpdate: async ({ form: fd }) => {
			if (fd.valid) {
				$loginMutation.mutate(fd.data);
			}
		}
	});

	const { form: formData, enhance, ...rest } = form;
</script>

<form method="POST" use:enhance>
	<Form.Field {form} name="username">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Username</Form.Label>
				<Input
					disabled={$loginMutation.isPending}
					{...props}
					bind:value={$formData.username}
					placeholder="Input your username"
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors class="text-xs font-normal" />
	</Form.Field>
	<Form.Field {form} name="password">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Password</Form.Label>
				<Input
					disabled={$loginMutation.isPending}
					type="password"
					{...props}
					bind:value={$formData.password}
					placeholder="********"
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors class="text-xs font-normal" />
	</Form.Field>
	<Form.Button disabled={$loginMutation.isPending} class="my-2.5 w-full">
		<span>Login</span>
	</Form.Button>
</form>
