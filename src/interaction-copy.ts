export function resetCopy(title: string) {
  return {
    confirmTitle: 'Catat dilakukan hari ini?',
    confirmBody: `${title} akan dicatat dilakukan hari ini.`,
    confirmAction: 'Ya, lakukan hari ini',
    success: `${title} dicatat dilakukan hari ini.`,
    resetAction: 'Tandai hari ini',
  };
}
