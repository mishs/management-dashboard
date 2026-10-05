import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Toaster } from 'sonner';
import { Dashboard } from '@storybookComponents/Dashboard/Dashboard';
import { store } from '@store';
import { theme } from '@theme';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Dashboard />
        <Toaster 
          position="top-right" 
          richColors 
          closeButton 
          duration={4000} 
        />
      </ThemeProvider>
    </Provider>
  );
}

export default App;