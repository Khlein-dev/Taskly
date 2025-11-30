import { View, Text, TextInput, Pressable, StyleSheet, FlatList, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Inter_500Medium, useFonts } from "@expo-google-fonts/inter";
import { PieChart } from 'react-native-chart-kit';
import { todos as data } from '@/data/todo';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export default function Index() {
    const [todos, setTodos] = useState(data.sort((a, b) => b.id - a.id));
    const [text, setText] = useState('');
    const [description, setDescription] = useState('');
    const [showSheet, setShowSheet] = useState(false);

    const slideAnim = useRef(new Animated.Value(screenHeight)).current;

    const [loaded] = useFonts({ Inter_500Medium });

    if (!loaded) return null;

    const animateSheet = (open) => {
        Animated.timing(slideAnim, {
            toValue: open ? 0 : screenHeight,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            if (!open) setShowSheet(false);
        });
    };

    const openSheet = () => {
        setShowSheet(true);
        animateSheet(true);
    };

    const closeSheet = () => {
        animateSheet(false);
    };

    const addTodo = () => {
        if (text.trim()) {
            const newId = todos.length ? todos[0].id + 1 : 1;
            setTodos([{ id: newId, title: text, description, completed: false }, ...todos]);
            setText('');
            setDescription('');
            closeSheet();
        }
    };

    const toggleTodo = (id) => {
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
    };

    const removeTodo = (id) => {
        setTodos(todos.filter(todo => todo.id !== id));
    };

    const completedCount = todos.filter(t => t.completed).length;
    const totalCount = todos.length;
    const progressPercentage = totalCount ? (completedCount / totalCount) * 100 : 0;

    const chartData = [
        { name: 'Completed', population: completedCount, color: '#72c717ff', legendFontColor: '#FFF', legendFontSize: 15 },
        { name: 'Incomplete', population: totalCount - completedCount, color: '#FF5722', legendFontColor: '#FFF', legendFontSize: 15 },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={['#241b52', '#07031b', '#000']} style={styles.gradient}>
                <Text style={styles.Header}>My Tasks are</Text>

                {/* Pie Chart */}
                <View style={styles.chartContainer}>
                    <Text style={styles.progressText}>Progress: {Math.round(progressPercentage)}%</Text>

                    <PieChart
                        data={chartData}
                        width={screenWidth - 20}
                        height={220}
                        chartConfig={{
                            backgroundColor: '#241b52',
                            backgroundGradientFrom: '#241b52',
                            backgroundGradientTo: '#07031b',
                            color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
                            labelColor: (opacity = 1) => `rgba(255,255,255,${opacity})`,
                        }}
                        accessor="population"
                        backgroundColor="transparent"
                        paddingLeft="20"
                        absolute
                    />
                </View>

                {/* Add Todo Button */}
                <Pressable onPress={openSheet} style={styles.addButton}>
                    <Text style={styles.addButtonText}>Add Todo</Text>
                </Pressable>

                {/* Task List */}
                <FlatList
                    data={todos}
                    style={{ width: '100%' }}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.todoItem}>
                            <Pressable onPress={() => toggleTodo(item.id)} style={[styles.todoTextContainer, item.completed && { opacity: 0.5 }]}>
                                <Text style={[styles.todoTitle, item.completed && styles.completedText]}>{item.title}</Text>
                                {item.description ? (
                                    <Text style={[styles.todoDescription, item.completed && styles.completedText]}>
                                        {item.description}
                                    </Text>
                                ) : null}
                            </Pressable>

                            <Pressable onPress={() => removeTodo(item.id)}>
                                <LinearGradient colors={['#e64602', '#b90101', '#4b0404']} style={styles.removeBtn}>
                                    <FontAwesome name="remove" size={22} color="white" />
                                </LinearGradient>
                            </Pressable>
                        </View>
                    )}
                />

                {/* SLIDE-UP ABSOLUTE ADD TODO FORM */}
                {showSheet && (
                    <Animated.View
                        style={[
                            styles.bottomSheet,
                            { transform: [{ translateY: slideAnim }] }
                        ]}
                    >
                        <Text style={styles.sheetTitle}>Add Todo</Text>

                        <TextInput
                            style={styles.sheetInput}
                            placeholder="Task Title"
                            placeholderTextColor="gray"
                            value={text}
                            onChangeText={setText}
                        />

                        <TextInput
                            style={[styles.sheetInput, styles.descriptionInput]}
                            placeholder="Description (optional)"
                            placeholderTextColor="gray"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                        />

                        <Pressable style={styles.submitBtn} onPress={addTodo}>
                            <Text style={styles.submitText}>Submit</Text>
                        </Pressable>

                        <Pressable style={styles.closeBtn} onPress={closeSheet}>
                            <Text style={styles.closeText}>Close</Text>
                        </Pressable>
                    </Animated.View>
                )}
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    gradient: { flex: 1, alignItems: 'center', padding: 16 },
    Header: {
        fontSize: 32,
        color: 'white',
        fontFamily: 'Inter_500Medium',
        letterSpacing: 3,
        marginBottom: 10,
    },
    chartContainer: { alignItems: 'center', marginBottom: 20 },
    progressText: { color: 'white', fontSize: 18, fontFamily: 'Inter_500Medium' },

    addButton: {
        backgroundColor: '#72c717ff',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 6,
        marginBottom: 10,
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

    removeBtn: {
        padding: 8,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },

    /* BOTTOM SHEET */
    bottomSheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#241b52',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
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
        backgroundColor: '#72c717ff',
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
