import axios from "axios";

const API_BASE_URL = "/api";

// Create axios instance with auth headers
export const apiClient = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: false,
});

// Add basic auth to requests
apiClient.interceptors.request.use((config) => {
	const authData = localStorage.getItem("manadia_auth");
	if (authData) {
		try {
			const { username, password } = JSON.parse(authData);
			const credentials = btoa(`${username}:${password}`);
			config.headers.Authorization = `Basic ${credentials}`;
		} catch (err) {
			console.error("Error parsing auth data:", err);
		}
	}
	return config;
});

export interface Location {
	id: number;
	user_id: string;
	latitude: number;
	longitude: number;
	altitude: number | null;
	accuracy: number | null;
	timestamp: string;
	device_id: string | null;
	tracker_id: string | null;
	battery: number | null;
	connection: string | null;
	server_received_at: string;
}

export interface LocationResponse {
	total: number;
	data: Location[];
}

export const getLocations = () => apiClient.get<LocationResponse>("/history");

export const getLocationsByDate = (date: string) =>
	apiClient.get<LocationResponse>(`/history/date?query_date=${date}`);

export const getDeviceHistory = (device: string) =>
	apiClient.get<LocationResponse>(`/history/device/${device}`);
