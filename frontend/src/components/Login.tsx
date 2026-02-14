import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function Login() {
	const [username, setUsername] = useState("admin");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const { login } = useAuth();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const success = await login(username, password);
			if (!success) {
				setError("Invalid credentials");
			}
		} catch (err) {
			setError("Login failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="login-container">
			<div className="login-box">
				<h1>Manadia Dashboard</h1>
				<p className="login-subtitle">Location Tracking Dashboard</p>

				<form onSubmit={handleSubmit}>
					<div className="form-group">
						<label htmlFor="username">Username</label>
						<input
							type="text"
							id="username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							placeholder="admin"
							autoComplete="username"
						/>
					</div>

					<div className="form-group">
						<label htmlFor="password">Password</label>
						<input
							type="password"
							id="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Enter password"
							autoComplete="current-password"
						/>
					</div>

					{error && <div className="error-message">{error}</div>}

					<button type="submit" disabled={loading} className="login-btn">
						{loading ? "Logging in..." : "Login"}
					</button>
				</form>
			</div>
		</div>
	);
}
