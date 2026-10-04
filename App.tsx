import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Appearance, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { formatElapsed, localCalendarDate, sortActivitiesByElapsed, validateActivityInput, type Activity } from './src/activity';
import { mergeActivities } from './src/backup';
import { exportBackup, importBackup } from './src/backup-file';
import { resetCopy } from './src/interaction-copy';
import { loadProfileName, saveProfileName } from './src/profile';
import { loadActivities, saveActivities } from './src/storage';

type FormMode = 'add' | 'edit';
type Notice = { message: string; tone: 'success' | 'danger'; undo?: () => void } | null;
type Confirm = { title: string; body: string; action: string; tone: 'forest' | 'coral'; onConfirm: () => void } | null;

const light = { bg: '#F7F5F0', surface: '#FFFFFF', raised: '#EEEAE2', border: '#D8D2C7', text: '#20231F', muted: '#5E625C', forest: '#31533E', coral: '#B84332', onForest: '#FFFFFF', danger: '#9B2C2C' };
const dark = { bg: '#121316', surface: '#1E2026', raised: '#252830', border: '#2B2E37', text: '#F4F4F6', muted: '#B7BBC5', forest: '#2A4032', coral: '#FF6347', onForest: '#FFFFFF', danger: '#F87171' };
type Colors = typeof light;

