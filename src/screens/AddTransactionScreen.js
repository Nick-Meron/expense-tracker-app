import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiRequest } from '../api';

function today() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

export default function AddTransactionScreen({ token, onClose, onSaved }) {
  const [type, setType] = useState('expense');
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(null);
  const [newCategory, setNewCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(today());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await apiRequest('/categories', { token });
        setCategories(data);
      } catch (e) {
        Alert.alert('Error', e.message);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, [token]);

  const visibleCategories = categories.filter((c) => c.type === type);

  function switchType(newType) {
    setType(newType);
    setCategoryId(null);
  }

  async function addCategory() {
    const name = newCategory.trim();
    if (!name) return;
    try {
      const created = await apiRequest('/categories', {
        method: 'POST',
        token,
        body: { name, type },
      });
      setCategories([...categories, created]);
      setCategoryId(created.id);
      setNewCategory('');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  }

  async function save() {
    if (!categoryId) {
      Alert.alert('Missing category', 'Pick a category or create a new one.');
      return;
    }
    setBusy(true);
    try {
      await apiRequest('/transactions', {
        method: 'POST',
        token,
        body: {
          category_id: categoryId,
          amount: amount.replace(',', '.'),
          note: note.trim() || null,
          date: date.trim(),
        },
      });
      onSaved();
    } catch (e) {
      Alert.alert('Error', e.message);
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Add transaction</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[
              styles.toggle,
              type === 'expense' && styles.toggleExpenseActive,
            ]}
            onPress={() => switchType('expense')}
          >
            <Text
              style={[
                styles.toggleText,
                type === 'expense' && styles.toggleTextActive,
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggle,
              type === 'income' && styles.toggleIncomeActive,
            ]}
            onPress={() => switchType('income')}
          >
            <Text
              style={[
                styles.toggleText,
                type === 'income' && styles.toggleTextActive,
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Category</Text>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <View style={styles.chips}>
            {visibleCategories.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[styles.chip, categoryId === c.id && styles.chipActive]}
                onPress={() => setCategoryId(c.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    categoryId === c.id && styles.chipTextActive,
                  ]}
                >
                  {c.name}
                </Text>
              </TouchableOpacity>
            ))}
            {visibleCategories.length === 0 && (
              <Text style={styles.hint}>
                No {type} categories yet. Create one below.
              </Text>
            )}
          </View>
        )}

        <View style={styles.newCategoryRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder={`New ${type} category`}
            value={newCategory}
            onChangeText={setNewCategory}
          />
          <TouchableOpacity style={styles.addCategoryButton} onPress={addCategory}>
            <Text style={styles.addCategoryText}>Add</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Amount</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Note (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Lunch, bus fare, salary..."
          value={note}
          onChangeText={setNote}
        />

        <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[styles.saveButton, busy && styles.saveDisabled]}
          onPress={save}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: { fontSize: 20, fontWeight: 'bold' },
  cancel: { fontSize: 16, color: '#2563eb' },
  form: { padding: 20, paddingBottom: 60 },
  toggleRow: { flexDirection: 'row', marginBottom: 16 },
  toggle: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
  },
  toggleExpenseActive: { backgroundColor: '#dc2626' },
  toggleIncomeActive: { backgroundColor: '#16a34a' },
  toggleText: { fontSize: 16, fontWeight: '600', color: '#444' },
  toggleTextActive: { color: '#fff' },
  label: { fontSize: 14, color: '#666', marginBottom: 6, marginTop: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: { backgroundColor: '#2563eb' },
  chipText: { fontSize: 15, color: '#333' },
  chipTextActive: { color: '#fff' },
  hint: { color: '#888', fontSize: 14 },
  newCategoryRow: { flexDirection: 'row', alignItems: 'center' },
  addCategoryButton: {
    marginLeft: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#2563eb',
    borderRadius: 8,
  },
  addCategoryText: { color: '#fff', fontWeight: '600' },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  saveButton: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveDisabled: { opacity: 0.6 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});