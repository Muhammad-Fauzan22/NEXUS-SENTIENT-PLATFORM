<!--
  Komponen Card ini berfungsi sebagai "Layout Primitive".
  Tujuannya adalah untuk menyediakan container visual yang konsisten
  di seluruh aplikasi, mengenkapsulasi styling umum seperti bayangan,
  padding, dan sudut membulat.

  Penggunaan `<slot />` memungkinkan komponen ini untuk membungkus
  konten apa pun, menjadikannya sangat dapat digunakan kembali dan
  mematuhi prinsip komposisi.
-->
<div class="bg-white shadow-md rounded-lg p-6 md:p-8">
	<slot />
</div>