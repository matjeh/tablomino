import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.minutemind.tablomino',
  appName: 'Tablomino',
  webDir: 'out',
  ios: {
    // The app deliberately doesn't set viewport-fit=cover, so WKWebView
    // insets the viewport to the safe area (nothing gets clipped by the
    // notch / Dynamic Island / home indicator). Those strips then render the
    // WebView's own background, which defaults to white -- match
    // `--background` from app/globals.css so they blend into the page.
    backgroundColor: '#f6f8ff',
  },
};

export default config;
