import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useMemo, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Inter_500Medium, useFonts } from '@expo-google-fonts/inter';
import { PieChart } from 'react-native-chart-kit';
import { todos as data } from '@/data/todo';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export default function Index() {
  const [todos, setTodos] = useState(() => [...data].sort((a, b) => b.id - a.id));
  const [text, setText] = useState('');
  const [description, setDescription] = useState('');
  const [showSheet, setShowSheet] = useState(false);

  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  const [loaded] = useFonts({
    Inter_500Medium,
    Heavitas: require('@/assets/Fonts/Heavitas.ttf'),
    Gulam: require('@/assets/Fonts/Gulam.otf'),
  });

  const animateSheet = useCallback(
    (open) => {
      Animated.timing(slideAnim, {
        toValue: open ? 0 : screenHeight,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        if (!open) setShowSheet(false);
      });
    },
    [slideAnim]
  );

  const openSheet = useCallback(() => {
    Keyboard.dismiss();
    setShowSheet(true);
    animateSheet(true);
  }, [animateSheet]);

  const closeSheet = useCallback(() => {
    Keyboard.dismiss();
    animateSheet(false);
  }, [animateSheet]);

  const addTodo = useCallback(() => {
    const title = text.trim();
    if (!title) return;

    setTodos((prev) => {
      const maxId = prev.reduce((m, t) => Math.max(m, t.id), 0);
      const newId = maxId + 1;
      return [{ id: newId, title, description, completed: false }, ...prev];
    });

    setText('');
    setDescription('');
    closeSheet();
  }, [text, description, closeSheet]);

  const toggleTodo = useCallback((id) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo))
    );
  }, []);

  const removeTodo = useCallback((id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  const completedCount = useMemo(() => todos.filter((t) => t.completed).length, [todos]);
  const totalCount = todos.length;
  const progressPercentage = useMemo(() => (totalCount ? (completedCount / totalCount) * 100 : 0), [
    totalCount,
    completedCount,
  ]);

  const chartData = useMemo(
    () => [
      {
        name: 'Completed',
        population: completedCount,
        color: '#c34502ff',
        legendFontColor: '#FFF',
        legendFontSize: 18,
      },
      {
        name: 'Incomplete',
        population: totalCount - completedCount,
        color: '#0c0222ff',
        legendFontColor: '#FFF',
        legendFontSize: 18,
      },
    ],
    [completedCount, totalCount]
  );

  const extraListBottomPadding = 260;

  if (!loaded) return null;

  return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={['#241b52', '#07031b', '#000']} style={styles.gradient}>
                <Text style={styles.Header}>TASKLY</Text>

                {/* ADD BUTTON WITH GLOW */}
                <View style={styles.glowWrapper}>
                    <Pressable onPress={openSheet} style={styles.addButton}>
                        <Text style={styles.addButtonText}><FontAwesome name="plus" size={24} color="white" /></Text>
                    </Pressable>
                </View>

                {/* PIECHART WITH GLOW */}
                <View style={styles.chartGlow}>
                    <PieChart
                        data={chartData}
                        width={screenWidth - 10}
                        height={250}
                        chartConfig={{
                            color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
                            labelColor: (opacity = 1) => `rgba(255,255,255,${opacity})`,
                        }}
                        accessor="population"
                        backgroundColor="transparent"
                        paddingLeft="20"
                        absolute
                        fontFamily="Inter_500Medium"
                    />
                </View>

                <View style={styles.progressCircle}>
                    <Text style={styles.progressText}>{Math.round(progressPercentage)}%</Text>
                </View>

                {/* TASK LIST */}
                <FlatList
                    data={todos}
                    style={{ width: '100%', borderBlockColor: 'transparent', marginTop: 10 }}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: extraListBottomPadding }}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyTitle}>No tasks yet</Text>
                            <Text style={styles.emptySubtitle}>Tap + to add your first todo.</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.todoItem}>
                            <Pressable
                                onPress={() => toggleTodo(item.id)}
                                style={[styles.todoTextContainer, item.completed && { opacity: 0.5 }]}
                                accessibilityRole="button"
                                accessibilityLabel={item.completed ? 'Mark as incomplete' : 'Mark as completed'}
                            >
                                <Text style={[styles.todoTitle, item.completed && styles.completedText]}>{item.title}</Text>
                                {item.description ? (
                                    <Text style={[styles.todoDescription, item.completed && styles.completedText]}>
                                        {item.description}
                                    </Text>
                                ) : null}
                            </Pressable>

                            <Pressable
                                onPress={() => removeTodo(item.id)}
                                hitSlop={10}
                                accessibilityRole="button"
                                accessibilityLabel="Delete todo"
                                style={styles.trashButton}
                            >
                                <Feather name="trash-2" size={22} color="#a10606ff" />
                            </Pressable>
                        </View>
                    )}
                />

                {/* SLIDE-UP ADD TODO FORM */}
                {showSheet && (
                    <>
                        <Pressable style={styles.sheetOverlay} onPress={closeSheet} />
                        <Animated.View
                            style={[styles.bottomSheet, { transform: [{ translateY: slideAnim }] }]}
                        >
                            <KeyboardAvoidingView
                                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                                style={{ width: '100%' }}
                            >
                                <Text style={styles.sheetTitle}>Add Todo</Text>

                                <TextInput
                                    style={styles.sheetInput}
                                    placeholder="Task Title"
                                    placeholderTextColor="gray"
                                    value={text}
                                    onChangeText={setText}
                                    autoCapitalize="sentences"
                                    returnKeyType="done"
                                    onSubmitEditing={addTodo}
                                />

                                <TextInput
                                    style={[styles.sheetInput, styles.descriptionInput]}
                                    placeholder="Description (optional)"
                                    placeholderTextColor="gray"
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                />

                                {/* SUBMIT BUTTON WITH GLOW */}
                                <View style={styles.glowWrapperSubmit}>
                                    <Pressable style={styles.submitBtn} onPress={addTodo}>
                                        <Text style={styles.submitText}>Submit</Text>
                                    </Pressable>
                                </View>

                                <Pressable style={styles.closeBtn} onPress={closeSheet}>
                                    <Text style={styles.closeText}>Close</Text>
                                </Pressable>
                            </KeyboardAvoidingView>
                        </Animated.View>
                    </>
                )}
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    gradient: { flex: 1, alignItems: 'center', padding: 16 },

    Header: {
        fontSize: 45,
        fontFamily: 'Heavitas',
        color: 'white',
        right: 80,
        letterSpacing: 6,
        marginBottom: 10,
    },

    progressCircle: {
        position: 'absolute',
        backgroundColor: '#150f36',
        borderRadius: 100,
        width: 160,
        height: 160,
        color: 'white',
        left: (screenWidth / 2) - 160,
        top: 135,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 20,
    },
    progressText: {
        textAlign: 'center',
        color: 'white',
        fontSize: 40,
        fontFamily: 'Inter_500Medium',
    },

    /* PIECHART GLOW */
    chartGlow: {
        backgroundColor: '#150f36',
        padding: 5,
        borderTopRightRadius: 100,
        borderBottomLeftRadius: 100,
        alignSelf: 'center',
        elevation: 25,
        marginBottom: 10,
    },

    /* GLOW WRAPPER FOR BUTTONS */
    glowWrapper: {
        position: 'absolute',
        top: 20,
        right: 20,
        shadowColor: '#c34502ff',
        shadowOpacity: 1,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 0 },
        elevation: 15,
        borderRadius: 10,
        marginBottom: 10,
    },

    glowWrapperSubmit: {
        shadowColor: '#c34502ff',
        height: 45,
        shadowOpacity: 1,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 0 },
        elevation: 15,
        borderRadius: 10,
        marginBottom: 10,
    },

    addButton: {
        width: 100,
        backgroundColor: '#c34502ff',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 6,
        alignContent: 'center',
        alignItems: 'center',
    },
    addButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

    todoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#0f0832',
        padding: 12,
        borderRadius: 5,
        marginBottom: 8,
    },

    todoTextContainer: { flex: 1 },
    todoTitle: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    todoDescription: { color: 'gray', marginTop: 4 },
    completedText: { textDecorationLine: 'line-through' },

    trashButton: {
        padding: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },

    emptyState: {
        marginTop: 40,
        padding: 16,
        backgroundColor: '#0f0832',
        borderRadius: 10,
        alignItems: 'center',
        gap: 6,
    },
    emptyTitle: { color: 'white', fontWeight: 'bold', fontSize: 18 },
    emptySubtitle: { color: 'gray', textAlign: 'center' },

    /* BOTTOM SHEET */
    sheetOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.35)',
    },
    bottomSheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#0f0a2bff',
        padding: 20,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        elevation: 20,
    },
    sheetTitle: {
        fontSize: 20,
        color: 'white',
        fontWeight: 'bold',
        marginBottom: 15,
    },
    sheetInput: {
        backgroundColor: '#150f36',
        color: 'white',
        padding: 10,
        borderRadius: 6,
        marginBottom: 12,
    },
    descriptionInput: { height: 80, textAlignVertical: 'top' },

    submitBtn: {
        backgroundColor: '#c34502ff',
        height: 45,
        padding: 12,
        borderRadius: 6,
        alignItems: 'center',
        marginBottom: 10,
    },
    submitText: { color: 'white', fontWeight: 'bold' },

    closeBtn: {
        backgroundColor: '#444',
        padding: 10,
        borderRadius: 6,
        alignItems: 'center',
    },
    closeText: { color: 'white' },
});
