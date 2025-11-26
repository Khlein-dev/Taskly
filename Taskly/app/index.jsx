import { View, Text, TextInput, Pressable, StyleSheet, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState } from 'react';

import { LinearGradient } from 'expo-linear-gradient';

import { todos as data } from '@/data/todo';

export default function Index() {
    const [todos, setTodos] = useState(data.sort((a, b) => b.id - a.id));
    const [text, setText] = useState('');

    const addTodo = () => {
        if (text.trim()) {
            const newId = todos.length > 0 ? todos[0].id + 1 : 1;
            setTodos([{ id: newId, title: text, description: '', completed: false }, ...todos]);
            setText('');
        }
    }

    const toggleTodo = (id) => {
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
    }

    const removeTodo = (id) => {
        setTodos(todos.filter(todo => todo.id !== id));
    }

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#241b52ff', '#07031bff', '#000000ff']}
                start={{ x: 0, y: 0 }}  
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.Inputcontainer}>
                    <TextInput style={styles.input} placeholder='Add a Task' placeholderTextColor='gray' value={text} onChangeText={setText} />

                    <Pressable onPress={addTodo} style={styles.addBtn}>
                        <Text style={styles.addTxt}>Add Todo</Text>
                    </Pressable>
                </View>

                {/* Render todo items */}
                <FlatList
                    data={todos}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.todoItem}>
                            <Pressable onPress={() => toggleTodo(item.id)} style={[styles.todoTextContainer, item.completed && styles.completed]}>
                                <Text style={[styles.todoTitle, item.completed && styles.completedText]}>{item.title}</Text>
                            </Pressable>
                            <Pressable onPress={() => removeTodo(item.id)} style={styles.removeBtn}>
                                <Text style={styles.removeTxt}>Remove</Text>
                            </Pressable>
                        </View>
                    )}
                    style={styles.list}
                    keyboardShouldPersistTaps='handled'
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
    Inputcontainer: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 16,
        alignItems: 'center',
    },
    input: {
        flex: 1,
        height: 40,
        backgroundColor: '#150f36ff',
        color: 'white',
        paddingHorizontal: 10,
        borderRadius: 4,
        marginRight: 8,
    },
    addBtn: {
        backgroundColor: 'purple',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 4,
    },
    addTxt: {
        color: 'white',
        fontWeight: 'bold',
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
    },
    completed: {
        opacity: 0.5,
    },
    completedText: {
        textDecorationLine: 'line-through',
    },
    removeBtn: {
        backgroundColor: 'red',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 4,
        marginLeft: 10,
    },
    removeTxt: {
        color: 'white',
        fontWeight: 'bold',
    },
});