export default function App() {
  const [darkMode, setDarkMode] = useState(Appearance.getColorScheme() !== 'light');
  const colors = darkMode ? dark : light;
  const today = localCalendarDate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [profileName, setProfileName] = useState('');
  const [profileDraft, setProfileDraft] = useState('');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('add');
  const [editing, setEditing] = useState<Activity | null>(null);
  const [title, setTitle] = useState('');
  const [lastDoneAt, setLastDoneAt] = useState(today);
  const [formError, setFormError] = useState('');
  const [iosPickerVisible, setIosPickerVisible] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [confirm, setConfirm] = useState<Confirm>(null);

  const sorted = useMemo(() => sortActivitiesByElapsed(activities, today), [activities, today]);
  const persist = useCallback(async (next: Activity[]) => { setActivities(next); await saveActivities(next); }, []);
  const restore = useCallback(async () => {
    setStatus('loading');
    try {
      const [savedActivities, savedProfileName] = await Promise.all([loadActivities(), loadProfileName()]);
      setActivities(savedActivities);
      setProfileName(savedProfileName);
      setStatus('ready');
    } catch { setStatus('error'); }
  }, []);

  useEffect(() => { void restore(); }, [restore]);
  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(null), notice.undo ? 5000 : 3500);
    return () => clearTimeout(timeout);
  }, [notice]);

  function openSettings() { setProfileDraft(profileName); setSettingsVisible(true); }
  function openAdd() { setFormMode('add'); setEditing(null); setTitle(''); setLastDoneAt(today); setFormError(''); setFormVisible(true); }
  function openEdit(item: Activity) { setFormMode('edit'); setEditing(item); setTitle(item.title); setLastDoneAt(item.lastDoneAt); setFormError(''); setFormVisible(true); }

  async function saveProfile() {
    try {
      const next = profileDraft.trim().slice(0, 40);
      await saveProfileName(next);
      setProfileName(next);
      setSettingsVisible(false);
      setNotice({ message: next ? 'Profil lokal disimpan.' : 'Nama profil dihapus.', tone: 'success' });
    } catch { setNotice({ message: 'Profil belum dapat disimpan.', tone: 'danger' }); }
  }
  async function shareBackup() {
    try { await exportBackup(profileName, activities); setNotice({ message: 'File backup siap dibagikan.', tone: 'success' }); }
    catch { setNotice({ message: 'Backup belum dapat dibuat. Coba lagi.', tone: 'danger' }); }
  }
  async function restoreBackup() {
    try {
      const backup = await importBackup();
      if (!backup) return;
      const merged = mergeActivities(activities, backup.activities);
      await persist(merged.activities);
      if (!profileName && backup.profileName) { await saveProfileName(backup.profileName); setProfileName(backup.profileName); }
      setNotice({ message: `Backup digabungkan: ${merged.added} baru, ${merged.updated} diperbarui.`, tone: 'success' });
    } catch (error) { setNotice({ message: error instanceof Error ? error.message : 'Backup belum dapat diimpor.', tone: 'danger' }); }
  }
  async function submit() {
    const errors = validateActivityInput(title, lastDoneAt, today);
    if (errors.title || errors.lastDoneAt) { setFormError(errors.title ?? errors.lastDoneAt ?? 'Periksa lagi isianmu.'); return; }
    const now = new Date().toISOString();
    const next = editing
      ? activities.map((item) => item.id === editing.id ? { ...item, title: title.trim(), lastDoneAt, updatedAt: now } : item)
      : [...activities, { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, title: title.trim(), lastDoneAt, createdAt: now, updatedAt: now }];
    try { await persist(next); setFormVisible(false); setNotice({ message: editing ? 'Aktivitas diperbarui.' : 'Aktivitas ditambahkan.', tone: 'success' }); }
    catch { setFormError('Perubahan belum dapat disimpan. Coba lagi.'); }
  }
  function chooseDate() {
    const value = fromCalendarDate(lastDoneAt);
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({ value, mode: 'date', maximumDate: new Date(), onValueChange: (_, date) => { if (date) setLastDoneAt(localCalendarDate(date)); } });
      return;
    }
    setIosPickerVisible(true);
  }
  function requestReset(item: Activity) {
    const copy = resetCopy(item.title);
    setConfirm({ title: copy.confirmTitle, body: copy.confirmBody, action: copy.confirmAction, tone: 'forest', onConfirm: () => void reset(item, copy.success) });
  }
  async function reset(item: Activity, message: string) {
    const previousDate = item.lastDoneAt;
    setConfirm(null);
    try {
      await persist(activities.map((entry) => entry.id === item.id ? { ...entry, lastDoneAt: today, updatedAt: new Date().toISOString() } : entry));
      setNotice({ message, tone: 'success', undo: () => void undoReset(item.id, previousDate) });
    } catch { setNotice({ message: 'Catatan belum dapat disimpan. Coba lagi.', tone: 'danger' }); }
  }
  async function undoReset(id: string, previousDate: string) {
    try {
      await persist(activities.map((item) => item.id === id ? { ...item, lastDoneAt: previousDate, updatedAt: new Date().toISOString() } : item));
      setNotice({ message: 'Tanggal sebelumnya dipulihkan.', tone: 'success' });
    } catch { setNotice({ message: 'Undo belum dapat disimpan.', tone: 'danger' }); }
  }
  function requestDelete(item: Activity) { setConfirm({ title: 'Hapus aktivitas?', body: `Hapus “${item.title}”? Tindakan ini tidak dapat dibatalkan.`, action: 'Hapus aktivitas', tone: 'coral', onConfirm: () => void remove(item.id) }); }
  async function remove(id: string) {
    setConfirm(null);
    try { await persist(activities.filter((item) => item.id !== id)); setNotice({ message: 'Aktivitas dihapus.', tone: 'danger' }); }
    catch { setNotice({ message: 'Aktivitas belum dapat dihapus. Coba lagi.', tone: 'danger' }); }
  }

  if (status === 'loading') return <SafeAreaProvider><Loading colors={colors} /></SafeAreaProvider>;

  return <SafeAreaProvider><SafeAreaView style={[styles.app, { backgroundColor: colors.bg }]} edges={['top', 'left', 'right']}>
    <StatusBar style={darkMode ? 'light' : 'dark'} />
    <View style={styles.header}>
      <View style={styles.brand}><Mark size={42} colors={colors} /><View><Text style={[styles.eyebrow, { color: colors.muted }]}>TERAKHIR KALI</Text><Text style={[styles.title, { color: colors.text }]}>Hal kecil yang{`\n`}berarti.</Text>{profileName ? <Text style={[styles.profileLabel, { color: colors.muted }]}>{greeting()}, {profileName}</Text> : null}</View></View>
      <Pressable accessibilityLabel="Buka pengaturan, tema, dan backup" onPress={openSettings} style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.border }]}><ControlsIcon color={colors.text} /></Pressable>
    </View>
    <View style={[styles.banner, { backgroundColor: colors.forest }]}><LeafIcon /><Text style={[styles.bannerTitle, { color: colors.onForest }]}>Lihat yang sudah lama{`\n`}tidak terjadi.</Text><Text style={[styles.bannerCopy, { color: colors.onForest }]}>Tidak perlu mengejar target. Cukup ingat yang penting bagimu.</Text></View>
    {status === 'error' ? <State title="Catatan belum bisa dibaca" copy="Data tidak dihapus. Coba muat ulang dulu." colors={colors} action="Muat ulang" onAction={() => void restore()} /> : <FlatList data={sorted} keyExtractor={(item) => item.id} contentContainerStyle={sorted.length ? styles.list : styles.emptyList} ListHeaderComponent={sorted.length ? <Text style={[styles.section, { color: colors.text }]}>Yang paling lama</Text> : null} ListEmptyComponent={<State title="Belum ada yang dicatat" copy="Tambahkan satu hal yang ingin kamu ingat, kapan terakhir melakukannya." colors={colors} action="Tambah aktivitas" onAction={openAdd} />} renderItem={({ item }) => <ActivityRow item={item} today={today} colors={colors} onEdit={() => openEdit(item)} onReset={() => requestReset(item)} onDelete={() => requestDelete(item)} />} />}
    <Pressable onPress={openAdd} style={[styles.add, { backgroundColor: colors.coral }]}><PlusIcon /><Text style={styles.primaryText}>Tambah aktivitas</Text></Pressable>
    {notice && <NoticeBar notice={notice} colors={colors} onClose={() => setNotice(null)} />}
    <Modal visible={formVisible} animationType="slide" transparent onRequestClose={() => setFormVisible(false)}><KeyboardAvoidingView style={styles.scrim} behavior="padding"><View style={[styles.sheet, { backgroundColor: colors.bg }]}><Text style={[styles.sheetTitle, { color: colors.text }]}>{formMode === 'add' ? 'Tambah aktivitas' : 'Ubah aktivitas'}</Text><Text style={[styles.label, { color: colors.muted }]}>Apa yang ingin kamu ingat?</Text><TextInput value={title} onChangeText={setTitle} placeholder="Misalnya, Telepon Ibu" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]} maxLength={80} autoFocus /><Text style={[styles.label, { color: colors.muted }]}>Kapan terakhir dilakukan?</Text><Pressable onPress={chooseDate} style={[styles.datePicker, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[styles.dateValue, { color: colors.text }]}>{displayDate(lastDoneAt)}</Text><Text style={[styles.dateChange, { color: colors.coral }]}>Pilih tanggal</Text></Pressable><Text style={[styles.hint, { color: colors.muted }]}>Awalnya hari ini. Kamu bisa memilih tanggal sebelumnya.</Text>{Platform.OS === 'ios' && iosPickerVisible && <DateTimePicker value={fromCalendarDate(lastDoneAt)} mode="date" maximumDate={new Date()} display="inline" onValueChange={(_, date) => { if (date) setLastDoneAt(localCalendarDate(date)); }} />}{Boolean(formError) && <Text style={{ color: colors.danger }}>{formError}</Text>}<View style={styles.actions}><Pressable onPress={() => setFormVisible(false)} style={[styles.secondary, { borderColor: colors.border }]}><Text style={{ color: colors.text }}>Batal</Text></Pressable><Pressable onPress={() => void submit()} style={[styles.primary, { backgroundColor: colors.coral }]}><Text style={styles.primaryText}>Simpan</Text></Pressable></View></View></KeyboardAvoidingView></Modal>
    <ConfirmSheet confirm={confirm} colors={colors} onCancel={() => setConfirm(null)} />
    <Modal visible={settingsVisible} animationType="slide" transparent onRequestClose={() => setSettingsVisible(false)}><KeyboardAvoidingView style={styles.settingsScrim} behavior="padding"><View style={[styles.sheet, styles.settingsSheet, { backgroundColor: colors.bg }]}><ScrollView style={styles.settingsScroll} contentContainerStyle={styles.settingsContent} keyboardShouldPersistTaps="handled"><Text style={[styles.sheetTitle, { color: colors.text }]}>Profil dan backup</Text><Text style={[styles.label, { color: colors.muted }]}>Nama profil lokal</Text><TextInput value={profileDraft} onChangeText={setProfileDraft} placeholder="Misalnya, Raid" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]} maxLength={40} /><Text style={[styles.hint, { color: colors.muted }]}>Bukan akun login. Data tetap ada di HP ini sampai kamu membuat backup.</Text><Pressable onPress={() => void shareBackup()} style={[styles.backupAction, { backgroundColor: colors.forest }]}><Text style={styles.primaryText}>Export backup</Text></Pressable><Pressable onPress={() => void restoreBackup()} style={[styles.backupAction, { borderColor: colors.border }]}><Text style={{ color: colors.text, fontWeight: '700' }}>Import dan gabungkan backup</Text></Pressable><Text style={[styles.hint, { color: colors.muted }]}>Import menambahkan data baru dan memakai perubahan terbaru bila ID sama. Data sekarang tidak dihapus.</Text><Text style={[styles.backupWarning, { color: colors.muted }]}>Simpan backup sebelum menghapus aplikasi atau berpindah HP.</Text><View style={styles.themeRow}><Text style={[styles.label, { color: colors.muted }]}>Tema</Text><Pressable accessibilityLabel={darkMode ? 'Gunakan tema terang' : 'Gunakan tema gelap'} onPress={() => setDarkMode((value) => !value)} style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>{darkMode ? <SunIcon color={colors.text} /> : <MoonIcon color={colors.text} />}</Pressable></View></ScrollView><ProfileActions colors={colors} onCancel={() => setSettingsVisible(false)} onSave={() => void saveProfile()} /></View></KeyboardAvoidingView></Modal>
  </SafeAreaView></SafeAreaProvider>;
}

