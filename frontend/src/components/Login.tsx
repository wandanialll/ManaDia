import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Field, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";

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
		<div className="min-h-screen flex items-center justify-center p-4">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle>login to your account</CardTitle>
					<CardDescription>location tracking dashboard</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit}>
						<div className="flex flex-col gap-5">
							<div className="grid gap-2">
								<Field>
									<FieldLabel>username</FieldLabel>
									<Input
										value={username}
										onChange={(e) => setUsername(e.target.value)}
										type="text"
										placeholder="enter your username"
									/>
								</Field>
							</div>

							<div className="grid gap-2">
								<Field>
									<FieldLabel>password</FieldLabel>
									<Input
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										type="password"
										placeholder="enter your password"
									/>
								</Field>
							</div>

							<div>
								{error && <div className="error-message">{error}</div>}

								<Button type="submit" disabled={loading} className="w-full">
									{loading ? "Logging in..." : "Login"}
								</Button>
							</div>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
