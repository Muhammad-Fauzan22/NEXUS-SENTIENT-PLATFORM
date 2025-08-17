// vitest.config.ts
import { defineConfig } from "file:///C:/Users/fauzan/Documents/Projects/NEXUS-SENTIENT-PLATFORM/node_modules/vitest/dist/config.js";
import { sveltekit } from "file:///C:/Users/fauzan/Documents/Projects/NEXUS-SENTIENT-PLATFORM/node_modules/@sveltejs/kit/src/exports/vite/index.js";
var vitest_config_default = defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"],
    environment: "node",
    globals: true,
    setupFiles: ["./vitest-setup.ts"],
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/coverage/**",
        "**/.svelte-kit/**"
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    },
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: true
      }
    }
  }
});
export {
  vitest_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZXN0LmNvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGZhdXphblxcXFxEb2N1bWVudHNcXFxcUHJvamVjdHNcXFxcTkVYVVMtU0VOVElFTlQtUExBVEZPUk1cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGZhdXphblxcXFxEb2N1bWVudHNcXFxcUHJvamVjdHNcXFxcTkVYVVMtU0VOVElFTlQtUExBVEZPUk1cXFxcdml0ZXN0LmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvZmF1emFuL0RvY3VtZW50cy9Qcm9qZWN0cy9ORVhVUy1TRU5USUVOVC1QTEFURk9STS92aXRlc3QuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZXN0L2NvbmZpZyc7XG5pbXBvcnQgeyBzdmVsdGVraXQgfSBmcm9tICdAc3ZlbHRlanMva2l0L3ZpdGUnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuXHRwbHVnaW5zOiBbc3ZlbHRla2l0KCldLFxuXHR0ZXN0OiB7XG5cdFx0aW5jbHVkZTogWydzcmMvKiovKi57dGVzdCxzcGVjfS57anMsdHN9J10sXG5cdFx0ZW52aXJvbm1lbnQ6ICdub2RlJyxcblx0XHRnbG9iYWxzOiB0cnVlLFxuXHRcdHNldHVwRmlsZXM6IFsnLi92aXRlc3Qtc2V0dXAudHMnXSxcblx0XHRjb3ZlcmFnZToge1xuXHRcdFx0cmVwb3J0ZXI6IFsndGV4dCcsICdqc29uJywgJ2h0bWwnXSxcblx0XHRcdGV4Y2x1ZGU6IFtcblx0XHRcdFx0J25vZGVfbW9kdWxlcy8nLFxuXHRcdFx0XHQnc3JjL3Rlc3QvJyxcblx0XHRcdFx0JyoqLyouZC50cycsXG5cdFx0XHRcdCcqKi8qLmNvbmZpZy4qJyxcblx0XHRcdFx0JyoqL2NvdmVyYWdlLyoqJyxcblx0XHRcdFx0JyoqLy5zdmVsdGUta2l0LyoqJ1xuXHRcdFx0XSxcblx0XHRcdHRocmVzaG9sZHM6IHtcblx0XHRcdFx0Z2xvYmFsOiB7XG5cdFx0XHRcdFx0YnJhbmNoZXM6IDcwLFxuXHRcdFx0XHRcdGZ1bmN0aW9uczogNzAsXG5cdFx0XHRcdFx0bGluZXM6IDcwLFxuXHRcdFx0XHRcdHN0YXRlbWVudHM6IDcwXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXHRcdHBvb2w6ICd0aHJlYWRzJyxcblx0XHRwb29sT3B0aW9uczoge1xuXHRcdFx0dGhyZWFkczoge1xuXHRcdFx0XHRzaW5nbGVUaHJlYWQ6IHRydWVcblx0XHRcdH1cblx0XHR9XG5cdH1cbn0pOyJdLAogICJtYXBwaW5ncyI6ICI7QUFBZ1gsU0FBUyxvQkFBb0I7QUFDN1ksU0FBUyxpQkFBaUI7QUFFMUIsSUFBTyx3QkFBUSxhQUFhO0FBQUEsRUFDM0IsU0FBUyxDQUFDLFVBQVUsQ0FBQztBQUFBLEVBQ3JCLE1BQU07QUFBQSxJQUNMLFNBQVMsQ0FBQyw4QkFBOEI7QUFBQSxJQUN4QyxhQUFhO0FBQUEsSUFDYixTQUFTO0FBQUEsSUFDVCxZQUFZLENBQUMsbUJBQW1CO0FBQUEsSUFDaEMsVUFBVTtBQUFBLE1BQ1QsVUFBVSxDQUFDLFFBQVEsUUFBUSxNQUFNO0FBQUEsTUFDakMsU0FBUztBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Q7QUFBQSxNQUNBLFlBQVk7QUFBQSxRQUNYLFFBQVE7QUFBQSxVQUNQLFVBQVU7QUFBQSxVQUNWLFdBQVc7QUFBQSxVQUNYLE9BQU87QUFBQSxVQUNQLFlBQVk7QUFBQSxRQUNiO0FBQUEsTUFDRDtBQUFBLElBQ0Q7QUFBQSxJQUNBLE1BQU07QUFBQSxJQUNOLGFBQWE7QUFBQSxNQUNaLFNBQVM7QUFBQSxRQUNSLGNBQWM7QUFBQSxNQUNmO0FBQUEsSUFDRDtBQUFBLEVBQ0Q7QUFDRCxDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