function ActivityRow({ item, today, colors, onEdit, onReset, onDelete }: { item: Activity; today: string; colors: Colors; onEdit: () => void; onReset: () => void; onDelete: () => void }) {
  const { resetAction } = resetCopy(item.title);
  return <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}><Pressable onPress={onEdit} style={styles.cardText}><View style={styles.activityHeading}><Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text><Text style={[styles.editLink, { color: colors.coral }]}>Ubah</Text></View><View style={styles.lastDone}><CalendarIcon color={colors.muted} /><Text style={[styles.date, { color: colors.muted }]}>Terakhir: {displayDate(item.lastDoneAt)}</Text></View></Pressable><View style={styles.cardSide}><View style={styles.elapsedRow}><ClockIcon color={colors.coral} /><Text style={[styles.elapsed, { color: colors.coral }]}>{formatElapsed(item.lastDoneAt, today)}</Text></View><Pressable onPress={onReset} accessibilityLabel={`Tandai ${item.title} dilakukan hari ini`} style={[styles.reset, { backgroundColor: colors.raised }]}><CheckIcon color={colors.text} /><Text style={{ color: colors.text }}>{resetAction}</Text></Pressable><Pressable onPress={onDelete} accessibilityLabel={`Hapus ${item.title}`} style={styles.deleteAction}><TrashIcon color={colors.danger} /><Text style={{ color: colors.danger }}>Hapus</Text></Pressable></View></View>;
}

