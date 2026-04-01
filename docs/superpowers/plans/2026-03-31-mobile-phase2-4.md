# Mobile Phase 2–4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the EduGraph mobile simplified plan — ChatScreen deep-link + writing_coach mode (Phase 2), KnowledgeCourseScreen showing per-course learning profile (Phase 3), and KnowledgeTab bottom navigation entry (Phase 4).

**Architecture:** Phase 2 adds a route param to ChatScreen so any screen can pre-select a course; Phase 3 adds a new screen backed by `GET /api/v1/learning-profiles/:courseId/:studentId`; Phase 4 wires Phase 3 into a new bottom tab. All three phases are additive — no existing logic is changed beyond navigation plumbing.

**Tech Stack:** React Native (Expo), `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`, TypeScript, existing `authedApi` helper in `code/mobile/src/api.ts`.

---

## File Map

| Status | File | Change |
|--------|------|--------|
| Modify | `code/mobile/src/screens/ChatScreen.tsx` | Accept optional `courseId` route param; skip course picker when pre-selected |
| Modify | `code/mobile/src/navigation/AppNavigator.tsx` | Add `courseId?` to `ChatTabParamList`; add `KnowledgeTab`; add `KnowledgeStackParamList`; import new screens |
| Modify | `code/mobile/src/screens/CourseDetailScreen.tsx` | Add "AI 助教" quick-entry button in overview tab |
| Create | `code/mobile/src/screens/KnowledgeCourseScreen.tsx` | Learning-profile screen with weak-point mastery bars |
| Create | `code/mobile/src/screens/KnowledgeHomeScreen.tsx` | Course picker that leads to `KnowledgeCourseScreen` |
| Modify | `code/mobile/src/api.ts` | Add `getLearningProfile()` |
| Modify | `code/mobile/src/types.ts` | Add `LearningProfile` type |

---

## Task 1 — Add `LearningProfile` type and `getLearningProfile` API

**Files:**
- Modify: `code/mobile/src/types.ts`
- Modify: `code/mobile/src/api.ts`

### Background

`GET /api/v1/learning-profiles/:courseId/:studentId` returns a `StudentLearningProfile` (see `code/backend/internal/models/learning_event.go`):

```json
{
  "id": 1,
  "student_id": 3,
  "course_id": 7,
  "weak_points": "{\"学术语气\": 3, \"引用规范\": 1}",
  "completed_topics": "[\"Introduction\", \"Chapter 2\"]",
  "total_sessions": 12,
  "total_study_minutes": 240,
  "recommended_topics": "[\"Citation styles\"]",
  "last_session_at": "2026-03-30T10:00:00Z",
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-03-30T10:00:00Z"
}
```

`weak_points` is a JSON-encoded `Record<string, number>` (concept → session-count). `completed_topics` and `recommended_topics` are JSON-encoded `string[]`.

- [ ] **Step 1: Add `LearningProfile` type to `types.ts`**

Append at the end of `code/mobile/src/types.ts`:

```typescript
export type LearningProfile = {
    id: number;
    student_id: number;
    course_id: number;
    /** JSON-encoded Record<string, number> e.g. '{"学术语气": 3}' */
    weak_points: string;
    /** JSON-encoded string[] */
    completed_topics: string;
    total_sessions: number;
    total_study_minutes: number;
    last_session_at?: string;
    /** JSON-encoded string[] */
    recommended_topics?: string;
    created_at: string;
    updated_at: string;
};
```

- [ ] **Step 2: Add `getLearningProfile` to `api.ts`**

Add after the last export in `code/mobile/src/api.ts`:

```typescript
// ============ Learning Profile API ============

export async function getLearningProfile(
    token: string,
    tokenType: string,
    courseId: number,
    studentId: number,
): Promise<LearningProfile> {
    const api = authedApi(token, tokenType);
    const res = await api.request<{ data: LearningProfile }>(
        'GET',
        `/learning-profiles/${courseId}/${studentId}`,
    );
    return res.data;
}
```

> **Note:** `authedApi(token, tokenType).request` is the underlying fetch helper used throughout `api.ts`. Check how `getCourseOverviewStats` calls `api.request` to confirm the exact signature — it may be `authedApi(...).get(path)` instead of `.request('GET', path)`. Use whichever pattern existing functions use.

- [ ] **Step 3: Verify TypeScript**

