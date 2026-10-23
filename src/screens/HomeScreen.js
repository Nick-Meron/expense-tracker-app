import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiRequest } from '../api';
import { colors, fonts, categoryColor } from '../theme';
import { money } from '../format';
import AddTransactionScreen from './AddTransactionScreen';

const onPine = {
  muted: '#A9C2BA',
  income: '#8FD3AE',
  spent: '#F2A99A',
};

function pad(n) {
  return String(n).padStart(2, '0');
}

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

function shiftMonth(month, delta) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

function monthLabel(month) {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function dateKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function dayLabel(key) {
  const now = new Date();
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  if (key === dateKey(now)) return 'Today';
  if (key === dateKey(yesterday)) return 'Yesterday';
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
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
      Alert.alert('Could not load your data', e.message);
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
    const title = item.note || item.category.name;
    Alert.alert('Delete this transaction?', `${title}: ${money(item.amount)}`, [
      { text: 'Keep', style: 'cancel' },
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
            Alert.alert('Could not delete', e.message);
          }
        },
      },
    ]);
  }

  const sections = useMemo(() => {
    const groups = [];
    transactions.forEach((t) => {
      const last = groups[groups.length - 1];
      if (last && last.key === t.date) {
        last.data.push(t);
      } else {
        groups.push({ key: t.date, title: dayLabel(t.date), data: [t] });
      }
    });
    return groups;
  }, [transactions]);

  const expenseRows = summary
    ? summary.by_category.filter((r) => r.type === 'expense' && r.total > 0)
    : [];
  const totalExpense = summary ? Number(summary.total_expense) : 0;

  function renderListHeader() {
    if (expenseRows.length === 0) return null;
    return (
      <View style={styles.legend}>
        <Text style={styles.sectionTitle}>Where it went</Text>
        {expenseRows.map((r) => (
          <View key={r.category_id} style={styles.legendRow}>
            <View
              style={[styles.dot, { backgroundColor: categoryColor(r.category_id) }]}
            />
            <Text style={styles.legendName}>{r.name}</Text>
            <Text style={styles.legendPercent}>
              {totalExpense > 0 ? Math.round((r.total / totalExpense) * 100) : 0}%
            </Text>
            <Text style={styles.legendAmount}>{money(r.total)}</Text>
          </View>
        ))}
      </View>
    );
  }

  function renderItem({ item }) {
    const isIncome = item.category.type === 'income';
    return (
      <TouchableOpacity
        activeOpacity={0.6}
        style={styles.row}
        onLongPress={() => confirmDelete(item)}
      >
        <View
          style={[styles.dot, { backgroundColor: categoryColor(item.category.id) }]}
        />
        <View style={styles.rowText}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {item.note || item.category.name}
          </Text>
          <Text style={styles.rowSub}>{item.category.name}</Text>
        </View>
        <Text
          style={[
            styles.rowAmount,
            { color: isIncome ? colors.leaf : colors.brick },
          ]}
        >
          {isIncome ? '+' : '-'}
          {money(item.amount)}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        <View style={styles.topRow}>
          <Text style={styles.hello}>{user.name}</Text>
          <TouchableOpacity
            onPress={onLogout}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.logout}>Log out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.monthRow}>
          <TouchableOpacity
            onPress={() => setMonth(shiftMonth(month, -1))}
            hitSlop={{ top: 10, bottom: 10, left: 16, right: 16 }}
          >
            <Text style={styles.arrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthText}>{monthLabel(month)}</Text>
          <TouchableOpacity
            onPress={() => setMonth(shiftMonth(month, 1))}
            hitSlop={{ top: 10, bottom: 10, left: 16, right: 16 }}
          >
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.balanceLabel}>Balance</Text>
        <Text style={styles.balance} numberOfLines={1} adjustsFontSizeToFit>
          {money(summary ? summary.balance : 0)}
        </Text>

        <View style={styles.figures}>
          <View style={styles.figure}>
            <Text style={styles.figureLabel}>Income</Text>
            <Text style={[styles.figureValue, { color: onPine.income }]}>
              {money(summary ? summary.total_income : 0)}
            </Text>
          </View>
          <View style={styles.figure}>
            <Text style={styles.figureLabel}>Spent</Text>
            <Text style={[styles.figureValue, { color: onPine.spent }]}>
              {money(summary ? summary.total_expense : 0)}
            </Text>
          </View>
        </View>

        <View style={styles.stack}>
          {expenseRows.map((r) => (
            <View
              key={r.category_id}
              style={[
                styles.stackPart,
                { flex: r.total, backgroundColor: categoryColor(r.category_id) },
              ]}
            />
          ))}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.pine} />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          renderSectionHeader={({ section }) => (
            <Text style={styles.dayTitle}>{section.title}</Text>
          )}
          stickySectionHeadersEnabled={false}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={
            <Text style={styles.empty}>
              Nothing in {monthLabel(month)} yet. Tap + to add a transaction.
            </Text>
          }
          ListFooterComponent={
            transactions.length > 0 ? (
              <Text style={styles.footerHint}>Hold a transaction to delete it.</Text>
            ) : null
          }
          refreshing={refreshing}
          onRefresh={refresh}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAdd(true)}
        activeOpacity={0.85}
      >
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
  container: { flex: 1, backgroundColor: colors.paper },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  panel: {
    backgroundColor: colors.pine,
    paddingTop: 64,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hello: { fontFamily: fonts.semibold, fontSize: 16, color: onPine.muted },
  logout: { fontFamily: fonts.regular, fontSize: 15, color: onPine.muted },

  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  arrow: {
    fontFamily: fonts.regular,
    fontSize: 30,
    color: colors.saffron,
    paddingHorizontal: 4,
    lineHeight: 32,
  },
  monthText: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    color: colors.white,
    marginHorizontal: 12,
  },

  balanceLabel: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: onPine.muted,
    marginTop: 22,
  },
  balance: {
    fontFamily: fonts.extrabold,
    fontSize: 54,
    color: colors.white,
    marginTop: 2,
  },

  figures: { flexDirection: 'row', marginTop: 14 },
  figure: { marginRight: 36 },
  figureLabel: { fontFamily: fonts.regular, fontSize: 14, color: onPine.muted },
  figureValue: { fontFamily: fonts.semibold, fontSize: 18, marginTop: 2 },

  stack: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 22,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  stackPart: {
    height: 10,
    borderRightWidth: 2,
    borderRightColor: colors.pine,
  },

  listContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 130,
  },

  legend: { marginBottom: 8 },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    color: colors.ink,
    marginBottom: 10,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  legendName: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.ink,
  },
  legendPercent: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.stone,
    marginRight: 16,
  },
  legendAmount: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.ink,
    minWidth: 80,
    textAlign: 'right',
  },

  dayTitle: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.stone,
    marginTop: 22,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  rowText: { flex: 1 },
  rowTitle: { fontFamily: fonts.semibold, fontSize: 17, color: colors.ink },
  rowSub: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.stone,
    marginTop: 1,
  },
  rowAmount: { fontFamily: fonts.semibold, fontSize: 17, marginLeft: 12 },

  empty: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.stone,
    textAlign: 'center',
    marginTop: 32,
    lineHeight: 23,
  },
  footerHint: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.stone,
    textAlign: 'center',
    marginTop: 28,
  },

  fab: {
    position: 'absolute',
    right: 24,
    bottom: 36,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.saffron,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  fabText: {
    fontFamily: fonts.semibold,
    fontSize: 34,
    color: colors.pine,
    lineHeight: 38,
  },
});