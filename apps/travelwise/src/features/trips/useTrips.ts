import { repos } from '@/database';
import { useAsync } from '@/hooks/useAsync';
import { clock } from '@/utils/clock';

import { bucketTrips } from './status';

/** All trips with routes, summaries and dashboard buckets, reloaded after every write. */
export function useTripsOverview() {
  const result = useAsync(async () => {
    const r = repos();
    const [trips, routes, summaries] = await Promise.all([r.trips.list(), r.trips.routes(), r.trips.summaries()]);
    const today = clock.today();
    return { trips, routes, summaries, today, buckets: bucketTrips(trips, today) };
  }, []);
  return result;
}

export function useTrip(id: string | undefined) {
  return useAsync(async () => {
    if (!id) return null;
    const r = repos();
    const [trip, summaries] = await Promise.all([r.trips.get(id), r.trips.summaries([id])]);
    return trip ? { trip, summary: summaries.get(id) ?? null, today: clock.today() } : null;
  }, [id]);
}