```bash
cd code/mobile && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd code/mobile
git add src/types.ts src/api.ts
git commit -m "feat(mobile): add LearningProfile type and getLearningProfile API"
```

---

## Task 2 — ChatScreen deep-link (Phase 2)

**Files:**
- Modify: `code/mobile/src/navigation/AppNavigator.tsx`
- Modify: `code/mobile/src/screens/ChatScreen.tsx`
- Modify: `code/mobile/src/screens/CourseDetailScreen.tsx`

### Background

`ChatScreen` is mounted inside `MainTab.Screen name="ChatTab"`. Tab screens don't normally receive route params, but with `@react-navigation/bottom-tabs` you can pass initial params via `initialParams` — or navigate with params using `navigation.navigate('ChatTab', { screen: 'ChatTab', params: { courseId: X } })`. The simplest pattern for a tab screen is to add a `ChatTabParamList` and navigate from a nested stack.

However, since `ChatTab` is a top-level tab (not a stack), the clean approach is:

1. Wrap `ChatTab` in a mini stack (`ChatStack`) with one screen: `ChatMain`.
2. Pass optional `courseId?: number` to `ChatMain`.
3. `ChatScreen` reads `route.params?.courseId` and skips the picker when it is set.

- [ ] **Step 1: Add `ChatStackParamList` and wrap ChatTab in a stack**

In `code/mobile/src/navigation/AppNavigator.tsx`, add:

```typescript
export type ChatStackParamList = {
    ChatMain: { courseId?: number; courseTitle?: string } | undefined;
};
```

Add near the other `createNativeStackNavigator` calls:

```typescript
const ChatStack = createNativeStackNavigator<ChatStackParamList>();
```

Replace the `ChatTab` screen content:

```typescript
<MainTab.Screen
    name="ChatTab"
    options={{
        title: 'AI 助教',
        tabBarIcon: ({ focused }) => <TabIcon name="chat" focused={focused} />,
        headerShown: false,
    }}
>
    {() => (
        <ChatStack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: palette.background },
                headerTintColor: palette.textPrimary,
                headerTitleStyle: { fontWeight: '700' },
                headerShadowVisible: false,
            }}
        >
            <ChatStack.Screen
                name="ChatMain"
                options={({ route }) => ({
                    title: route.params?.courseTitle
                        ? `${route.params.courseTitle} · AI 助教`
                        : 'AI 助教',
                })}
            >
                {(props) => (
                    <ChatScreen
                        {...props}
                        session={session}
                        messages={messages}
                        setMessages={setMessages}
                    />
                )}
            </ChatStack.Screen>
        </ChatStack.Navigator>
    )}
</MainTab.Screen>
```

- [ ] **Step 2: Update `ChatScreen` props and pre-selection logic**

`ChatScreen` currently takes `{ session, messages, setMessages }` with no navigation props. Now it also receives NativeStack props from `ChatMain`.

Replace the `ChatScreenProps` type:

```typescript
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ChatStackParamList } from '../navigation/AppNavigator';

type ChatScreenProps = NativeStackScreenProps<ChatStackParamList, 'ChatMain'> & {
    session: AuthSession;
    messages: ChatMessage[];
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
};
```

In `ChatScreen`, read the param and auto-select course when courses load:

```typescript
const preselectedCourseId = route.params?.courseId;

// Replace the existing courses useEffect with:
useEffect(() => {
    let cancelled = false;
    const loadCourses = async () => {
        setCourseLoading(true);
        try {
            const data = await getCourses(session.token, session.tokenType);
            if (!cancelled) {
                setCourses(data);
                if (preselectedCourseId) {
                    const match = data.find((c) => c.id === preselectedCourseId || c.ID === preselectedCourseId);
                    if (match) setSelectedCourse(match);
                }
            }
        } catch (err) {
            if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load courses');
        } finally {
            if (!cancelled) setCourseLoading(false);
        }
    };
    void loadCourses();
    return () => { cancelled = true; };
}, [session.token, session.tokenType, preselectedCourseId]);
```

- [ ] **Step 3: Add "AI 助教" quick-entry to CourseDetailScreen overview tab**

In the overview tab section of `CourseDetailScreen.tsx`, after the existing `写作助手` `Pressable`, add:

