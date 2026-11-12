import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  Appointment,
  AppointmentStatus,
  CreateAppointmentInput,
  UpdateAppointmentInput,
  normalizeAppointmentRecord,
} from '../types/appointment';

const APPOINTMENTS_COLLECTION = 'studio_appointments';

function sanitizeDocId(rawId: string): string {
  const cleaned = String(rawId || '')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .slice(0, 120);
  return cleaned.length >= 2 ? cleaned : `RC-${Math.floor(100000 + Math.random() * 900000)}`;
}

/**
 * Prepares the strictly validated Firestore document payload matching firestore.rules (`isValidAppointment`).
 */
function buildFirestoreAppointmentPayload(appointment: Appointment) {
  return {
    id: sanitizeDocId(appointment.id),
    date: String(appointment.date || '').slice(0, 10),
    startTime: String(appointment.startTime || '').slice(0, 5),
    serviceMinutes: Math.min(360, Math.max(10, Number(appointment.serviceMinutes) || 45)),
    bufferMinutes: Math.min(60, Math.max(0, Number(appointment.bufferMinutes) || 10)),
    clientName: String(appointment.clientName || 'Cliente').trim().slice(0, 80),
    whatsapp: String(appointment.whatsapp || '').trim().slice(0, 32),
    serviceNames: (appointment.serviceNames || ['Corte de Autor / Clásico'])
      .slice(0, 6)
      .map((s) => String(s).slice(0, 120)),
    paymentOption: ['deposit', 'full', 'studio', 'commitment'].includes(appointment.paymentOption)
      ? appointment.paymentOption
      : 'deposit',
    status: ['pending', 'confirmed', 'completed', 'cancelled'].includes(appointment.status)
      ? appointment.status
      : 'confirmed',
    ...(appointment.reviewLoopScheduledAt
      ? { reviewLoopScheduledAt: String(appointment.reviewLoopScheduledAt).slice(0, 32) }
      : {}),
  };
}

/**
 * CREATE: Adds a new appointment document to Firestore (`studio_appointments/{id}`).
 */
export async function addAppointmentToDb(input: CreateAppointmentInput): Promise<Appointment> {
  const docId = sanitizeDocId(
    input.id || `RC-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const normalized = normalizeAppointmentRecord({ ...input, id: docId });

  if (!db) {
    return normalized;
  }

  const path = `${APPOINTMENTS_COLLECTION}/${docId}`;
  const payload = buildFirestoreAppointmentPayload(normalized);

  try {
    await setDoc(doc(db, APPOINTMENTS_COLLECTION, docId), payload);
    return normalized;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * READ (Single): Fetches a single appointment by ID from Firestore.
 */
export async function getAppointmentByIdFromDb(appointmentId: string): Promise<Appointment | null> {
  if (!db) return null;
  const docId = sanitizeDocId(appointmentId);
  const path = `${APPOINTMENTS_COLLECTION}/${docId}`;
  try {
    const snap = await getDoc(doc(db, APPOINTMENTS_COLLECTION, docId));
    if (!snap.exists()) return null;
    const data = snap.data() as CreateAppointmentInput & { id: string };
    return normalizeAppointmentRecord({ ...data, id: data.id || snap.id });
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * READ (List / Filter): Retrieves all appointments or filters by date/status from Firestore.
 */
export async function getAppointmentsFromDb(filters?: {
  date?: string;
  status?: AppointmentStatus;
}): Promise<Appointment[]> {
  if (!db) return [];
  const path = APPOINTMENTS_COLLECTION;
  try {
    const colRef = collection(db, APPOINTMENTS_COLLECTION);
    let q = query(colRef);
    if (filters?.date && filters?.status) {
      q = query(
        colRef,
        where('date', '==', filters.date),
        where('status', '==', filters.status)
      );
    } else if (filters?.date) {
      q = query(colRef, where('date', '==', filters.date));
    } else if (filters?.status) {
      q = query(colRef, where('status', '==', filters.status));
    }

    const snap = await getDocs(q);
    const results: Appointment[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data() as CreateAppointmentInput & { id: string };
      if (data && data.date && data.startTime) {
        results.push(normalizeAppointmentRecord({ ...data, id: data.id || docSnap.id }));
      }
    });
    return results.sort((a, b) =>
      `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`)
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * UPDATE: Updates an existing appointment document in Firestore.
 */
export async function updateAppointmentInDb(
  appointmentId: string,
  updates: UpdateAppointmentInput,
  fallbackExisting?: Appointment
): Promise<Appointment | null> {
  const docId = sanitizeDocId(appointmentId);
  if (!db) {
    return fallbackExisting
      ? normalizeAppointmentRecord({ ...fallbackExisting, ...updates, id: docId })
      : null;
  }

  const path = `${APPOINTMENTS_COLLECTION}/${docId}`;
  try {
    const existing = fallbackExisting || (await getAppointmentByIdFromDb(docId));
    if (!existing) {
      // If only updating date, startTime, or status on an existing doc
      const partialUpdate: Record<string, unknown> = {};
      if (updates.date) partialUpdate.date = String(updates.date).slice(0, 10);
      if (updates.startTime) partialUpdate.startTime = String(updates.startTime).slice(0, 5);
      if (updates.status) partialUpdate.status = updates.status;
      if (Object.keys(partialUpdate).length > 0) {
        await updateDoc(doc(db, APPOINTMENTS_COLLECTION, docId), partialUpdate);
      }
      return null;
    }

    const merged = normalizeAppointmentRecord({
      ...existing,
      ...updates,
      id: docId,
    });
    const payload = buildFirestoreAppointmentPayload(merged);
    await setDoc(doc(db, APPOINTMENTS_COLLECTION, docId), payload);
    return merged;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * DELETE: Removes an appointment document from Firestore (`studio_appointments/{id}`).
 */
export async function deleteAppointmentFromDb(appointmentId: string): Promise<void> {
  if (!db) return;
  const docId = sanitizeDocId(appointmentId);
  const path = `${APPOINTMENTS_COLLECTION}/${docId}`;
  try {
    await deleteDoc(doc(db, APPOINTMENTS_COLLECTION, docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * REAL-TIME SUBSCRIBE: Listens to live changes on `studio_appointments` in Firestore.
 */
export function subscribeAppointmentsFromDb(
  onUpdate: (appointments: Appointment[]) => void
): Unsubscribe {
  if (!db || typeof window === 'undefined') return () => {};
  const path = APPOINTMENTS_COLLECTION;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Appointment[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as CreateAppointmentInput & { id: string };
        if (data && data.date && data.startTime) {
          items.push(normalizeAppointmentRecord({ ...data, id: data.id || docSnap.id }));
        }
      });
      onUpdate(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch {
        // Logged via handleFirestoreError
      }
    }
  );
}