function ProfileActions({ colors, onCancel, onSave }: { colors: Colors; onCancel: () => void; onSave: () => void }) {
  return <View style={styles.actions}><Pressable onPress={onCancel} style={[styles.secondary, { borderColor: colors.border }]}><Text style={{ color: colors.text }}>Batal</Text></Pressable><Pressable onPress={onSave} style={[styles.primary, { backgroundColor: colors.coral }]}><Text style={styles.primaryText}>Simpan profil</Text></Pressable></View>;
}

function ConfirmSheet({ confirm, colors, onCancel }: { confirm: Confirm; colors: Colors; onCancel: () => void }) {
  if (!confirm) return null;
  return <Modal transparent animationType="fade" onRequestClose={onCancel}><View style={styles.centerScrim}><View style={[styles.confirmCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.confirmTitle, { color: colors.text }]}>{confirm.title}</Text><Text style={[styles.confirmBody, { color: colors.muted }]}>{confirm.body}</Text><View style={styles.actions}><Pressable onPress={onCancel} style={[styles.secondary, { borderColor: colors.border }]}><Text style={{ color: colors.text }}>Batal</Text></Pressable><Pressable onPress={confirm.onConfirm} style={[styles.primary, { backgroundColor: confirm.tone === 'forest' ? colors.forest : colors.coral }]}><Text style={styles.primaryText}>{confirm.action}</Text></Pressable></View></View></View></Modal>;
}
function NoticeBar({ notice, colors, onClose }: { notice: Exclude<Notice, null>; colors: Colors; onClose: () => void }) {
  const background = notice.tone === 'success' ? colors.forest : colors.coral;
  return <View style={[styles.notice, { backgroundColor: background }]}><Text style={[styles.noticeText, { color: '#FFFFFF' }]}>{notice.message}</Text>{notice.undo ? <Pressable onPress={() => { notice.undo?.(); onClose(); }}><Text style={styles.noticeAction}>Undo</Text></Pressable> : <Pressable onPress={onClose}><Text style={styles.noticeAction}>Tutup</Text></Pressable>}</View>;
}
function Loading({ colors }: { colors: Colors }) { return <SafeAreaView style={[styles.loading, { backgroundColor: colors.bg }]}><Mark size={112} colors={colors} /><Text style={[styles.loadingName, { color: colors.text }]}>Terakhir Kali</Text><Text style={[styles.loadingCopy, { color: colors.muted }]}>Menyiapkan catatanmu.</Text></SafeAreaView>; }
function State({ title, copy, action, onAction, colors }: { title: string; copy: string; action?: string; onAction?: () => void; colors: Colors }) { return <View style={styles.state}><Text style={[styles.stateTitle, { color: colors.text }]}>{title}</Text><Text style={[styles.stateCopy, { color: colors.muted }]}>{copy}</Text>{action && <Pressable onPress={onAction} style={[styles.stateAction, { backgroundColor: colors.forest }]}><Text style={styles.primaryText}>{action}</Text></Pressable>}</View>; }