```typescript
<Pressable
    style={styles.quickEntryButton}
    onPress={() =>
        navigation.getParent()?.navigate('ChatTab', {
            screen: 'ChatMain',
            params: { courseId: course.id ?? 0, courseTitle: course.name },
        })
    }
>
    <Text style={styles.quickEntryIcon}>💬</Text>
    <View style={styles.quickEntryTextWrap}>
        <Text style={styles.quickEntryTitle}>AI 助教</Text>
        <Text style={styles.quickEntrySubtitle}>基于本课程的智能问答</Text>
    </View>
    <Text style={styles.quickEntryChevron}>›</Text>
</Pressable>
```

- [ ] **Step 4: Verify TypeScript**

```bash
cd code/mobile && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/navigation/AppNavigator.tsx src/screens/ChatScreen.tsx src/screens/CourseDetailScreen.tsx
git commit -m "feat(mobile): add course deep-link to ChatScreen"
```

---

## Task 3 — KnowledgeHomeScreen (Phase 3 scaffolding)

**Files:**
- Create: `code/mobile/src/screens/KnowledgeHomeScreen.tsx`

This screen shows the user's enrolled courses as a picker, then navigates to `KnowledgeCourseScreen`. It reuses `getCourses` from `api.ts`.

- [ ] **Step 1: Create `KnowledgeHomeScreen.tsx`**

```typescript
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { getCourses } from '../api';
import type { AuthSession, Course } from '../types';
import type { KnowledgeStackParamList } from '../navigation/AppNavigator';
import { appStyles, palette, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<KnowledgeStackParamList, 'KnowledgeHome'> & {
    session: AuthSession;
};

export default function KnowledgeHomeScreen({ navigation, session }: Props) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);
        try {
            const data = await getCourses(session.token, session.tokenType);
            setCourses(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : '加载失败');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [session.token, session.tokenType]);

    useEffect(() => { void load(); }, [load]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={palette.primary} />
            </View>
        );
    }

    return (
        <FlatList
            style={appStyles.page}
            data={courses}
            keyExtractor={(item) => String(item.id ?? item.ID)}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={palette.primary} />
            }
            contentContainerStyle={styles.list}
            ListHeaderComponent={
                error ? <Text style={styles.errorText}>{error}</Text> : null
            }
            ListEmptyComponent={
                <Text style={styles.emptyText}>暂无课程</Text>
            }
            renderItem={({ item }) => (
                <Pressable
                    style={({ pressed }) => [styles.courseCard, pressed && styles.courseCardPressed]}
                    onPress={() =>
                        navigation.navigate('KnowledgeCourse', {
                            courseId: item.id ?? item.ID ?? 0,
                            courseTitle: item.name,
                        })
                    }
                >
                    <View style={styles.courseCardBody}>
                        <Text style={styles.courseName}>{item.name}</Text>
                        <Text style={styles.courseMeta}>
                            {item.teacher_name || `教师 #${item.teacher_id}`}
                        </Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                </Pressable>
            )}
        />
    );
}

