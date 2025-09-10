@@ .. @@
-import { useState } from 'react';
-import reactLogo from './assets/react.svg';
-import viteLogo from '/vite.svg';
+import React from 'react';
+import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
+import { Dashboard } from './components/Dashboard/Dashboard';
+import { store } from './store';
import { theme } from './theme';
 import './App.css';

+const theme = createTheme({
+  palette: {
+    mode: 'light',
+    primary: {
+      main: '#1976d2',
+    },
+    secondary: {
+      main: '#dc004e',
+    },
+    background: {
+      default: '#f5f5f5',
+    },
+  },
+  typography: {
+    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
+    h4: {
+      fontWeight: 600,
+    },
+  },
+  components: {
+    MuiCard: {
+      styleOverrides: {
+        root: {
+          borderRadius: 12,
-      </p>
-    </>
+    <Provider store={store}>
+      <ThemeProvider theme={theme}>
+        <CssBaseline />
+        <Dashboard />
+      </ThemeProvider>
+    </Provider>
   );
 }