function Mark({ size, colors }: { size: number; colors: Colors }) { return <Svg width={size} height={size} viewBox="0 0 256 256" accessibilityLabel="Logo Terakhir Kali"><Rect width="256" height="256" rx="64" fill={colors.forest} /><Path d="M190 77A82 82 0 1 0 204 139" fill="none" stroke="#F7F5F0" strokeWidth="22" strokeLinecap="round" /><Path d="M167 105A48 48 0 1 0 176 142" fill="none" stroke="#BFE0C7" strokeWidth="14" strokeLinecap="round" /><Circle cx="189" cy="75" r="12" fill={colors.coral} /></Svg>; }
function ControlsIcon({ color }: { color: string }) { return <Svg width={22} height={22} viewBox="0 0 24 24" fill="none"><Path d="M4 7h16M4 17h16" stroke={color} strokeWidth="1.8" strokeLinecap="round" /><Circle cx="9" cy="7" r="2.25" fill="#1E2026" stroke={color} strokeWidth="1.8" /><Circle cx="15" cy="17" r="2.25" fill="#1E2026" stroke={color} strokeWidth="1.8" /></Svg>; }
function PlusIcon() { return <Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path d="M12 5v14M5 12h14" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" /></Svg>; }
function CalendarIcon({ color }: { color: string }) { return <Svg width={15} height={15} viewBox="0 0 24 24" fill="none"><Rect x="4" y="5.5" width="16" height="14" rx="2" stroke={color} strokeWidth="1.8" /><Path d="M8 3.5v4M16 3.5v4M4 10h16" stroke={color} strokeWidth="1.8" strokeLinecap="round" /></Svg>; }
function ClockIcon({ color }: { color: string }) { return <Svg width={15} height={15} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.8" /><Path d="M12 7v5l3 2" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function CheckIcon({ color }: { color: string }) { return <Svg width={15} height={15} viewBox="0 0 24 24" fill="none"><Path d="m5 12 4.2 4L19 6.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function TrashIcon({ color }: { color: string }) { return <Svg width={15} height={15} viewBox="0 0 24 24" fill="none"><Path d="M5 7h14M10 11v5M14 11v5M9 7l1-2h4l1 2m-8 0 .8 12h8.4L17 7" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function LeafIcon() { return <Svg width={26} height={26} viewBox="0 0 24 24" fill="none" style={styles.bannerLeaf}><Path d="M19 4c-7.5.2-12.3 3.4-13.4 9.1-.5 2.6 1.6 4.7 4.2 4.2C15.6 16.3 18.8 11.5 19 4Z" stroke="#BFE0C7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><Path d="M5.5 18.5c2.9-3.8 5.8-6.1 10.6-8.7" stroke="#BFE0C7" strokeWidth="1.6" strokeLinecap="round" /></Svg>; }
function SunIcon({ color }: { color: string }) { return <Svg width={22} height={22} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="3.5" stroke={color} strokeWidth="1.8" /><Path d="M12 2.5v2M12 19.5v2M21.5 12h-2M4.5 12h-2M18.72 5.28l-1.42 1.42M6.7 17.3l-1.42 1.42M18.72 18.72 17.3 17.3M6.7 6.7 5.28 5.28" stroke={color} strokeWidth="1.8" strokeLinecap="round" /></Svg>; }
function MoonIcon({ color }: { color: string }) { return <Svg width={22} height={22} viewBox="0 0 24 24" fill="none"><Path d="M20.5 15.1A8.5 8.5 0 0 1 8.9 3.5 8.5 8.5 0 1 0 20.5 15.1Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function greeting(now = new Date()) { const hour = now.getHours(); if (hour < 11) return 'Selamat pagi'; if (hour < 15) return 'Selamat siang'; if (hour < 18) return 'Selamat sore'; return 'Selamat malam'; }
function fromCalendarDate(value: string) { const [year, month, day] = value.split('-').map(Number); return new Date(year, month - 1, day); }
function displayDate(value: string) { return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(fromCalendarDate(value)); }

const styles = StyleSheet.create({
  app:{flex:1,paddingHorizontal:16,paddingTop:12}, iconButton:{width:48,height:48,borderWidth:1,borderRadius:14,alignItems:'center',justifyContent:'center'}, profileLabel:{fontSize:14,marginTop:5}, loading:{flex:1,alignItems:'center',justifyContent:'center',gap:12},loadingName:{fontFamily:'Georgia',fontSize:28},loadingCopy:{fontSize:14}, header:{paddingTop:18,flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'}, brand:{flex:1,flexDirection:'row',alignItems:'center',gap:10,paddingRight:12}, eyebrow:{fontSize:10,fontWeight:'700',letterSpacing:1.5}, title:{fontFamily:'Georgia',fontSize:27,lineHeight:31,marginTop:4}, theme:{minHeight:44,paddingHorizontal:12,borderWidth:1,borderRadius:10,justifyContent:'center'}, themeRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:8}, banner:{borderRadius:24,padding:20,marginTop:24,marginBottom:20,overflow:'hidden'}, bannerLeaf:{position:'absolute',right:18,bottom:18,opacity:.8}, bannerTitle:{fontFamily:'Georgia',fontSize:23,lineHeight:28}, bannerCopy:{fontSize:14,lineHeight:20,marginTop:12,maxWidth:280,opacity:.9}, section:{fontSize:16,fontWeight:'700',marginBottom:10}, list:{paddingBottom:86}, emptyList:{flexGrow:1,justifyContent:'center',paddingBottom:90}, card:{borderWidth:1,borderRadius:16,padding:14,marginBottom:10,flexDirection:'row',gap:12}, cardText:{flex:1,minHeight:94,justifyContent:'center'}, activityHeading:{flexDirection:'row',alignItems:'center',gap:8}, cardTitle:{flexShrink:1,fontSize:16,fontWeight:'700'}, editLink:{fontSize:12,fontWeight:'700'}, lastDone:{flexDirection:'row',alignItems:'center',gap:5,marginTop:6}, date:{fontSize:12}, cardSide:{width:154,alignItems:'flex-end',gap:8}, elapsedRow:{flexDirection:'row',alignItems:'center',gap:5}, elapsed:{fontWeight:'700'}, reset:{minHeight:40,paddingHorizontal:10,borderRadius:9,justifyContent:'center',alignItems:'center',flexDirection:'row',gap:6}, deleteAction:{minHeight:32,flexDirection:'row',alignItems:'center',gap:5}, add:{height:52,borderRadius:14,position:'absolute',bottom:40,left:16,right:16,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:9}, primaryText:{color:'#FFFFFF',fontWeight:'700'}, state:{alignItems:'center',padding:28}, stateTitle:{fontFamily:'Georgia',fontSize:23,textAlign:'center'}, stateCopy:{textAlign:'center',fontSize:14,lineHeight:20,marginTop:10}, stateAction:{marginTop:20,minHeight:48,borderRadius:12,paddingHorizontal:18,justifyContent:'center'}, notice:{position:'absolute',bottom:102,left:16,right:16,borderRadius:12,padding:14,flexDirection:'row',alignItems:'center',gap:12}, noticeText:{flex:1,fontSize:13,lineHeight:18}, noticeAction:{color:'#FFFFFF',fontWeight:'800'}, scrim:{flex:1,justifyContent:'flex-end',backgroundColor:'rgba(0,0,0,.42)'}, settingsScrim:{flex:1,justifyContent:'flex-end',paddingTop:48,backgroundColor:'rgba(0,0,0,.42)'}, settingsSheet:{maxHeight:'100%',flexShrink:1}, settingsScroll:{flexShrink:1}, settingsContent:{gap:8}, centerScrim:{flex:1,justifyContent:'center',padding:24,backgroundColor:'rgba(0,0,0,.42)'}, sheet:{padding:20,borderTopLeftRadius:28,borderTopRightRadius:28,gap:8}, confirmCard:{borderRadius:20,borderWidth:1,padding:20}, sheetTitle:{fontFamily:'Georgia',fontSize:25,marginBottom:12}, confirmTitle:{fontFamily:'Georgia',fontSize:23}, confirmBody:{fontSize:14,lineHeight:20,marginTop:10}, label:{fontSize:13,fontWeight:'700',marginTop:5}, input:{borderWidth:1,borderRadius:12,minHeight:50,paddingHorizontal:14,fontSize:16}, datePicker:{borderWidth:1,borderRadius:12,minHeight:56,paddingHorizontal:14,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}, dateValue:{fontSize:15}, dateChange:{fontSize:13,fontWeight:'700'}, hint:{fontSize:12,lineHeight:17}, backupWarning:{fontSize:12,lineHeight:17,fontWeight:'700',marginTop:8}, backupAction:{minHeight:50,borderRadius:12,borderWidth:1,alignItems:'center',justifyContent:'center',marginTop:8}, actions:{flexDirection:'row',gap:10,marginTop:16}, primary:{flex:1,minHeight:50,borderRadius:12,alignItems:'center',justifyContent:'center'}, secondary:{flex:1,minHeight:50,borderRadius:12,borderWidth:1,alignItems:'center',justifyContent:'center'}
});