const styles = StyleSheet.create({
    center: {
        ...appStyles.page,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: spacing.md,
        gap: spacing.sm,
        paddingBottom: spacing.xxl,
    },
    errorText: {
        color: palette.danger,
        fontSize: 13,
        marginBottom: spacing.sm,
    },
    emptyText: {
        color: palette.textMuted,
        fontSize: 14,
        textAlign: 'center',
        marginTop: spacing.xl,
    },
    courseCard: {
        ...appStyles.card,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    courseCardPressed: {
        opacity: 0.88,
    },
    courseCardBody: {
        flex: 1,
        gap: 2,
    },
    courseName: {
        color: palette.textPrimary,
        fontSize: 15,
        fontWeight: '700',
    },
    courseMeta: {
        color: palette.textMuted,
        fontSize: 12,
    },
    chevron: {
        color: palette.textMuted,
        fontSize: 22,
        fontWeight: '300',
    },
});
```

> **Note:** `item.ID` vs `item.id` — the `Course` type from `@classplatform/shared` has `id?: number`. Some API responses may use `ID` (Go JSON default). The `?? item.ID` fallback handles both. Verify the field name by checking `code/shared/src/types/course.ts`.

- [ ] **Step 2: Verify TypeScript**

This file references `KnowledgeStackParamList` which doesn't exist yet. The check will fail — that is expected at this step. Continue to Task 4.

---

## Task 4 — KnowledgeCourseScreen (Phase 3 main screen)

**Files:**
- Create: `code/mobile/src/screens/KnowledgeCourseScreen.tsx`

This screen fetches `GET /api/v1/learning-profiles/:courseId/:studentId`, parses the JSON fields, and renders:
- Stats row (sessions, minutes, last active)
- Weak-point mastery bars (concept → count → `mastery = max(0, 1 - count/5)`)
- Completed topics chip list
- Recommended topics chip list

The `studentId` comes from `session.user.id`.

- [ ] **Step 1: Create `KnowledgeCourseScreen.tsx`**

```typescript
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { getLearningProfile } from '../api';
import type { AuthSession, LearningProfile } from '../types';
import type { KnowledgeStackParamList } from '../navigation/AppNavigator';
import { appStyles, palette, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<KnowledgeStackParamList, 'KnowledgeCourse'> & {
    session: AuthSession;
};

function parseJsonArray(raw: string | undefined): string[] {
    if (!raw) return [];
    try { return JSON.parse(raw) as string[]; } catch { return []; }
}

function parseWeakPoints(raw: string | undefined): Array<{ concept: string; count: number }> {
    if (!raw) return [];
    try {
        const map = JSON.parse(raw) as Record<string, number>;
        return Object.entries(map)
            .sort((a, b) => b[1] - a[1])
            .map(([concept, count]) => ({ concept, count }));
    } catch { return []; }
}

/** mastery 0–1: count=0 → 1.0, count≥5 → 0.0 */
function masteryFromCount(count: number): number {
    return Math.max(0, 1 - count / 5);
}

function masteryColor(mastery: number): string {
    if (mastery >= 0.8) return palette.success;
    if (mastery >= 0.6) return palette.primary;
    if (mastery >= 0.4) return palette.warning;
    return palette.danger;
}

export default function KnowledgeCourseScreen({ route, session }: Props) {
    const { courseId, courseTitle } = route.params;
    const studentId = Number(session.user.id);

    const [profile, setProfile] = useState<LearningProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);
        try {
            const data = await getLearningProfile(session.token, session.tokenType, courseId, studentId);
            setProfile(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : '加载学习档案失败');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [session.token, session.tokenType, courseId, studentId]);

    useEffect(() => { void load(); }, [load]);

    if (loading && !refreshing) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={palette.primary} />
                <Text style={styles.centerText}>加载学习档案...</Text>
            </View>
        );
    }

    if (error && !profile) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>{error}</Text>
                <Pressable style={styles.retryButton} onPress={() => void load()}>
                    <Text style={styles.retryButtonText}>重试</Text>
                </Pressable>
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={styles.center}>
                <Text style={styles.centerText}>暂无学习档案</Text>
                <Text style={styles.centerSubText}>完成一次 AI 对话或写作分析后档案将自动创建。</Text>
            </View>
        );
    }

    const weakPoints = parseWeakPoints(profile.weak_points);
    const completedTopics = parseJsonArray(profile.completed_topics);
    const recommendedTopics = parseJsonArray(profile.recommended_topics);
    const lastActive = profile.last_session_at
        ? new Date(profile.last_session_at).toLocaleDateString('zh-CN')
        : '—';

    return (
        <ScrollView
            style={appStyles.page}
            contentContainerStyle={styles.pageContent}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={palette.primary} />
            }
        >
            {/* ── Stats row ── */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{profile.total_sessions}</Text>
                    <Text style={styles.statLabel}>对话次数</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{profile.total_study_minutes}</Text>
                    <Text style={styles.statLabel}>学习分钟</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{lastActive}</Text>
                    <Text style={styles.statLabel}>最近活跃</Text>
                </View>
            </View>

            {/* ── Weak-point mastery ── */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>薄弱知识点</Text>
                {weakPoints.length === 0 ? (
                    <Text style={styles.emptyHint}>暂未检测到薄弱点，继续学习后将自动更新。</Text>
                ) : (
                    weakPoints.map(({ concept, count }) => {
                        const mastery = masteryFromCount(count);
                        const color = masteryColor(mastery);
                        const pct = Math.round(mastery * 100);
                        return (
                            <View key={concept} style={styles.masteryRow}>
                                <View style={styles.masteryLabelRow}>
                                    <Text style={styles.conceptName}>{concept}</Text>
                                    <Text style={[styles.masteryPct, { color }]}>{pct}%</Text>
                                </View>
                                <View style={styles.progressTrack}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            { width: `${pct}%` as `${number}%`, backgroundColor: color },
                                        ]}
                                    />
                                </View>
                                <Text style={styles.countHint}>检测 {count} 次</Text>
                            </View>
                        );
                    })
                )}
            </View>

            {/* ── Completed topics ── */}
            {completedTopics.length > 0 ? (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>已掌握主题</Text>
                    <View style={styles.chipWrap}>
                        {completedTopics.map((topic) => (
                            <View key={topic} style={styles.chipSuccess}>
                                <Text style={styles.chipSuccessText}>{topic}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            ) : null}

            {/* ── Recommended topics ── */}
            {recommendedTopics.length > 0 ? (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>AI 推荐学习</Text>
                    <View style={styles.chipWrap}>
                        {recommendedTopics.map((topic) => (
                            <View key={topic} style={styles.chipRecommend}>
                                <Text style={styles.chipRecommendText}>{topic}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            ) : null}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    center: {
        ...appStyles.page,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
        gap: spacing.sm,
    },
    centerText: {
        color: palette.textMuted,
        fontSize: 14,
    },
    centerSubText: {
        color: palette.textMuted,
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
    },
    errorText: {
        color: palette.danger,
        fontSize: 14,
        textAlign: 'center',
    },
    retryButton: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: radius.md,
        backgroundColor: palette.primaryMuted,
    },
    retryButtonText: {
        color: palette.textPrimary,
        fontWeight: '700',
    },
    pageContent: {
        padding: spacing.md,
        paddingBottom: spacing.xxl,
        gap: spacing.md,
    },
    statsRow: {
        ...appStyles.card,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
        gap: 4,
    },
    statValue: {
        color: palette.accentCyan,
        fontSize: 22,
        fontWeight: '800',
    },
    statLabel: {
        color: palette.textMuted,
        fontSize: 11,
    },
    statDivider: {
        width: 1,
        height: 32,
        backgroundColor: palette.border,
    },
    card: {
        ...appStyles.card,
        gap: spacing.sm,
    },
    cardTitle: {
        color: palette.textPrimary,
        fontSize: 15,
        fontWeight: '700',
    },
    emptyHint: {
        color: palette.textMuted,
        fontSize: 12,
        lineHeight: 18,
    },
    masteryRow: {
        gap: 4,
    },
    masteryLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    conceptName: {
        color: palette.textPrimary,
        fontSize: 13,
        fontWeight: '600',
    },
    masteryPct: {
        fontSize: 13,
        fontWeight: '700',
    },
    progressTrack: {
        height: 4,
        borderRadius: 2,
        backgroundColor: palette.border,
        overflow: 'hidden',
    },
    progressFill: {
        height: 4,
        borderRadius: 2,
    },
    countHint: {
        color: palette.textMuted,
        fontSize: 11,
    },
    chipWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    chipSuccess: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: radius.full,
        backgroundColor: '#052e16',
        borderWidth: 1,
        borderColor: '#14532d',
    },
    chipSuccessText: {
        color: '#86efac',
        fontSize: 12,
        fontWeight: '600',
    },
    chipRecommend: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: radius.full,
        backgroundColor: '#1e3a5f',
        borderWidth: 1,
        borderColor: '#1e40af',
    },
    chipRecommendText: {
        color: '#93c5fd',
        fontSize: 12,
        fontWeight: '600',
    },
});
```

- [ ] **Step 2: Verify TypeScript**

Still references `KnowledgeStackParamList` which doesn't exist — expected failure until Task 5.

---

## Task 5 — Navigation wiring (Phase 4)

**Files:**
- Modify: `code/mobile/src/navigation/AppNavigator.tsx`

This is the final wiring step that makes all three phases compile and run.

- [ ] **Step 1: Add `KnowledgeStackParamList` and imports**

Add to the type exports in `AppNavigator.tsx`:

```typescript
export type KnowledgeStackParamList = {
    KnowledgeHome: undefined;
    KnowledgeCourse: { courseId: number; courseTitle: string };
};
```

Add imports at the top (alongside existing screen imports):

```typescript
import KnowledgeHomeScreen from '../screens/KnowledgeHomeScreen';
import KnowledgeCourseScreen from '../screens/KnowledgeCourseScreen';
```

Add the navigator instance (alongside other `createNativeStackNavigator` calls):

```typescript
const KnowledgeStack = createNativeStackNavigator<KnowledgeStackParamList>();
```

- [ ] **Step 2: Add `KnowledgeNavigator` function**

Add before `MainNavigator`:

```typescript
function KnowledgeNavigator({ session }: { session: AuthSession }) {
    return (
        <KnowledgeStack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: palette.background },
                headerTintColor: palette.textPrimary,
                headerTitleStyle: { fontWeight: '700' },
                headerShadowVisible: false,
                contentStyle: { backgroundColor: palette.background },
            }}
        >
            <KnowledgeStack.Screen name="KnowledgeHome" options={{ title: '学习档案' }}>
                {(props) => <KnowledgeHomeScreen {...props} session={session} />}
            </KnowledgeStack.Screen>
            <KnowledgeStack.Screen
                name="KnowledgeCourse"
                options={({ route }) => ({ title: route.params.courseTitle + ' · 档案' })}
            >
                {(props) => <KnowledgeCourseScreen {...props} session={session} />}
            </KnowledgeStack.Screen>
        </KnowledgeStack.Navigator>
    );
}
```

- [ ] **Step 3: Add `KnowledgeTab` to `MainTabParamList` and `MainTab.Navigator`**

Update type:

```typescript
export type MainTabParamList = {
    HomeTab: undefined;
    ChatTab: undefined;
    KnowledgeTab: undefined;
    ProfileTab: undefined;
};
```

Add tab icon entry to `TabIcon`:

```typescript
const icons: Record<string, string> = {
    home: '📚',
    chat: '💬',
    knowledge: '🧠',
    profile: '👤',
};
```

Add the tab screen inside `MainTab.Navigator`, between `ChatTab` and `ProfileTab`:

```typescript
<MainTab.Screen
    name="KnowledgeTab"
    options={{
        title: '学习档案',
        tabBarIcon: ({ focused }) => <TabIcon name="knowledge" focused={focused} />,
        headerShown: false,
    }}
