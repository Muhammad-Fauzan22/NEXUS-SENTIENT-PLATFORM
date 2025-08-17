<script lang="ts">
	// Terima formData sebagai props (read-only)
	const { formData } = $props<{ formData: any }>();
</script>

<div class="space-y-6">
	<h3 class="text-xl font-semibold mb-6">Langkah 4: Tinjau & Konfirmasi Data</h3>

	<!-- Bagian Data Personal -->
	<div class="bg-secondary/30 p-4 rounded-lg">
		<h4 class="text-lg font-medium mb-3">Informasi Personal</h4>
		<div class="space-y-2">
			<p>
				<span class="font-medium text-foreground/80">Nama Lengkap:</span>
				{formData.personal?.fullName ?? 'N/A'}
			</p>
			<p>
				<span class="font-medium text-foreground/80">Email Pribadi:</span>
				{formData.personal?.email ?? 'N/A'}
			</p>
			<p>
				<span class="font-medium text-foreground/80">Nomor Whatsapp:</span>
				{formData.personal?.whatsapp ?? 'N/A'}
			</p>
			<p>
				<span class="font-medium text-foreground/80">Asal Daerah:</span>
				{formData.personal?.origin ?? 'N/A'}
			</p>
		</div>
	</div>

	<!-- Bagian Data Akademik -->
	<div class="bg-secondary/30 p-4 rounded-lg">
		<h4 class="text-lg font-medium mb-3">Riwayat & Minat Akademik</h4>
		<div class="space-y-2">
			<p>
				<span class="font-medium text-foreground/80">IPK Terakhir:</span>
				{formData.academic?.gpa ?? 'N/A'}
			</p>
			<p>
				<span class="font-medium text-foreground/80">Mata Kuliah Favorit:</span>
				{formData.academic?.favoriteCourses ?? 'N/A'}
			</p>
			<p>
				<span class="font-medium text-foreground/80">Topik Riset/TA yang Diminati:</span>
				{formData.academic?.researchInterest ?? 'N/A'}
			</p>
			<p>
				<span class="font-medium text-foreground/80">Software/Tools yang Dikuasai:</span>
				{formData.academic?.tools ?? 'N/A'}
			</p>
		</div>
	</div>

	<!-- Bagian Data Psikometri -->
	<div class="bg-secondary/30 p-4 rounded-lg">
		<h4 class="text-lg font-medium mb-3">Hasil Asesmen</h4>
		<div class="space-y-2">
			<p>
				<span class="font-medium text-foreground/80">Realistic:</span>
				{formData.psychometric?.realistic ?? 'N/A'}
			</p>
			<p>
				<span class="font-medium text-foreground/80">Investigative:</span>
				{formData.psychometric?.investigative ?? 'N/A'}
			</p>
			<p>
				<span class="font-medium text-foreground/80">Artistic:</span>
				{formData.psychometric?.artistic ?? 'N/A'}
			</p>
			<p>
				<span class="font-medium text-foreground/80">Social:</span>
				{formData.psychometric?.social ?? 'N/A'}
			</p>
			<p>
				<span class="font-medium text-foreground/80">Enterprising:</span>
				{formData.psychometric?.enterprising ?? 'N/A'}
			</p>
			<p>
				<span class="font-medium text-foreground/80">Conventional:</span>
				{formData.psychometric?.conventional ?? 'N/A'}
			</p>
			<p>
				<span class="font-medium text-foreground/80">Autonomy:</span>
				{formData.psychometric?.autonomy ?? 'N/A'}
			</p>
			<p>
				<span class="font-medium text-foreground/80">Personal Growth:</span>
				{formData.psychometric?.personalGrowth ?? 'N/A'}
			</p>
			<p>
				<span class="font-medium text-foreground/80">Purpose in Life:</span>
				{formData.psychometric?.purposeInLife ?? 'N/A'}
			</p>
		</div>
	</div>

	<p class="text-sm text-center text-foreground/70 mt-8">
		Pastikan semua data yang Anda masukkan sudah benar. Setelah menekan tombol 'Submit', data tidak
		dapat diubah kembali.
	</p>
</div>
