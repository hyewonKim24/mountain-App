export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function calcDrive(homeLat: number, homeLng: number, lat: number, lng: number) {
  const straight = haversineKm(homeLat, homeLng, lat, lng)
  const road = straight * 1.35
  const totalHours = road / 80
  const h = Math.floor(totalHours)
  const m = Math.round((totalHours - h) * 60)
  const timeStr = h > 0
    ? (m > 0 ? `${h}시간 ${m}분` : `${h}시간`)
    : `${m}분`
  return { km: Math.round(road), timeStr }
}
