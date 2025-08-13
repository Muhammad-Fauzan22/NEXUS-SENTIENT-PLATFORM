<script lang="ts">
	let { formData } = $props<{ formData: any }>();
	
	// Inisialisasi data personal jika belum ada
	formData.personal ??= {};
</script>

<div>
	<h3 class="text-xl font-semibold mb-6">Langkah 1: Informasi Personal</h3>
	
	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<div>
			<label class="block mb-2 text-sm font-medium text-foreground/80">
				Nama Lengkap
			</label>
			<input 
				type="text"
				bind:value={formData.personal.fullName}
				class="bg-secondary/50 border border-secondary/80 text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
				placeholder="Masukkan nama lengkap Anda"
			/>
		</div>
		
		<div>
			<label class="block mb-2 text-sm font-medium text-foreground/80">
				Email Pribadi
			</label>
			<input 
				type="email"
				bind:value={formData.personal.email}
				class="bg-secondary/50 border border-secondary/80 text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
				placeholder="Masukkan email Anda"
			/>
		</div>
		
		<div>
			<label class="block mb-2 text-sm font-medium text-foreground/80">
				Nomor Whatsapp
			</label>
			<input 
				type="tel"
				bind:value={formData.personal.whatsapp}
				class="bg-secondary/50 border border-secondary/80 text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
				placeholder="Masukkan nomor WhatsApp"
			/>
		</div>
		
		<div>
			<label class="block mb-2 text-sm font-medium text-foreground/80">
				Asal Daerah
			</label>
			<input 
				type="text"
				bind:value={formData.personal.origin}
				class="bg-secondary/50 border border-secondary/80 text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
				placeholder="Masukkan daerah asal Anda"
			/>
		</div>
	</div>
</div>