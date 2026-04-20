export interface HomeAssistant {
	states?: Record<string, { state: string }>;
	themes?: {
		theme: string | null;
		darkMode: boolean;
		themes: Record<string, Record<string, string>>;
	};
}
