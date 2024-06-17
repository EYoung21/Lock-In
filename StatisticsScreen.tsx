import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TotalElapsedContext } from './TotalElapsedContext';
import moment from 'moment';

interface DailyEntries {
  [key: string]: number;
}

interface WeeklyStats {
  week: string;
  totalMinutes: number;
  totalHours: string;
  avgMinutes: string;
  avgHours: string;
  daily: DailyEntries;
}

const StatisticsScreen = () => {
  const { totalElapsedTime, dailyEntries } = useContext(TotalElapsedContext);

  const calculateWeeklyStats = (entries: DailyEntries): WeeklyStats[] => {
    const weeks: { [key: string]: { totalMinutes: number; days: number; daily: DailyEntries } } = {};
    Object.keys(entries).forEach((date) => {
      const week = moment(date).startOf('isoWeek').format('YYYY-MM-DD');
      if (!weeks[week]) {
        weeks[week] = { totalMinutes: 0, days: 0, daily: {} };
      }
      weeks[week].totalMinutes += entries[date];
      weeks[week].days += 1;
      weeks[week].daily[date] = entries[date];
    });

    const weeklyStats = Object.keys(weeks).map((week) => {
      const { totalMinutes, days, daily } = weeks[week];
      return {
        week: moment(week).format('MM/DD/YYYY'),
        totalMinutes,
        totalHours: (totalMinutes / 60).toFixed(2),
        avgMinutes: (totalMinutes / days).toFixed(2),
        avgHours: (totalMinutes / (days * 60)).toFixed(2),
        daily,
      };
    });

    return weeklyStats;
  };

  const weeklyStats = calculateWeeklyStats(dailyEntries);

  return (
    <ScrollView style={styles.container} horizontal>
      <View>
        <Text style={styles.totalText}>Total time locked in: {totalElapsedTime.toFixed(2)} minutes</Text>
        <Text style={styles.headerText}>Weekly Statistics</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.headerCell}>Week</Text>
            <Text style={styles.headerCell}>Total Hours</Text>
            <Text style={styles.headerCell}>Total Minutes</Text>
            <Text style={styles.headerCell}>Avg Hours</Text>
            <Text style={styles.headerCell}>Avg Minutes</Text>
            <Text style={styles.headerCell}>Monday</Text>
            <Text style={styles.headerCell}>Tuesday</Text>
            <Text style={styles.headerCell}>Wednesday</Text>
            <Text style={styles.headerCell}>Thursday</Text>
            <Text style={styles.headerCell}>Friday</Text>
            <Text style={styles.headerCell}>Saturday</Text>
            <Text style={styles.headerCell}>Sunday</Text>
          </View>
          {weeklyStats.map((item) => (
            <View key={item.week} style={styles.tableRow}>
              <Text style={styles.cell}>{item.week}</Text>
              <Text style={styles.cell}>{Number(item.totalHours).toFixed(2)}</Text>
              <Text style={styles.cell}>{item.totalMinutes.toFixed(2)}</Text>
              <Text style={styles.cell}>{Number(item.avgHours).toFixed(2)}</Text>
              <Text style={styles.cell}>{Number(item.avgMinutes).toFixed(2)}</Text>
              <Text style={styles.cell}>{(item.daily[moment(item.week, 'MM/DD/YYYY').isoWeekday(1).format('YYYY-MM-DD')] || 0).toFixed(2)}</Text>
              <Text style={styles.cell}>{(item.daily[moment(item.week, 'MM/DD/YYYY').isoWeekday(2).format('YYYY-MM-DD')] || 0).toFixed(2)}</Text>
              <Text style={styles.cell}>{(item.daily[moment(item.week, 'MM/DD/YYYY').isoWeekday(3).format('YYYY-MM-DD')] || 0).toFixed(2)}</Text>
              <Text style={styles.cell}>{(item.daily[moment(item.week, 'MM/DD/YYYY').isoWeekday(4).format('YYYY-MM-DD')] || 0).toFixed(2)}</Text>
              <Text style={styles.cell}>{(item.daily[moment(item.week, 'MM/DD/YYYY').isoWeekday(5).format('YYYY-MM-DD')] || 0).toFixed(2)}</Text>
              <Text style={styles.cell}>{(item.daily[moment(item.week, 'MM/DD/YYYY').isoWeekday(6).format('YYYY-MM-DD')] || 0).toFixed(2)}</Text>
              <Text style={styles.cell}>{(item.daily[moment(item.week, 'MM/DD/YYYY').isoWeekday(7).format('YYYY-MM-DD')] || 0).toFixed(2)}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFF',
  },
  totalText: {
    fontSize: 18,
    color: '#000000',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 18,
    color: '#000000',
    fontWeight: 'bold',
    marginVertical: 10,
  },
  table: {
    borderWidth: 1,
    borderColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
  },
  headerCell: {
    width: 100,
    padding: 8,
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: '#000',
    textAlign: 'center',
    backgroundColor: '#f1f1f1',
  },
  cell: {
    width: 100,
    padding: 8,
    borderWidth: 1,
    borderColor: '#000',
    textAlign: 'center',
  },
});

export default StatisticsScreen;