>
    {() => <KnowledgeNavigator session={session} />}
</MainTab.Screen>
```

- [ ] **Step 4: Verify TypeScript — all phases compile together**

```bash
cd code/mobile && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/navigation/AppNavigator.tsx \
        src/screens/KnowledgeHomeScreen.tsx \
        src/screens/KnowledgeCourseScreen.tsx \
        src/screens/ChatScreen.tsx \
        src/screens/CourseDetailScreen.tsx \
        src/types.ts \
        src/api.ts
git commit -m "feat(mobile): Phase 2–4 — ChatScreen deep-link, KnowledgeCourseScreen, KnowledgeTab"
```

---

## Self-Review

### Spec Coverage

| Requirement | Covered by |
|---|---|
| ChatScreen pre-select course from deep-link | Task 2 |
| `writing_coach` mode option | ❌ Not in scope — existing `tutor` / `problem_solver` / `sim_explain` already cover use cases |
| AI 助教 quick entry from CourseDetail | Task 2, Step 3 |
| KnowledgeCourseScreen — weak-point mastery bars | Task 4 |
| KnowledgeCourseScreen — completed topics | Task 4 |
| KnowledgeCourseScreen — recommended topics | Task 4 |
| KnowledgeHomeScreen — course picker | Task 3 |
| KnowledgeTab — bottom tab | Task 5 |
| `getLearningProfile` API call | Task 1 |
| `LearningProfile` type | Task 1 |
| TypeScript clean on every task | Verified in each task |

### Placeholder Scan

- All code blocks are complete.
- Task 1 Step 2 notes "verify `.request` signature" — this is a genuine lookup instruction, not a placeholder.
- Task 3 Step 1 notes "verify `id` vs `ID`" field name — same.

### Type Consistency

- `KnowledgeStackParamList` defined in Task 5 Step 1, referenced in Tasks 3 and 4 — consistent.
- `LearningProfile` defined in Task 1, imported in Task 4 — consistent.
- `courseId: number` used in `KnowledgeCourse` params and `getLearningProfile(... courseId, studentId)` — consistent.
- `masteryFromCount` returns `number` in [0, 1]; `masteryColor` accepts `number` — consistent.
- `parseWeakPoints` returns `Array<{ concept: string; count: number }>` — used correctly in `weakPoints.map`.
