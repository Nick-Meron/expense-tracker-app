import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import { apiRequest } from './src/api';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';

const TOKEN_KEY = 'auth_token';

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function restoreLogin() {
      try {
        const saved = await SecureStore.getItemAsync(TOKEN_KEY);
        if (saved) {
          const me = await apiRequest('/user', { token: saved });
          setToken(saved);
          setUser(me);
        }
      } catch (e) {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      } finally {
        setChecking(false);
      }
    }
    restoreLogin();
  }, []);

  async function handleLogin(newToken, newUser) {
    await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
  }

  async function handleLogout() {
    try {
      await apiRequest('/logout', { method: 'POST', token });
    } catch (e) {
      // ignore: we log out on the device either way
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  let content;
  if (checking) {
    content = (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  } else if (user) {
    content = <HomeScreen token={token} user={user} onLogout={handleLogout} />;
  } else {
    content = <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <View style={styles.root}>
      {content}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});