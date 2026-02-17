import { BrowserRouter, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Sidebar } from "./components/layout/Sidebar";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";
import { ErrorFallback } from "./components/shared/ErrorFallback";
import { LocaleProvider } from "./hooks/useLocale";
import { WorkspaceProvider } from "./hooks/useWorkspace";
import { ContentTypeEditPage } from "./pages/ContentTypeEditPage";
import { ContentTypePage } from "./pages/ContentTypePage";
import { EditorPage } from "./pages/EditorPage";
import { GlobalSettingsPage } from "./pages/GlobalSettingsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { WelcomePage } from "./pages/WelcomePage";
import "./App.css";
import "./styles/global.css";

function AppLayout() {
	const location = useLocation();
	return (
		<div className="app-layout">
			<Sidebar />
			<main className="app-main">
				<ErrorBoundary
					resetKey={location.pathname}
					fallback={(error, reset) => <ErrorFallback error={error} onReset={reset} />}
				>
					<Outlet />
				</ErrorBoundary>
			</main>
		</div>
	);
}

function App() {
	return (
		<BrowserRouter>
			<LocaleProvider>
				<WorkspaceProvider>
					<Routes>
						<Route element={<AppLayout />}>
							<Route index element={<WelcomePage />} />
							<Route path="content/:contentTypeId" element={<ContentTypePage />} />
							<Route path="content/:contentTypeId/:filename" element={<EditorPage />} />
							<Route path="settings" element={<SettingsPage />} />
							<Route path="settings/content-types/new" element={<ContentTypeEditPage />} />
							<Route
								path="settings/content-types/:contentTypeId"
								element={<ContentTypeEditPage />}
							/>
							<Route path="global-settings" element={<GlobalSettingsPage />} />
						</Route>
					</Routes>
				</WorkspaceProvider>
			</LocaleProvider>
		</BrowserRouter>
	);
}

export default App;
