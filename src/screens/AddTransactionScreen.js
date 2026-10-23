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
import { CURRENCY } from '../config';
import { colors, fonts, categoryColor } from '../theme';

function today() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

function Field({ label, hint, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, focused && styles.inputFocused]}
        placeholderTextColor={colors.stone}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
    </View>
  );
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
        Alert.alert('Could not load categories', e.message);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, [token]);

  const visibleCategories = categories.filter((c) => c.type === type);
  const typeColor = type === 'income' ? colors.leaf : colors.brick;

  function switchType(newType) {
    setType(newType);
    setCategoryId(null);
  }

  async function addCategory() {
    const name = newCategory.trim();
    if (!name) {
      Alert.alert('Category name is empty', 'Type a name, then tap Add.');
      return;
    }
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
      Alert.alert('Could not add category', e.message);
    }
  }

  async function save() {
    const cleanAmount = amount.replace(',', '.').trim();

    if (!cleanAmount || Number(cleanAmount) <= 0) {
      Alert.alert('Enter an amount', 'The amount must be greater than 0.');
      return;
    }
    if (!categoryId) {
      Alert.alert('Pick a category', 'Choose a category, or add a new one.');
      return;
    }

    setBusy(true);
    try {
      await apiRequest('/transactions', {
        method: 'POST',
        token,
        body: {
          category_id: categoryId,
          amount: cleanAmount,
          note: note.trim() || null,
          date: date.trim(),
        },
      });
      onSaved();
    } catch (e) {
      Alert.alert('Could not save', e.message);
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.title}>New transaction</Text>
        <TouchableOpacity
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[
              styles.segment,
              type === 'expense' && { backgroundColor: colors.brick },
            ]}
            onPress={() => switchType('expense')}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.segmentText, type === 'expense' && styles.segmentTextOn]}
            >
              Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segment,
              type === 'income' && { backgroundColor: colors.leaf },
            ]}
            onPress={() => switchType('income')}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.segmentText, type === 'income' && styles.segmentTextOn]}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Amount</Text>
        <View style={styles.amountRow}>
          {CURRENCY ? (
            <Text style={[styles.currency, { color: typeColor }]}>{CURRENCY}</Text>
          ) : null}
          <TextInput
            style={[styles.amountInput, { color: typeColor }]}
            placeholder="0.00"
            placeholderTextColor={colors.line}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
        </View>

        <Text style={[styles.label, styles.sectionGap]}>Category</Text>
        {loading ? (
          <ActivityIndicator color={colors.pine} style={{ alignSelf: 'flex-start' }} />
        ) : (
          <View style={styles.chips}>
            {visibleCategories.map((c) => {
              const selected = categoryId === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.chip, selected && styles.chipOn]}
                  onPress={() => setCategoryId(c.id)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[styles.chipDot, { backgroundColor: categoryColor(c.id) }]}
                  />
                  <Text style={[styles.chipText, selected && styles.chipTextOn]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {visibleCategories.length === 0 && (
              <Text style={styles.emptyHint}>
                No {type} categories yet. Add one below.
              </Text>
            )}
          </View>
        )}

        <View style={styles.newCategoryRow}>
          <TextInput
            style={[styles.input, styles.newCategoryInput]}
            placeholder={`New ${type} category`}
            placeholderTextColor={colors.stone}
            value={newCategory}
            onChangeText={setNewCategory}
          />
          <TouchableOpacity
            style={styles.addCategoryButton}
            onPress={addCategory}
            activeOpacity={0.8}
          >
            <Text style={styles.addCategoryText}>Add</Text>
          </TouchableOpacity>
        </View>

        <Field
          label="Note (optional)"
          value={note}
          onChangeText={setNote}
          placeholder="Lunch, bus fare, salary..."
        />

        <Field
          label="Date"
          hint="Format: YYYY-MM-DD"
          value={date}
          onChangeText={setDate}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[styles.saveButton, busy && styles.saveDisabled]}
          onPress={save}
          disabled={busy}
          activeOpacity={0.85}
        >
          {busy ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.saveText}>Save transaction</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: { fontFamily: fonts.extrabold, fontSize: 26, color: colors.ink },
  cancel: { fontFamily: fonts.semibold, fontSize: 16, color: colors.pine },

  form: { paddingHorizontal: 24, paddingBottom: 60 },

  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.line,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  segment: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 9,
    alignItems: 'center',
  },
  segmentText: { fontFamily: fonts.semibold, fontSize: 16, color: colors.stone },
  segmentTextOn: { color: colors.white },

  label: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.stone,
    marginBottom: 6,
  },
  sectionGap: { marginTop: 20 },

  amountRow: { flexDirection: 'row', alignItems: 'center' },
  currency: {
    fontFamily: fonts.extrabold,
    fontSize: 30,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontFamily: fonts.extrabold,
    fontSize: 52,
    paddingVertical: 4,
  },

  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.white,
    marginRight: 8,
    marginBottom: 8,
  },
  chipOn: { backgroundColor: colors.saffron, borderColor: colors.saffron },
  chipDot: { width: 9, height: 9, borderRadius: 5, marginRight: 8 },
  chipText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.ink },
  chipTextOn: { color: colors.pine },
  emptyHint: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.stone,
    marginBottom: 8,
  },

  newCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  newCategoryInput: { flex: 1 },
  addCategoryButton: {
    marginLeft: 8,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.pine,
  },
  addCategoryText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.pine,
  },

  field: { marginBottom: 16 },
  input: {
    fontFamily: fonts.regular,
    fontSize: 17,
    color: colors.ink,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  inputFocused: { borderColor: colors.pine },
  fieldHint: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.stone,
    marginTop: 6,
  },

  saveButton: {
    backgroundColor: colors.pine,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  saveDisabled: { opacity: 0.6 },
  saveText: { fontFamily: fonts.semibold, fontSize: 17, color: colors.white },
});