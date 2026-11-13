import { repos } from '@/database';
import type { BookingInput } from '@/database/repositories/bookings';
import { track } from '@/services/analytics';
import { notifyDataChanged } from '@/store/session';
import type { Id } from '@/types/models';

export async function createBooking(tripId: Id, input: BookingInput) {
  const booking = await repos().bookings.create(tripId, input);
  notifyDataChanged();
  // Only the type is sent: never the provider, reference, dates or price.
  track('booking_added', { booking_type: booking.type });
  return booking;
}

export async function updateBooking(id: Id, input: BookingInput) {
  const booking = await repos().bookings.update(id, input);
  notifyDataChanged();
  return booking;
}

export async function deleteBooking(id: Id) {
  await repos().bookings.remove(id);
  notifyDataChanged();
}
