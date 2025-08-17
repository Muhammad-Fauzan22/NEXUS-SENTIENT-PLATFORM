<!-- src/lib/components/assessment/Step1_PersonalInfo.svelte -->
<script lang="ts">
	import type { IStudentProfile } from '$lib/types/profile.ts';

	let { formData = $bindable() } = $props<{ formData: Partial<IStudentProfile> }>();
</script>

<div class="space-y-6">
	<div>
		<label for="fullName" class="block text-sm font-medium text-foreground/80"> Full Name </label>
		<input
			id="fullName"
			type="text"
			bind:value={formData.fullName}
			class="mt-1 block w-full rounded-md border-foreground/30 bg-secondary shadow-sm focus:border-accent focus:ring focus:ring-accent focus:ring-opacity-50"
			placeholder="Enter your full name"
		/>
	</div>

	<div>
		<label for="email" class="block text-sm font-medium text-foreground/80"> Email Address </label>
		<input
			id="email"
			type="email"
			bind:value={formData.email}
			class="mt-1 block w-full rounded-md border-foreground/30 bg-secondary shadow-sm focus:border-accent focus:ring focus:ring-accent focus:ring-opacity-50"
			placeholder="Enter your email address"
		/>
	</div>

	<div>
		<label for="studentId" class="block text-sm font-medium text-foreground/80">
			Student ID (NRP)
		</label>
		<input
			id="studentId"
			type="text"
			bind:value={formData.studentId}
			class="mt-1 block w-full rounded-md border-foreground/30 bg-secondary shadow-sm focus:border-accent focus:ring focus:ring-accent focus:ring-opacity-50"
			placeholder="Enter your Student ID"
		/>
	</div>
</div>
