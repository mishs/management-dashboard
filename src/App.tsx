@@ .. @@
-import { useState } from 'react';
-import reactLogo from './assets/react.svg';
-import viteLogo from '/vite.svg';
+import React from 'react';
+import { Provider } from 'react-redux';
+import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
+import { Dashboard } from './components/Dashboard/Dashboard';
+import { store } from './store';
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
+        },
+      },
+    },
+  },
+});
+
 function App() {
-  const [count, setCount] = useState(0);
-
   return (
-    <>
-      <div>
-        <a href="https://vitejs.dev" target="_blank">
-          <img src={viteLogo} className="logo" alt="Vite logo" />
-        </a>
-        <a href="https://react.dev" target="_blank">
-          <img src={reactLogo} className="logo react" alt="React logo" />
-        </a>
-      </div>
-      <h1>Vite + React</h1>
-      <div className="card">
-        <button onClick={() => setCount((count) => count + 1)}>
-          count is {count}
-        </button>
-        <p>
-          Edit <code>src/App.tsx</code> and save to test HMR
-        </p>
-      </div>
-      <p className="read-the-docs">
-        Click on the Vite and React logos to learn more
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