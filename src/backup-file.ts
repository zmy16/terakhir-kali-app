import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';

import { backupFilename, createBackup, readBackup, type Backup } from './backup';
import type { Activity } from './activity';

// Writes the backup JSON straight into the public Download folder, with no picker.
// ponytail: Android only (MediaStore.Downloads). Add an iOS path (share sheet) when iOS ships.
export async function exportBackup(profileName: string, activities: Activity[]): Promise<string> {
  // Loaded on demand: the native module is missing in Expo Go, and importing it eagerly would crash app start.
  const { FileSystem } = require('react-native-file-access') as typeof import('react-native-file-access');
  const name = backupFilename();
  const temp = new File(Paths.cache, name);
  temp.write(createBackup(profileName, activities));
  try {
    await FileSystem.cpExternal(temp.uri, name, 'downloads');
  } finally {
    if (temp.exists) temp.delete();
  }
  return name;
}

export async function importBackup(): Promise<Backup | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true, multiple: false });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (!asset) return null;
  return readBackup(await new File(asset.uri).text());
}
