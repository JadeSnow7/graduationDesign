import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import ChatScreen from './src/screens/ChatScreen';
import LoginScreen from './src/screens/LoginScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import {
  clearAuthSession,
  clearMessages,
  loadAuthSession,
  loadMessages,
  saveAuthSession,
  saveMessages,
} from './src/storage';
import { AuthSession, ChatMessage } from './src/types';

type TabKey = 'chat' | 'profile';

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [booting, setBooting] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('chat');

  useEffect(() => {
    let isActive = true;

    const bootstrap = async () => {
      const [storedSession, storedMessages] = await Promise.all([
        loadAuthSession(),
        loadMessages(),
      ]);

      if (!isActive) {
        return;
      }

      setSession(storedSession);
      setMessages(storedMessages);
      setBooting(false);
    };

    bootstrap();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!booting) {
      void saveMessages(messages);
    }
  }, [messages, booting]);

  useEffect(() => {
    if (session) {
      setActiveTab('chat');
    }
  }, [session]);

  const handleLoginSuccess = async (newSession: AuthSession) => {
    setSession(newSession);
    await saveAuthSession(newSession);
  };

  const handleClearMessages = async () => {
    setMessages([]);
    await clearMessages();
  };

  const handleSignOut = async () => {
    setSession(null);
    await clearAuthSession();
  };

  if (booting) {
    return (
      <SafeAreaView style={styles.bootContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#60a5fa" />
        <Text style={styles.bootText}>Loading classPlatform...</Text>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <>
        <StatusBar style="light" />
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>classPlatform</Text>
          <Text style={styles.subtitle}>Mini App for AI tutoring</Text>
        </View>
        <View style={styles.userPill}>
          <Text style={styles.userText}>{session.user.username ?? 'User'}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {activeTab === 'chat' ? (
          <ChatScreen session={session} messages={messages} setMessages={setMessages} />
        ) : (
          <ProfileScreen
            session={session}
            messagesCount={messages.length}
            onClearMessages={handleClearMessages}
            onSignOut={handleSignOut}
          />
        )}
      </View>

      <View style={styles.tabBar}>
        <Pressable
          style={({ pressed }) => [
            styles.tabButton,
            activeTab === 'chat' ? styles.tabButtonActive : null,
            pressed ? styles.tabButtonPressed : null,
          ]}
          onPress={() => setActiveTab('chat')}
        >
          <Text style={[styles.tabText, activeTab === 'chat' ? styles.tabTextActive : null]}>Chat</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.tabButton,
            activeTab === 'profile' ? styles.tabButtonActive : null,
            pressed ? styles.tabButtonPressed : null,
          ]}
          onPress={() => setActiveTab('profile')}
        >
          <Text style={[styles.tabText, activeTab === 'profile' ? styles.tabTextActive : null]}>
            Profile
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0b1220',
  },
  bootContainer: {
    flex: 1,
    backgroundColor: '#0b1220',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bootText: {
    marginTop: 16,
    color: '#94a3b8',
    fontSize: 13,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  userPill: {
    backgroundColor: '#111827',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  userText: {
    color: '#e2e8f0',
    fontSize: 12,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
    backgroundColor: '#0b1220',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#111827',
  },
  tabButtonPressed: {
    opacity: 0.85,
  },
  tabText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#f8fafc',
  },
});
