// File ini berfungsi sebagai titik masuk konfigurasi untuk lingkungan pengujian Vitest.

// Mengimpor '@testing-library/jest-dom/vitest' akan memperluas objek `expect`
// dari Vitest dengan matchers yang lebih deskriptif dan berorientasi DOM.
// Ini memungkinkan kita untuk menulis asserstion yang lebih mudah dibaca dan lebih kuat
// untuk komponen UI, seperti `expect(element).toBeInTheDocument()`.
import '@testing-library/jest-dom/vitest';