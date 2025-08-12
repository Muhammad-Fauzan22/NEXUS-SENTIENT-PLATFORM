<script lang="ts">
	import { assessmentStore } from '$lib/stores/assessmentStore';
	import type { UserData } from '$lib/types/schemas/assessment';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let userData: UserData = {
		name: '',
		email: '',
		age: 0,
		occupation: ''
	};

	function handleSubmit(): void {
		if (userData.name && userData.email && userData.age > 0 && userData.occupation) {
			assessmentStore.setUserData(userData);
		} else {
			alert('Please fill in all fields before continuing.');
		}
	}
</script>

<Card>
	<h2 class="text-2xl font-bold text-gray-800 mb-2">Welcome to Nexus</h2>
	<p class="text-gray-600 mb-6">
		Let's start by getting to know you a little better. This information will help us personalize
		your development plan.
	</p>

	<form on:submit|preventDefault={handleSubmit} class="space-y-4">
		<Input
			id="name"
			label="Full Name"
			type="text"
			placeholder="e.g., Alex Doe"
			required
			bind:value={userData.name}
		/>
		<Input
			id="email"
			label="Email Address"
			type="email"
			placeholder="e.g., alex.doe@example.com"
			required
			bind:value={userData.email}
		/>
		<Input
			id="age"
			label="Age"
			type="number"
			placeholder="e.g., 30"
			required
			min="1"
			bind:value={userData.age}
		/>
		<Input
			id="occupation"
			label="Current Occupation or Field of Study"
			type="text"
			placeholder="e.g., Software Engineer"
			required
			bind:value={userData.occupation}
		/>
		<div class="pt-4">
			<Button type="submit" variant="primary" class="w-full">
				Continue to RIASEC Assessment
			</Button>
		</div>
	</form>
</Card>