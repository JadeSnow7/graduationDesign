import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { login } from '../api';
import { AuthSession } from '../types';

type LoginScreenProps = {
  onLoginSuccess: (session: AuthSession) => void;
};

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = username.trim().length > 0 && password.length > 0 && !loading;

  const handleLogin = async () => {
    if (!canSubmit) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const session = await login(username.trim(), password);
      onLoginSuccess(session);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>classPlatform</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="admin"
            style={styles.input}
            editable={!loading}
            returnKeyType="next"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="password"
            style={styles.input}
            editable={!loading}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={({ pressed }) => [
            styles.button,
            !canSubmit && styles.buttonDisabled,
            pressed && canSubmit ? styles.buttonPressed : null,
          ]}
          onPress={handleLogin}
          disabled={!canSubmit}
        >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Sign in</Text>
            )}
          </Pressable>
        </View>

        <Text style={styles.hint}>Uses /api/v1/auth/login</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#cbd5f5',
  },
  form: {
    marginTop: 40,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
  },
  label: {
    color: '#cbd5f5',
    marginBottom: 8,
    fontSize: 13,
  },
  input: {
    backgroundColor: '#0b1220',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#f8fafc',
    marginBottom: 16,
  },
  error: {
    color: '#f87171',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    backgroundColor: '#1f3b8a',
  },
  buttonText: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '600',
  },
  hint: {
    marginTop: 18,
    fontSize: 12,
    color: '#94a3b8',
  },
});
