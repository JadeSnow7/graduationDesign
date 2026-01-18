import { StyleSheet, Text, View } from 'react-native';

import { ChatMessage } from '../types';

type MessageBubbleProps = {
  message: ChatMessage;
};

function formatTime(value: number): string {
  const date = new Date(value);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser ? styles.rowRight : styles.rowLeft]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.content, isUser ? styles.userContent : styles.assistantContent]}>
          {message.content}
        </Text>
        <Text style={[styles.time, isUser ? styles.userTime : styles.assistantTime]}>
          {formatTime(message.createdAt)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  rowLeft: {
    justifyContent: 'flex-start',
  },
  rowRight: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  userBubble: {
    backgroundColor: '#1f6feb',
  },
  assistantBubble: {
    backgroundColor: '#eef2f6',
  },
  content: {
    fontSize: 15,
    lineHeight: 21,
  },
  time: {
    marginTop: 6,
    fontSize: 11,
  },
  userContent: {
    color: '#f8fafc',
  },
  assistantContent: {
    color: '#0b1220',
  },
  userTime: {
    color: '#d1d5db',
  },
  assistantTime: {
    color: '#6b7280',
  },
});
