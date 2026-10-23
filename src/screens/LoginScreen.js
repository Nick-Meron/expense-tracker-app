import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiRequest } from '../api';
import { colors, fonts } from '../theme';

function Field({ label, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, focused && styles.inputFocused]}
        placeholderTextColor={colors.stone}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
    </View>
  );
}

export default function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const isLogin = mode === 'login';

  async function submit() {
    if (!email.trim() || !password || (!isLogin && !name.trim())) {
      Alert.alert(
        'Some details are missing',
        isLogin
          ? 'Enter your email and password.'
          : 'Enter your name, email and a password.'
      );
      return;
    }

    setBusy(true);
    try {
      const path = isLogin ? '/login' : '/register';
      const body = isLogin
        ? { email: email.trim(), password }
        : { name: name.trim(), email: email.trim(), password };

      const data = await apiRequest(path, { method: 'POST', body });
      setPassword('');
      await onLogin(data.token, data.user);
    } catch (e) {
      Alert.alert(isLogin ? 'Could not log in' : 'Could not create account', e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View style={styles.panel}>
          <Text style={styles.title}>Expense{'\n'}Tracker</Text>
          <Text style={styles.tagline}>See where your money goes each month.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.heading}>
            {isLogin ? 'Welcome back' : 'Create your account'}
          </Text>

          {!isLogin && (
            <Field
              label="Name"
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              autoCapitalize="words"
            />
          )}

          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />

          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder={isLogin ? 'Your password' : 'At least 6 characters'}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.button, busy && styles.buttonDisabled]}
            onPress={submit}
            disabled={busy}
            activeOpacity={0.85}
          >
            {busy ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? 'Log in' : 'Create account'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMode(isLogin ? 'register' : 'login')}
            style={styles.switch}
          >
            <Text style={styles.switchText}>
              {isLogin ? 'New here? Create an account' : 'Already registered? Log in'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  scroll: { flexGrow: 1 },

  panel: {
    backgroundColor: colors.pine,
    paddingTop: 96,
    paddingBottom: 44,
    paddingHorizontal: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  title: {
    fontFamily: fonts.extrabold,
    fontSize: 46,
    lineHeight: 50,
    color: colors.white,
  },
  tagline: {
    fontFamily: fonts.regular,
    fontSize: 17,
    color: '#A9C2BA',
    marginTop: 14,
  },

  form: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 48,
  },
  heading: {
    fontFamily: fonts.semibold,
    fontSize: 22,
    color: colors.ink,
    marginBottom: 20,
  },

  field: { marginBottom: 16 },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.stone,
    marginBottom: 6,
  },
  input: {
    fontFamily: fonts.regular,
    fontSize: 17,
    color: colors.ink,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  inputFocused: { borderColor: colors.pine },

  button: {
    backgroundColor: colors.pine,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    fontFamily: fonts.semibold,
    fontSize: 17,
    color: colors.white,
  },

  switch: { alignItems: 'center', marginTop: 22, padding: 6 },
  switchText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.pine,
  },
});