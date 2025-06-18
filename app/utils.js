import database from '@react-native-firebase/database';

const normalizeEmail = (email) => email.replace(/\./g, ',');

export const fetchTodos = async (email) => {
  try {
    const emailKey = normalizeEmail(email);
    console.log('📥 Fetching todos for:', emailKey);

    const snapshot = await database().ref(`todos/${emailKey}`).once('value');

    if (!snapshot.exists()) {
      console.log('❌ No data found');
      return [];
    }

    const data = snapshot.val();
    console.log('✅ Data found:', data);

    return Object.entries(data).map(([id, task]) => ({ id, ...task }));
  } catch (err) {
    console.error('❌ Error fetching todos:', err.message);
    return [];
  }
};

export const addTodo = async (email, title, date = null) => {
  try {
    const emailKey = normalizeEmail(email);
    const fullPath = `todos/${emailKey}`;
    const newRef = database().ref(fullPath).push();

    const taskData = {
      title,
      done: false,
      date: date || new Date().toISOString().split('T')[0],
    };

    console.log('🆕 Adding task:', taskData);
    await newRef.set(taskData);
    console.log('✅ Task added successfully!');
  } catch (err) {
    console.error('❌ Failed to add task:', err.message);
  }
};

export const toggleTodo = async (email, id, done) => {
  try {
    const emailKey = normalizeEmail(email);
    const path = `todos/${emailKey}/${id}`;

    console.log(`🔄 Toggling task ${id} to done: ${done}`);
    await database().ref(path).update({ done });

    console.log('✅ Toggle successful!');
  } catch (err) {
    console.error('❌ Failed to toggle task:', err.message);
  }
};

export const deleteTodo = async (email, id) => {
  try {
    const emailKey = normalizeEmail(email);
    const path = `todos/${emailKey}/${id}`;

    console.log('🗑️ Deleting task at:', path);
    await database().ref(path).remove();
    console.log('✅ Successfully deleted task!');
  } catch (err) {
    console.error('❌ Failed to delete task:', err.message);
  }
};
