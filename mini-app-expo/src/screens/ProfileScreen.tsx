import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { API_BASE_URL } from '../config';
import { AuthSession } from '../types';

type ProfileScreenProps = {
  session: AuthSession;
  messagesCount: number;
  onClearMessages: () => void;
  onSignOut: () => void;
};

type InfoRowProps = {
  label: string;
  value: string;
};

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen({
  session,
  messagesCount,
  onClearMessages,
  onSignOut,
}: ProfileScreenProps) {
  const username = session.user.username ?? 'Unknown';
  const role = session.user.role ?? 'Unknown';
  const expires = session.expiresIn ? `${session.expiresIn}s` : 'Unknown';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account</Text>
        <InfoRow label="Username" value={username} />
        <InfoRow label="Role" value={role} />
        <InfoRow label="Token" value={session.tokenType} />
        <InfoRow label="Expires" value={expires} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Local Storage</Text>
        <InfoRow label="Cached messages" value={`${messagesCount}`} />
        <Text style={styles.cardHint}>
          Chat history is stored locally for offline review.
        </Text>
        <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={onClearMessages}>
          <Text style={styles.buttonText}>Clear chat history</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>API Endpoint</Text>
        <Text style={styles.codeText}>{API_BASE_URL}</Text>
        <Text style={styles.cardHint}>
          Edit src/config.ts to match your backend IP.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Session</Text>
        <Text style={styles.cardHint}>
          Sign out keeps cached chat history unless you clear it manually.
        </Text>
        <Pressable
          style={({ pressed }) => [styles.button, styles.dangerButton, pressed && styles.buttonPressed]}
          onPress={onSignOut}
        >
          <Text style={styles.buttonText}>Sign out</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  infoValue: {
    color: '#e2e8f0',
    fontSize: 12,
  },
  cardHint: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  codeText: {
    color: '#e2e8f0',
    fontSize: 12,
    paddingVertical: 6,
  },
  button: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#1d4ed8',
  },
  dangerButton: {
    backgroundColor: '#b91c1c',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '600',
  },
});
