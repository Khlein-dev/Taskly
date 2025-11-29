import { View, Text, TextInput, Pressable, StyleSheet, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Inter_500Medium, useFonts } from "@expo-google-fonts/inter";
import { PieChart } from 'react-native-chart-kit'; // For the donut chart
import { todos as data } from '@/data/todo';

const screenWidth = Dimensions.get('window').width;

export default function Index() {
    const [todos, setTodos] = useState(data.sort((a, b) => b.id - a.id));
    const [text, setText] = useState('');
    const [description, setDescription] = useState(''); // New state for description

    const [loaded, error] = useFonts({
        Inter_500Medium,
    });

    if (!loaded && !error) {
        return null;
    }

    const addTodo = () => {
        if (text.trim()) {
            const newId = todos.length > 0 ? todos[0].id + 1 : 1;
            setTodos([{ id: newId, title: text, description: description.trim() || '', completed: false }, ...todos]);
            setText('');
            setDescription(''); // Reset description
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

    // Calculate progress for the donut chart
    const completedCount = todos.filter(todo => todo.completed).length;
    const totalCount = todos.length;
    const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    // Data for the donut chart
    const chartData = [
        {
            name: 'Completed',
            population: completedCount,
            color: '#4CAF50', // Green for completed
            legendFontColor: '#FFF',
            legendFontSize: 15,


        },
        {
            name: 'Incomplete',
            population: totalCount - completedCount,
            color: '#FF5722', // Red for incomplete
            legendFontColor: '#FFF',
            legendFontSize: 15,
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#241b52ff', '#07031bff', '#000000ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.Inputcontainer}>
                    <View style={styles.inputGroup}>
                        <TextInput
                            style={styles.input}
                            placeholder='Add a Task Title'
                            placeholderTextColor='gray'
                            value={text}
                            onChangeText={setText}
                        />
                        <TextInput
                            style={[styles.input, styles.descriptionInput]}
                            placeholder='Add a Description (optional)'
                            placeholderTextColor='gray'
                            value={description}
                            onChangeText={setDescription}
                            multiline
                        />
                    </View>
                    <Pressable onPress={addTodo} style={styles.addBtn}>
                        <Text style={styles.addTxt}>Add Todo</Text>
                    </Pressable>
                </View>

                <Text style={styles.Header}>My Tasks are</Text>

                {/* Donut Chart for Progress */}
                <View style={styles.chartContainer}>
                    <Text style={styles.progressText}>Progress: {Math.round(progressPercentage)}%</Text>
                    <PieChart style={styles.chart}
                        data={chartData}
                        width={screenWidth * 120 / 100} // 100% of screen width
                        height={220}
                        chartConfig={{
                            backgroundColor: '#241b52ff',
                            backgroundGradientFrom: '#241b52ff',
                            backgroundGradientTo: '#07031bff',
                            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        }}
                        accessor="population"
                        backgroundColor="transparent"
                        paddingLeft="15"
                        absolute // Show absolute values
                        hasLegend={true}
                        donut // Makes it a donut chart
                        center={[50, 10]} // Adjust center for donut effect
                    />
                </View>

                {/* Render todo items */}
                <FlatList
                    data={todos}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.todoItem}>
                            <Pressable onPress={() => toggleTodo(item.id)} style={[styles.todoTextContainer, item.completed && styles.completed]}>
                                <Text style={[styles.todoTitle, item.completed && styles.completedText]}>{item.title}</Text>
                                {item.description ? (
                                    <Text style={[styles.todoDescription, item.completed && styles.completedText]}>{item.description}</Text>
                                ) : null}
                            </Pressable>
                            <Pressable onPress={() => removeTodo(item.id)} style={styles.removeBtnContainer}>
                                <LinearGradient
                                    colors={['#e64602ff', '#b90101ff', '#4b0404ff']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.removeBtn}
                                >
                                    <FontAwesome name="remove" size={24} color="white" />
                                </LinearGradient>
                            </Pressable>
                        </View>
                    )}
                    style={styles.list}
                    keyboardShouldPersistTaps='handled'
                    ListEmptyComponent={<Text style={styles.emptyText}>No tasks yet. Add one above!</Text>}
                />
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
    gradient: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
    },
    Header: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        fontFamily: 'Inter_500Medium',
        letterSpacing: 3,
        marginBottom: 10,
    },
    Inputcontainer: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 16,
        alignItems: 'center',
    },
    inputGroup: {
        flex: 1,
        marginRight: 8,
    },
    input: {
        height: 40,
        backgroundColor: '#150f36ff',
        color: 'white',
        fontFamily: 'Inter_500Medium',
        paddingHorizontal: 10,
        borderRadius: 4,
        marginBottom: 8,
    },
    descriptionInput: {
        height: 60, // Taller for multiline
        textAlignVertical: 'top',
    },
    addBtn: {
        backgroundColor: '#150f36ff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 4,
        justifyContent: 'center',
    },
    addTxt: {
        color: 'white',
        fontWeight: 'bold',
    },
    chartContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    chart: {
        right: 25,
    },
    progressText: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'Inter_500Medium',
        marginBottom: 10,
    },
    list: {
        width: '100%',
    },
    todoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#0f0832ff',
        padding: 12,
        borderRadius: 4,
        marginBottom: 8,
    },
    todoTextContainer: {
        flex: 1,
    },
    todoTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    todoDescription: {
        color: 'gray',
        fontSize: 14,
        marginTop: 4,
    },
    completed: {
        opacity: 0.5,
    },
    completedText: {
        textDecorationLine: 'line-through',
    },
    removeBtnContainer: {
        marginLeft: 10,
    },
    removeBtn: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: 'gray',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
});