"use client";

import "./Controls.css";
import { Button } from "./ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { Field, FieldLabel } from "./ui/field";

const ALL_USERS = "__all__";
const ALL_DEVICES = "__all__";

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
			<Field>
				<FieldLabel>User Filter</FieldLabel>
				<Select
					value={selectedUser ?? ALL_USERS}
					onValueChange={(value) =>
						onUserChange(value === ALL_USERS ? null : value)
					}
				>
					<SelectTrigger className="w-[200px]">
						<SelectValue placeholder="All Users" />
					</SelectTrigger>

					<SelectContent>
						<SelectItem value={ALL_USERS}>All Users</SelectItem>

						{users.map((user) => (
							<SelectItem key={user} value={user}>
								{user}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</Field>

			<Field>
				<FieldLabel>Device Filter</FieldLabel>
				<Select
					value={selectedDevice ?? ALL_DEVICES}
					onValueChange={(value) =>
						onDeviceChange(value === ALL_DEVICES ? null : value)
					}
				>
					<SelectTrigger className="w-[200px]">
						<SelectValue placeholder="All Devices" />
					</SelectTrigger>

					<SelectContent>
						<SelectItem value={ALL_DEVICES}>All Devices</SelectItem>

						{devices.map((device) => (
							<SelectItem key={device} value={device}>
								{device}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</Field>
			<Button onClick={onRefresh}>Refresh</Button>
		</div>
	);
}
