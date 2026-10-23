import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import {
  useFonts,
  BricolageGrotesque_400Regular,
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque';
import { apiRequest } from './src/api';
import { colors } from './src/theme';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';

const TOKEN_KEY = 'auth_token';

export default function App() {
  const [fontsLoaded] = useFonts({
    BricolageGrotesque_400Regular,
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_800ExtraBold,
  });
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
  if (!fontsLoaded || checking) {
    content = (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.pine} />
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
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paper,
  },
});