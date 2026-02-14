import "./Controls.css";

interface ControlsProps {
	users: string[];
	devices: string[];
	selectedUser: string | null;
	selectedDevice: string | null;
	onUserChange: (user: string | null) => void;
	onDeviceChange: (device: string | null) => void;
	onRefresh: () => void;
}

export default function Controls({
	users,
	devices,
	selectedUser,
	selectedDevice,
	onUserChange,
	onDeviceChange,
	onRefresh,
}: ControlsProps) {
	return (
		<div className="controls">
			<div className="control-group">
				<label htmlFor="user-select">Filter by User:</label>
				<select
					id="user-select"
					value={selectedUser || ""}
					onChange={(e) => onUserChange(e.target.value || null)}
				>
					<option value="">All Users</option>
					{users.map((user) => (
						<option key={user} value={user}>
							{user}
						</option>
					))}
				</select>
			</div>

			<div className="control-group">
				<label htmlFor="device-select">Filter by Device:</label>
				<select
					id="device-select"
					value={selectedDevice || ""}
					onChange={(e) => onDeviceChange(e.target.value || null)}
				>
					<option value="">All Devices</option>
					{devices.map((device) => (
						<option key={device} value={device}>
							{device}
						</option>
					))}
				</select>
			</div>

			<button className="refresh-btn" onClick={onRefresh}>
				Refresh Now
			</button>
		</div>
	);
}
