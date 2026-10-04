import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { createBackup, readBackup, type Backup } from './backup';
import type { Activity } from './activity';

export async function exportBackup(profileName: string, activities: Activity[]): Promise<void> {
  const filename = `terakhir-kali-backup-${new Date().toISOString().slice(0, 10)}.json`;
  const file = new File(Paths.cache, filename);
  file.write(createBackup(profileName, activities));
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Simpan backup Terakhir Kali' });
}

export async function importBackup(): Promise<Backup | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true, multiple: false });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (!asset) return null;
  return readBackup(await new File(asset.uri).text());
}
