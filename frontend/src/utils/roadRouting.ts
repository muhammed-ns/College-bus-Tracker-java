import { Stop, BusLocation } from '../types';

export const DEFAULT_CEA_STOPS: Stop[] = [
  { id: 1, routeId: 1, stopName: 'College of Engineering Adoor (Departure Gate)', latitude: 9.1324, longitude: 76.7182, stopOrder: 1 },
  { id: 2, routeId: 1, stopName: 'Manakala Junction', latitude: 9.1352, longitude: 76.7225, stopOrder: 2 },
  { id: 3, routeId: 1, stopName: 'Adoor High School Junction (MC Road)', latitude: 9.1508, longitude: 76.7318, stopOrder: 3 },
  { id: 4, routeId: 1, stopName: 'Adoor KSRTC Central Bus Stand', latitude: 9.1538, longitude: 76.7335, stopOrder: 4 },
  { id: 5, routeId: 1, stopName: 'Adoor Bypass / Nellimoodu (MC Road)', latitude: 9.1385, longitude: 76.7422, stopOrder: 5 },
  { id: 6, routeId: 1, stopName: 'Enathu Junction (MC Road)', latitude: 9.0931, longitude: 76.7628, stopOrder: 6 },
  { id: 7, routeId: 1, stopName: 'Kulakkada Junction (MC Road)', latitude: 9.0512, longitude: 76.7745, stopOrder: 7 },
  { id: 8, routeId: 1, stopName: 'Mylom Junction (MC Road)', latitude: 9.0195, longitude: 76.7790, stopOrder: 8 },
  { id: 9, routeId: 1, stopName: 'Kottarakkara Pulamon Junction (KSRTC)', latitude: 8.9992, longitude: 76.7831, stopOrder: 9 },
  { id: 10, routeId: 1, stopName: 'College of Engineering Adoor (Arrival Terminal)', latitude: 9.1324, longitude: 76.7182, stopOrder: 10 },
];

