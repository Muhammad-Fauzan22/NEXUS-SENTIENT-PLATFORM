import { toast as sonnerToast } from 'svelte-sonner';

type ToastType = 'success' | 'info' | 'warning' | 'error' | 'action' | 'loading';

export const toast = {
	success: (message: string) => sonnerToast.success(message),
	info: (message: string) => sonnerToast.info(message),
	warning: (message: string) => sonnerToast.warning(message),
	error: (message: string) => sonnerToast.error(message),
	action: (message: string, options: { label: string; onClick: () => void }) =>
		sonnerToast(message, {
			action: {
				label: options.label,
				onClick: options.onClick
			}
		}),
	loading: (message: string) => sonnerToast.loading(message),
	dismiss: (id: string | number) => sonnerToast.dismiss(id),
	custom: (component: any, options: any) => sonnerToast(component, options)
};
