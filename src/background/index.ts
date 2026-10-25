// setPanelBehavior dipasang di level atas (bukan hanya onInstalled) karena
// service worker MV3 dapat dibangunkan kapan pun tanpa melewati onInstalled.
void chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error: unknown) => {
    console.error('LyraSync AI: gagal mengatur perilaku panel samping', error)
  })
