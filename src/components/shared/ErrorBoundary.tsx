import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
	fallback: (error: Error, reset: () => void) => ReactNode;
	children: ReactNode;
	resetKey?: string;
}

interface State {
	error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { error };
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		console.error("ErrorBoundary caught:", error, info);
	}

	componentDidUpdate(prevProps: Props) {
		if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
			this.setState({ error: null });
		}
	}

	reset = () => {
		this.setState({ error: null });
	};

	render() {
		if (this.state.error) {
			return this.props.fallback(this.state.error, this.reset);
		}
		return this.props.children;
	}
}
