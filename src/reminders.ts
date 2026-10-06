import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const channelId = 'gentle-reminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function permissionGranted(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(channelId, {
      name: 'Pengingat lembut',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: null,
      vibrationPattern: [0],
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  return (await Notifications.requestPermissionsAsync()).granted;
}

export async function scheduleReminder(title: string, reminderAt: string, activityId: string): Promise<string> {
  if (!(await permissionGranted())) throw new Error('Izinkan notifikasi untuk memakai pengingat.');
  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body: 'Sudah cukup lama sejak terakhir kali kamu melakukannya.',
      data: { activityId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(reminderAt),
      ...(Platform.OS === 'android' ? { channelId } : {}),
    },
  });
}

export async function cancelReminder(notificationId?: string): Promise<void> {
  if (notificationId) await Notifications.cancelScheduledNotificationAsync(notificationId);
}
