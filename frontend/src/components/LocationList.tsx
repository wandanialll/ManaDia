import { Location } from "../api/client";
import "./LocationList.css";
import { Card, CardContent } from "./ui/card";

interface LocationListProps {
	locations: Location[];
}

export default function LocationList({ locations }: LocationListProps) {
	return (
		<div className="location-list">
			<h3>Recent Locations ({locations.length})</h3>
			<div className="list-items">
				{locations.length === 0 ? (
					<p className="empty">No locations match your filters</p>
				) : (
					locations.slice(0, 20).map((loc, idx) => (
						// <div key={idx} className="list-item">
						// 	<div className="list-item-header">
						// 		<strong>{loc.user_id}</strong>
						// 		<span className="device-badge">
						// 			{loc.device_id || "Unknown"}
						// 		</span>
						// 	</div>
						// 	<div className="list-item-coords">
						// 		{loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
						// 	</div>
						// 	<div className="list-item-time">
						// 		{new Date(loc.timestamp).toLocaleString()}
						// 	</div>
						// </div>
						<Card key={idx} className="m-3">
							{/* <CardHeader>
								<CardTitle>{loc.user_id}</CardTitle>
							</CardHeader> */}
							<CardContent className="flex flex-col">
								<div>
									<strong>{loc.user_id}</strong>
								</div>
								<div>
									{loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
								</div>
								<div className="text-gray-500 text-xs">
									{new Date(loc.timestamp).toLocaleString()}
								</div>
							</CardContent>
							{/* <CardFooter>
								{new Date(loc.timestamp).toLocaleString()}
							</CardFooter> */}
						</Card>
					))
				)}
			</div>
		</div>
	);
}
