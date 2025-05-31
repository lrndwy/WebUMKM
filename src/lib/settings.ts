import { pb } from './pocketbase'; // Assuming pocketbase.ts exports pb instance

interface RajaOngkirDestination {
    id: string;
    name: string;
    type: string;
    province: string;
    city_id: string;
    subdistrict_id: string;
}

interface AppSettingsRecord {
  id?: string; // PocketBase record ID, now optional for creation
  key: string;
  value: string; // JSON string of RajaOngkirDestination
}

const SETTINGS_COLLECTION_NAME = 'app_settings';
const ORIGIN_ADDRESS_KEY = 'origin_address'; // Key for the origin address setting

export async function getOriginAddressSetting(): Promise<RajaOngkirDestination | null> {
  try {
    const records = await pb.collection(SETTINGS_COLLECTION_NAME).getFullList({
      filter: `key = "${ORIGIN_ADDRESS_KEY}"`,
      limit: 1,
    });
    const record = records.length > 0 ? records[0] : null;

    if (record && record.value) {
      return JSON.parse(record.value);
    }
    return null;
  } catch (e: any) {
    if (e.status === 404) {
      console.warn('App settings record not found, returning default origin address.');
      return null;
    }
    console.error('Error fetching app settings from PocketBase:', e);
    return null;
  }
}

export async function saveOriginAddressSetting(originAddress: RajaOngkirDestination | null): Promise<void> {
  try {
    const dataToSave = {
      key: ORIGIN_ADDRESS_KEY,
      value: originAddress ? JSON.stringify(originAddress) : 'null',
    };

    const existingRecords = await pb.collection(SETTINGS_COLLECTION_NAME).getFullList({
      filter: `key = "${ORIGIN_ADDRESS_KEY}"`,
      limit: 1,
    });

    if (existingRecords.length > 0) {
      // Update existing record
      await pb.collection(SETTINGS_COLLECTION_NAME).update(existingRecords[0].id, dataToSave);
    } else {
      // Create new record
      await pb.collection(SETTINGS_COLLECTION_NAME).create(dataToSave);
    }
  } catch (e) {
    console.error('Error saving app settings to PocketBase:', e);
    throw e; // Re-throw to be handled by calling component
  }
}
