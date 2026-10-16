import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiRequest } from '../api';
import AddTransactionScreen from './AddTransactionScreen';

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function shiftMonth(month, delta) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(month) {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function money(value) {
  return Number(value).toFixed(2);
}

export default function HomeScreen({ token, user, onLogout }) {
  const [month, setMonth] = useState(currentMonth());
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(async () => {
    try {
      const [s, t] = await Promise.all([
        apiRequest(`/summary?month=${month}`, { token }),
        apiRequest(`/transactions?month=${month}`, { token }),
      ]);
      setSummary(s);
      setTransactions(t);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [month, token]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  function refresh() {
    setRefreshing(true);
    load();
  }

  function handleSaved() {
    setShowAdd(false);
    load();
  }

  function confirmDelete(item) {
    Alert.alert('Delete transaction', `Delete "${item.note || item.category.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiRequest(`/transactions/${item.id}`, {
              method: 'DELETE',
              token,
            });
            load();
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  }

  const expenseRows = summary
    ? summary.by_category.filter((r) => r.type === 'expense')
    : [];
  const maxExpense = expenseRows.length
    ? Math.max(...expenseRows.map((r) => r.total))
    : 1;

  function renderHeader() {
    return (
      <View>
        <View style={styles.monthRow}>
          <TouchableOpacity onPress={() => setMonth(shiftMonth(month, -1))}>
            <Text style={styles.arrow}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.monthText}>{monthLabel(month)}</Text>
          <TouchableOpacity onPress={() => setMonth(shiftMonth(month, 1))}>
            <Text style={styles.arrow}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        {summary && (
          <View>
            <View style={styles.cards}>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Income</Text>
                <Text style={[styles.cardValue, styles.green]}>
                  {money(summary.total_income)}
                </Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Expenses</Text>
                <Text style={[styles.cardValue, styles.red]}>
                  {money(summary.total_expense)}
                </Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Balance</Text>
                <Text style={styles.cardValue}>{money(summary.balance)}</Text>
              </View>
            </View>

            {expenseRows.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Spending by category</Text>
                {expenseRows.map((r) => (
                  <View key={r.category_id} style={styles.barRow}>
                    <View style={styles.barLabels}>
                      <Text style={styles.barName}>{r.name}</Text>
                      <Text style={styles.barAmount}>{money(r.total)}</Text>
                    </View>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          { width: `${(r.total / maxExpense) * 100}%` },
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.sectionTitle}>Transactions</Text>
          </View>
        )}
      </View>
    );
  }

  function renderItem({ item }) {
    const isIncome = item.category.type === 'income';
    return (
      <TouchableOpacity
        style={styles.item}
        onLongPress={() => confirmDelete(item)}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.itemTitle}>{item.note || item.category.name}</Text>
          <Text style={styles.itemSub}>
            {item.category.name} - {item.date}
          </Text>
        </View>
        <Text style={[styles.itemAmount, isIncome ? styles.green : styles.red]}>
          {isIncome ? '+' : '-'}
          {money(item.amount)}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>Hello, {user.name}</Text>
          <Text style={styles.hint}>Long-press a transaction to delete it</Text>
        </View>
        <TouchableOpacity onPress={onLogout}>
          <Text style={styles.logout}>Log out</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <Text style={styles.empty}>No transactions this month.</Text>
          }
          refreshing={refreshing}
          onRefresh={refresh}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setShowAdd(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={showAdd}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAdd(false)}
      >
        <AddTransactionScreen
          token={token}
          onClose={() => setShowAdd(false)}
          onSaved={handleSaved}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hello: { fontSize: 20, fontWeight: 'bold' },
  hint: { fontSize: 12, color: '#888', marginTop: 2 },
  logout: { color: '#2563eb', fontSize: 16 },
  listContent: { padding: 16, paddingBottom: 100 },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  arrow: { fontSize: 24, paddingHorizontal: 16, color: '#2563eb' },
  monthText: { fontSize: 18, fontWeight: '600' },
  cards: { flexDirection: 'row', justifyContent: 'space-between' },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 4,
  },
  cardLabel: { fontSize: 12, color: '#888' },
  cardValue: { fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  green: { color: '#16a34a' },
  red: { color: '#dc2626' },
  section: { marginTop: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  barRow: { marginBottom: 10 },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  barName: { fontSize: 14 },
  barAmount: { fontSize: 14, color: '#666' },
  barTrack: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginTop: 4,
  },
  barFill: { height: 8, backgroundColor: '#2563eb', borderRadius: 4 },
  item: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTitle: { fontSize: 16, fontWeight: '500' },
  itemSub: { fontSize: 12, color: '#888', marginTop: 2 },
  itemAmount: { fontSize: 16, fontWeight: 'bold' },
  empty: { textAlign: 'center', color: '#888', marginTop: 24 },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  fabText: { color: '#fff', fontSize: 32, lineHeight: 34 },
});