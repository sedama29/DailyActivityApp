import React, { useEffect, useState } from 'react';
import {
  View, TextInput, Button, FlatList, Text, TouchableOpacity,
  Alert, StyleSheet, Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { fetchTodos, addTodo, toggleTodo, deleteTodo } from './utils';
import { format } from 'date-fns';

export default function TodoScreen({ route }) {
  const { email } = route.params;
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showCompleted, setShowCompleted] = useState(true);

  const loadTodos = async () => {
    const list = await fetchTodos(email);
    setTodos(list);
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const addNewTask = async () => {
    if (!task.trim()) return;
    await addTodo(email, task, format(date, 'yyyy-MM-dd'));
    setTask('');
    setDate(new Date());
    loadTodos();
  };

  const toggleTask = async (id, current) => {
    await toggleTodo(email, id, !current);
    loadTodos();
  };

  const deleteTask = async (id) => {
    Alert.alert('Delete Task', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await deleteTodo(email, id);
          loadTodos();
        }
      }
    ]);
  };

  const filteredTodos = todos.filter(todo => {
    if (!showCompleted && todo.done) return false;
    if (filter === 'today') {
      return todo.date === format(new Date(), 'yyyy-MM-dd');
    } else if (filter === 'leftover') {
      return !todo.done;
    }
    return true;
  });

  const renderItem = ({ item }) => (
    <View style={[styles.taskRow, item.done && styles.completedTask]}>
      <TouchableOpacity onPress={() => toggleTask(item.id, item.done)} style={styles.checkbox}>
        {item.done && <Text style={styles.checkmark}>✔</Text>}
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={[styles.taskText, item.done && styles.taskDone]}>
          {item.title}
        </Text>
        <Text style={styles.taskDate}>{item.date}</Text>
      </View>
      <TouchableOpacity onPress={() => deleteTask(item.id)}>
        <Text style={styles.deleteIcon}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>📝 Daily To-Do</Text>
      <TextInput
        value={task}
        onChangeText={setTask}
        placeholder="What's your next task?"
        placeholderTextColor="#aaa"
        style={styles.input}
      />

      <TouchableOpacity onPress={() => setShowPicker(true)}>
        <Text style={styles.datePicker}>{format(date, 'yyyy-MM-dd')}</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(e, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={addNewTask}>
        <Text style={styles.addButtonText}>Add Task</Text>
      </TouchableOpacity>

      <View style={styles.filters}>
        {['all', 'today', 'leftover'].map(key => (
          <TouchableOpacity key={key} onPress={() => setFilter(key)}>
            <Text style={[styles.filterBtn, filter === key && styles.activeFilter]}>
              {key.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={() => setShowCompleted(prev => !prev)}>
          <Text style={[styles.filterBtn, !showCompleted && styles.activeFilter]}>
            {showCompleted ? 'HIDE ✅' : 'SHOW ✅'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredTodos}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: '#999', marginTop: 20 }}>
            No tasks to display
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#e5faff',
  },
  heading: {
    fontSize: 24,
    marginBottom: 15,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#b2dffb',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    color: '#333'
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    padding: 12,
    backgroundColor: '#f5faff',
    borderRadius: 8,
    shadowColor: '#ccc',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 2
  },
  completedTask: { backgroundColor: '#dbe8ec' },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 5,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  checkmark: { color: '#007AFF', fontSize: 16, fontWeight: 'bold', lineHeight: 16 },
  taskText: { fontSize: 16, color: '#333' },
  taskDone: { textDecorationLine: 'line-through', color: '#888' },
  taskDate: { fontSize: 12, color: '#888' },
  deleteIcon: { fontSize: 18, color: 'red', paddingLeft: 10 },
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
    flexWrap: 'wrap',
    gap: 10,
  },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
    color: '#007AFF',
    fontSize: 14,
    marginHorizontal: 4
  },
  activeFilter: {
    backgroundColor: '#007AFF',
    color: '#fff',
    fontWeight: 'bold'
  },
  datePicker: {
    marginBottom: 12,
    color: '#007AFF',
    fontSize: 15,
    textAlign: 'center'
  },
  addButton: {
    backgroundColor: '#00c6ff',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
