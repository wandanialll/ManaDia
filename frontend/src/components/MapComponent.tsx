import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Location } from "../api/client";
import L from "leaflet";
import "./MapComponent.css";

// Fix Leaflet marker images
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
	iconUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
	shadowUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface MapComponentProps {
	locations: Location[];
}

export default function MapComponent({ locations }: MapComponentProps) {
	if (locations.length === 0) {
		return <div className="map-empty">No locations to display</div>;
	}

	const center =
		locations.length > 0
			? ([
					locations[locations.length - 1].latitude,
					locations[locations.length - 1].longitude,
				] as [number, number])
			: ([0, 0] as [number, number]);

	return (
		<MapContainer center={center} zoom={13} className="map-container">
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
			{locations.map((location, idx) => (
				<Marker key={idx} position={[location.latitude, location.longitude]}>
					<Popup>
						<div className="popup-content">
							<p>
								<strong>User:</strong> {location.user}
							</p>
							<p>
								<strong>Device:</strong> {location.device || "Unknown"}
							</p>
							<p>
								<strong>Time:</strong>{" "}
								{new Date(location.timestamp).toLocaleString()}
							</p>
							<p>
								<strong>Accuracy:</strong>{" "}
								{location.accuracy ? location.accuracy.toFixed(1) + "m" : "N/A"}
							</p>
						</div>
					</Popup>
				</Marker>
			))}
		</MapContainer>
	);
}
