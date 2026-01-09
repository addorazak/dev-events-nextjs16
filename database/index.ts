/**
 * Database Models Barrel Export
 * =============================
 * Central export point for all Mongoose models
 * Allows clean imports throughout the application
 */

export { default as Event, type IEvent } from "./event.model";
export { default as Booking, type IBooking } from "./booking.model";

// Usage:
// import { Event, Booking } from '@/database';
