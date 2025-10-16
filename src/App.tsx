import { useEffect } from 'react';
import { BottomTabs } from '@components/layout/BottomTabs';
import { useSettingsStore } from '@store/settings';

function App() {
  useEffect(() => {
    useSettingsStore.getState().initializeAppDefaults();
  }, []);

  return <BottomTabs />;
}

export default App;