// High-resolution real-world road geometry along Manakala Road & MC Road (SH-1)
// from College of Engineering Adoor -> Manakala -> Adoor -> Enathu -> Kulakkada -> Mylom -> Kottarakkara
export const PRECOMPUTED_ROAD_PATH: [number, number][] = [[9.1327, 76.71822], [9.13261, 76.71771], [9.13305, 76.71828], [9.13371, 76.71927], [9.13412, 76.72005], [9.13491, 76.72156], [9.13518, 76.72257], [9.13591, 76.72341], [9.13546, 76.72434], [9.13535, 76.72446], [9.13565, 76.72621], [9.13597, 76.72778], [9.13631, 76.72851], [9.13669, 76.7288], [9.13823, 76.72945], [9.1394, 76.73007], [9.13981, 76.73056], [9.14042, 76.73119], [9.14108, 76.73155], [9.14203, 76.73177], [9.14269, 76.73169], [9.1435, 76.73187], [9.14481, 76.73275], [9.14574, 76.7323], [9.14596, 76.73217], [9.14616, 76.73202], [9.14632, 76.7319], [9.14667, 76.73157], [9.14757, 76.73077], [9.14851, 76.73021], [9.14932, 76.72974], [9.1495, 76.73052], [9.14986, 76.73108], [9.15032, 76.73146], [9.15068, 76.7319], [9.15108, 76.73196], [9.15134, 76.73192], [9.15164, 76.7318], [9.15203, 76.73142], [9.15361, 76.73167], [9.15413, 76.73292], [9.15366, 76.73337], [9.15353, 76.7336], [9.15349, 76.73382], [9.15343, 76.7344], [9.1533, 76.73489], [9.15318, 76.73515], [9.15303, 76.73563], [9.15286, 76.73624], [9.15276, 76.73621], [9.15257, 76.73583], [9.15203, 76.7354], [9.151, 76.73484], [9.15041, 76.7341], [9.14997, 76.73378], [9.14902, 76.73341], [9.14833, 76.73307], [9.14668, 76.7322], [9.14644, 76.7322], [9.14616, 76.7322], [9.14584, 76.73227], [9.14506, 76.73265], [9.14463, 76.73282], [9.14303, 76.73341], [9.14286, 76.73346], [9.14233, 76.73364], [9.14153, 76.73425], [9.14079, 76.73439], [9.14072, 76.73521], [9.14084, 76.73757], [9.14062, 76.73847], [9.14033, 76.73992], [9.14003, 76.74094], [9.13831, 76.74305], [9.13755, 76.74445], [9.13736, 76.74408], [9.13718, 76.74335], [9.13692, 76.74249], [9.13633, 76.74207], [9.13569, 76.74175], [9.13549, 76.74118], [9.13543, 76.74069], [9.13487, 76.73992], [9.1345, 76.73909], [9.13441, 76.73878], [9.13377, 76.73777], [9.13275, 76.7368], [9.13194, 76.73745], [9.13127, 76.73869], [9.13058, 76.73962], [9.12971, 76.74005], [9.12885, 76.74027], [9.1283, 76.7404], [9.1275, 76.74037], [9.12661, 76.74026], [9.12572, 76.74026], [9.12496, 76.74046], [9.12428, 76.74085], [9.12373, 76.7416], [9.12337, 76.74205], [9.12267, 76.74264], [9.122, 76.74316], [9.12142, 76.74335], [9.12069, 76.74343], [9.11924, 76.74402], [9.11819, 76.74437], [9.11626, 76.74488], [9.11536, 76.74514], [9.1143, 76.74525], [9.11358, 76.74539], [9.11298, 76.74553], [9.11179, 76.74595], [9.11066, 76.74662], [9.10984, 76.74698], [9.10849, 76.74731], [9.10722, 76.74758], [9.10602, 76.74774], [9.10516, 76.74812], [9.10462, 76.74863], [9.10387, 76.7493], [9.10313, 76.7496], [9.10242, 76.75002], [9.10148, 76.75031], [9.10003, 76.75111], [9.09888, 76.75169], [9.09761, 76.75219], [9.09666, 76.75241], [9.09669, 76.75314], [9.0968, 76.75399], [9.0969, 76.7546], [9.09695, 76.75515], [9.09699, 76.75573], [9.09708, 76.75617], [9.09699, 76.75651], [9.09677, 76.75665], [9.09657, 76.75683], [9.09634, 76.75689], [9.09598, 76.75686], [9.09613, 76.75733], [9.09641, 76.7581], [9.09705, 76.75831], [9.09822, 76.75849], [9.0995, 76.75911], [9.09929, 76.75982], [9.09871, 76.75981], [9.09813, 76.76133], [9.09807, 76.76213], [9.09755, 76.7632], [9.09673, 76.76336], [9.09508, 76.76294], [9.09312, 76.76236], [9.09028, 76.76134], [9.08878, 76.7613], [9.08951, 76.76037], [9.08987, 76.75978], [9.0903, 76.75849], [9.09044, 76.75766], [9.09079, 76.75724], [9.09079, 76.75614], [9.09054, 76.75552], [9.09084, 76.75458], [9.0905, 76.75395], [9.08967, 76.75419], [9.08902, 76.75432], [9.08799, 76.75452], [9.08693, 76.75463], [9.08628, 76.75457], [9.08553, 76.75436], [9.0838, 76.75391], [9.08296, 76.75352], [9.08171, 76.75272], [9.08146, 76.75267], [9.08011, 76.75292], [9.07934, 76.75292], [9.07807, 76.75287], [9.07724, 76.75291], [9.07592, 76.75301], [9.07501, 76.75302], [9.07386, 76.75291], [9.07297, 76.75284], [9.0723, 76.7531], [9.07148, 76.75364], [9.07089, 76.75374], [9.06975, 76.7538], [9.0688, 76.7541], [9.06758, 76.75488], [9.06687, 76.75552], [9.06543, 76.75683], [9.06478, 76.75743], [9.06437, 76.75809], [9.06408, 76.75856], [9.06334, 76.75917], [9.06272, 76.76054], [9.06217, 76.76234], [9.0618, 76.763], [9.0608, 76.76346], [9.06025, 76.76379], [9.05991, 76.76424], [9.05944, 76.76563], [9.05919, 76.76632], [9.058, 76.76775], [9.05696, 76.76884], [9.05645, 76.76921], [9.05566, 76.76938], [9.05486, 76.76945], [9.05386, 76.76985], [9.05256, 76.77023], [9.05188, 76.77055], [9.05023, 76.77155], [9.04947, 76.77201], [9.04882, 76.77228], [9.04778, 76.77251], [9.04744, 76.77264], [9.04725, 76.7737], [9.0474, 76.77444], [9.04764, 76.77469], [9.04788, 76.77473], [9.04858, 76.77483], [9.04939, 76.77483], [9.05009, 76.7749], [9.0504, 76.77491], [9.05054, 76.77435], [9.05128, 76.77421], [9.05185, 76.77444], [9.05107, 76.77415], [9.05047, 76.77464], [9.05035, 76.77494], [9.04988, 76.77488], [9.04907, 76.7749], [9.04834, 76.77481], [9.04778, 76.77472], [9.04755, 76.77467], [9.04736, 76.77416], [9.04692, 76.77306], [9.04615, 76.77359], [9.04524, 76.77376], [9.04345, 76.77359], [9.04239, 76.77372], [9.04101, 76.77406], [9.04017, 76.77475], [9.03913, 76.7755], [9.03867, 76.77555], [9.03816, 76.77551], [9.03723, 76.77571], [9.03622, 76.77627], [9.03505, 76.77663], [9.03382, 76.77693], [9.03308, 76.77748], [9.0329, 76.7777], [9.03259, 76.77857], [9.03236, 76.78019], [9.03189, 76.78127], [9.03088, 76.78202], [9.02949, 76.78289], [9.02888, 76.78363], [9.02856, 76.78388], [9.02788, 76.78398], [9.02683, 76.78405], [9.02554, 76.78449], [9.02448, 76.78463], [9.02367, 76.78459], [9.02325, 76.78436], [9.0219, 76.78417], [9.0214, 76.78425], [9.0208, 76.78428], [9.02037, 76.78429], [9.01988, 76.78423], [9.01945, 76.78419], [9.0191, 76.7841], [9.01886, 76.78399], [9.01833, 76.78343], [9.01858, 76.78241], [9.01836, 76.78189], [9.01872, 76.78115], [9.0191, 76.78072], [9.01936, 76.77988], [9.01959, 76.77922], [9.01982, 76.77903], [9.02029, 76.77907], [9.02044, 76.77902], [9.02129, 76.77862], [9.02262, 76.77847], [9.02376, 76.77843], [9.02409, 76.77863], [9.02415, 76.77909], [9.0239, 76.77939], [9.02425, 76.77997], [9.02456, 76.78035], [9.02584, 76.78111], [9.02649, 76.78155], [9.02685, 76.78286], [9.02685, 76.78398], [9.02642, 76.78419], [9.02479, 76.78475], [9.02366, 76.78511], [9.02327, 76.78513], [9.02262, 76.78487], [9.02098, 76.78476], [9.01834, 76.78432], [9.01766, 76.78424], [9.0166, 76.78474], [9.01551, 76.78502], [9.01448, 76.78491], [9.01229, 76.78456], [9.01178, 76.78448], [9.01138, 76.78439], [9.01106, 76.78428], [9.01063, 76.78405], [9.01026, 76.78395], [9.0099, 76.78399], [9.00954, 76.78412], [9.00909, 76.7842], [9.00858, 76.78417], [9.00812, 76.78402], [9.00768, 76.78375], [9.00735, 76.78349], [9.00704, 76.78336], [9.00678, 76.78329], [9.00638, 76.78325], [9.00604, 76.78324], [9.00573, 76.78323], [9.00559, 76.78323], [9.00537, 76.78327], [9.00525, 76.78331], [9.00506, 76.78339], [9.00487, 76.78345], [9.00465, 76.78344], [9.00398, 76.78316], [9.00374, 76.78299], [9.00335, 76.78252], [9.00308, 76.78219], [9.00284, 76.78205], [9.00235, 76.78193], [9.00193, 76.78183], [9.00144, 76.78172], [9.00107, 76.7817], [9.00022, 76.7818], [8.99932, 76.78217], [8.99843, 76.78253], [8.99774, 76.78275], [8.99751, 76.78284], [8.99717, 76.7831], [8.99774, 76.78349], [8.99804, 76.78319], [8.99859, 76.78332], [8.99878, 76.78329]];

