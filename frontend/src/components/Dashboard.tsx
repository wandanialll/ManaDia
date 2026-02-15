import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import MapComponent from "./MapComponent";
import LocationList from "./LocationList";
import Controls from "./Controls";
import { getLocations, Location } from "../api/client";
import "./Dashboard.css";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export default function Dashboard() {
	const { username, logout } = useAuth();
	const [locations, setLocations] = useState<Location[]>([]);
	const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedUser, setSelectedUser] = useState<string | null>(null);
	const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

	// Fetch locations on mount and set up polling
	useEffect(() => {
		const fetchLocations = async () => {
			try {
				setLoading(true);
				const response = await getLocations();
				setLocations(response.data.data || []);
				setError(null);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to fetch locations",
				);
			} finally {
				setLoading(false);
			}
		};

		fetchLocations();
		const interval = setInterval(fetchLocations, 10000); // Poll every 10 seconds
		return () => clearInterval(interval);
	}, []);

	// Apply filters
	useEffect(() => {
		let filtered = locations;
		if (selectedUser) {
			filtered = filtered.filter((loc) => loc.user_id === selectedUser);
		}
		if (selectedDevice) {
			filtered = filtered.filter((loc) => loc.device_id === selectedDevice);
		}
		setFilteredLocations(filtered);
	}, [locations, selectedUser, selectedDevice]);

	const uniqueUsers = [...new Set(locations.map((loc) => loc.user_id))];
	const uniqueDevices = [
		...new Set(
			locations.flatMap((loc) => (loc.device_id ? [loc.device_id] : [])),
		),
	];

	if (loading && locations.length === 0) {
		return <div className="dashboard-loading">Loading locations...</div>;
	}

	return (
		<div className="dashboard">
			<div className="dashboard-sidebar">
				<div className="flex justify-between items-center mx-3">
					<h1>Manadia Dashboard</h1>
					<div>
						<Badge variant="outline">{username}</Badge>
						<Button
							variant="outline"
							size="sm"
							onClick={logout}
							className="ml-2"
						>
							Logout
						</Button>
					</div>
				</div>
				<Controls
					users={uniqueUsers}
					devices={uniqueDevices}
					selectedUser={selectedUser}
					selectedDevice={selectedDevice}
					onUserChange={setSelectedUser}
					onDeviceChange={setSelectedDevice}
					onRefresh={() => location.reload()}
				/>
				{error && <div className="error">{error}</div>}
				<LocationList locations={filteredLocations} />
			</div>
			<div className="dashboard-map">
				<MapComponent locations={filteredLocations} />
			</div>
		</div>
	);
}
