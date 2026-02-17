import { createContext, type ReactNode, useCallback, useContext, useReducer } from "react";
import { writeConfig } from "../commands/config";
import { openWorkspace, registerWorkspace } from "../commands/workspace";
import type { WorkspaceConfig } from "../types/workspace";

interface WorkspaceState {
	path: string | null;
	config: WorkspaceConfig | null;
	isLoading: boolean;
	error: string | null;
}

type WorkspaceAction =
	| { type: "SET_LOADING" }
	| { type: "SET_WORKSPACE"; path: string; config: WorkspaceConfig }
	| { type: "UPDATE_CONFIG"; config: WorkspaceConfig }
	| { type: "CLOSE_WORKSPACE" }
	| { type: "SET_ERROR"; error: string };

function reducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
	switch (action.type) {
		case "SET_LOADING":
			return { ...state, isLoading: true, error: null };
		case "SET_WORKSPACE":
			return {
				path: action.path,
				config: action.config,
				isLoading: false,
				error: null,
			};
		case "UPDATE_CONFIG":
			return { ...state, config: action.config };
		case "CLOSE_WORKSPACE":
			return { path: null, config: null, isLoading: false, error: null };
		case "SET_ERROR":
			return { ...state, isLoading: false, error: action.error };
	}
}

interface WorkspaceContextValue extends WorkspaceState {
	open: (path: string) => Promise<boolean>;
	close: () => void;
	updateConfig: (config: WorkspaceConfig) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(reducer, {
		path: null,
		config: null,
		isLoading: false,
		error: null,
	});

	const open = useCallback(async (path: string): Promise<boolean> => {
		dispatch({ type: "SET_LOADING" });
		try {
			const config = await openWorkspace(path);
			dispatch({ type: "SET_WORKSPACE", path, config });
			// Register workspace (non-critical, don't block)
			registerWorkspace(path).catch(console.error);
			return true;
		} catch (e) {
			console.error("Failed to open workspace:", e);
			dispatch({ type: "SET_ERROR", error: String(e) });
			return false;
		}
	}, []);

	const close = useCallback(() => {
		dispatch({ type: "CLOSE_WORKSPACE" });
	}, []);

	const updateConfig = useCallback(
		async (config: WorkspaceConfig) => {
			if (!state.path) return;
			try {
				await writeConfig(state.path, config);
				dispatch({ type: "UPDATE_CONFIG", config });
			} catch (e) {
				console.error("Failed to save config:", e);
				dispatch({ type: "SET_ERROR", error: String(e) });
				throw e;
			}
		},
		[state.path],
	);

	return (
		<WorkspaceContext.Provider value={{ ...state, open, close, updateConfig }}>
			{children}
		</WorkspaceContext.Provider>
	);
}

export function useWorkspace() {
	const ctx = useContext(WorkspaceContext);
	if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
	return ctx;
}