// Haversine distance in kilometers between two [lat, lng] coordinates
export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Fetch road-following geometry from OSRM for any sequence of stops
export async function fetchRoadRouteGeometry(stops: Stop[]): Promise<[number, number][]> {
  if (!stops || stops.length < 2) {
    return PRECOMPUTED_ROAD_PATH;
  }

  const sorted = [...stops].sort((a, b) => a.stopOrder - b.stopOrder);

  // If last stop loops back to exact start terminal (CEA Adoor), route along the primary corridor stops
  // so the road polyline follows the main highway corridor without an unlabelled return detour.
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const isLoopReturn =
    sorted.length > 2 &&
    haversineKm(first.latitude, first.longitude, last.latitude, last.longitude) < 0.25;

  const corridorStops = isLoopReturn ? sorted.slice(0, sorted.length - 1) : sorted;

  // Check if stops match default CEA-Adoor-Kottarakkara stops; if so, use instant precomputed OSRM road path
  const isDefaultCorridor =
    corridorStops.length === 9 &&
    Math.abs(corridorStops[0].latitude - 9.1324) < 0.002 &&
    Math.abs(corridorStops[corridorStops.length - 1].latitude - 8.9992) < 0.002;

  if (isDefaultCorridor) {
    return PRECOMPUTED_ROAD_PATH;
  }

  try {
    const coordString = corridorStops
      .map((s) => `${s.longitude},${s.latitude}`)
      .join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`;
    const response = await fetch(url);
    if (!response.ok) {
      return PRECOMPUTED_ROAD_PATH;
    }
    const data = await response.json();
    const coordinates = data?.routes?.[0]?.geometry?.coordinates;
    if (Array.isArray(coordinates) && coordinates.length > 2) {
      return coordinates.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]);
    }
  } catch {
    // Fallback to precomputed road path if offline or rate-limited
  }

  return PRECOMPUTED_ROAD_PATH;
}

export interface NavigationTelemetry {
  currentStop: Stop;
  nextStop: Stop;
  followingStops: Stop[];
  distanceToNextStopKm: number;
  etaMinutes: number;
  progressPercent: number;
  highwayName: string;
  traveledPath: [number, number][];
  upcomingPath: [number, number][];
  closestRoadPoint: [number, number];
}

export function computeNavigationState(
  busLocation: BusLocation | undefined,
  stops: Stop[],
  roadPath: [number, number][]
): NavigationTelemetry {
  const sortedStops = [...(stops?.length ? stops : DEFAULT_CEA_STOPS)].sort(
    (a, b) => a.stopOrder - b.stopOrder
  );
  const path = roadPath?.length > 1 ? roadPath : PRECOMPUTED_ROAD_PATH;

  // Map each corridor stop (excluding duplicate return terminal at end) to its closest index on roadPath
  const first = sortedStops[0];
  const last = sortedStops[sortedStops.length - 1];
  const isLoopReturn =
    sortedStops.length > 2 &&
    haversineKm(first.latitude, first.longitude, last.latitude, last.longitude) < 0.25;
  const corridorStops = isLoopReturn ? sortedStops.slice(0, sortedStops.length - 1) : sortedStops;

  const stopRoadIndices: number[] = corridorStops.map((stop) => {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < path.length; i++) {
      const d = haversineKm(stop.latitude, stop.longitude, path[i][0], path[i][1]);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    return bestIdx;
  });

  // If bus location is not available yet, show ready state at Stop 1 -> Next Stop: Stop 2 / Adoor
  if (!busLocation || busLocation.latitude == null || busLocation.longitude == null) {
    const startStop = sortedStops[0];
    const nextStop = sortedStops[1] || sortedStops[0];
    const distKm = haversineKm(
      startStop.latitude,
      startStop.longitude,
      nextStop.latitude,
      nextStop.longitude
    );
    return {
      currentStop: startStop,
      nextStop,
      followingStops: sortedStops.slice(2),
      distanceToNextStopKm: Math.max(0.7, distKm * 1.25),
      etaMinutes: Math.max(1, Math.round((distKm * 1.25 / 32) * 60)),
      progressPercent: 0,
      highwayName: 'CEA – Manakala – Adoor Rd',
      traveledPath: [path[0]],
      upcomingPath: path,
      closestRoadPoint: path[0],
    };
  }

  // Find closest index on roadPath to current busLocation
  let busRoadIdx = 0;
  let minBusDist = Infinity;
  for (let i = 0; i < path.length; i++) {
    const d = haversineKm(busLocation.latitude, busLocation.longitude, path[i][0], path[i][1]);
    if (d < minBusDist) {
      minBusDist = d;
      busRoadIdx = i;
    }
  }

  // Determine which stop the bus has passed and which stop is next along the road
  let currentStopPos = 0;
  for (let s = 0; s < stopRoadIndices.length; s++) {
    if (busRoadIdx >= stopRoadIndices[s] - 2) {
      currentStopPos = s;
    }
  }

  const nextStopPos =
    currentStopPos + 1 < sortedStops.length ? currentStopPos + 1 : 0;
  const currentStop = sortedStops[currentStopPos];
  const nextStop = sortedStops[nextStopPos];

  // Calculate cumulative road distance from busRoadIdx to nextStop's road index
  let distanceToNextStopKm = 0;
  if (nextStopPos < stopRoadIndices.length) {
    const targetIdx = stopRoadIndices[nextStopPos];
    for (let i = busRoadIdx; i < targetIdx; i++) {
      distanceToNextStopKm += haversineKm(
        path[i][0],
        path[i][1],
        path[i + 1][0],
        path[i + 1][1]
      );
    }
  } else {
    // Returning to Arrival Terminal (CEA Adoor)
    distanceToNextStopKm = haversineKm(
      busLocation.latitude,
      busLocation.longitude,
      nextStop.latitude,
      nextStop.longitude
    ) * 1.2;
  }

  const effectiveSpeedKmh =
    busLocation.speed && busLocation.speed > 5 ? busLocation.speed : 35;
  const etaMinutes = Math.max(1, Math.round((distanceToNextStopKm / effectiveSpeedKmh) * 60));
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((busRoadIdx / Math.max(1, path.length - 1)) * 100))
  );

  const highwayName =
    currentStopPos < 2
      ? 'Manakala – Adoor Link Rd'
      : 'MC Road / SH-1 (Adoor – Kottarakkara)';

  const traveledPath = path.slice(0, busRoadIdx + 1);
  const upcomingPath = path.slice(busRoadIdx);

  return {
    currentStop,
    nextStop,
    followingStops: sortedStops.slice(nextStopPos + 1),
    distanceToNextStopKm,
    etaMinutes,
    progressPercent,
    highwayName,
    traveledPath,
    upcomingPath,
    closestRoadPoint: path[busRoadIdx],
  };
}
