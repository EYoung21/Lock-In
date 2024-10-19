import React, { useContext, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TotalElapsedContext } from './TotalElapsedContext';
import moment from 'moment';

const StatisticsHeader = () => {
  const { dailyEntries, totalTimesLockedIn } = useContext(TotalElapsedContext);

  const stats = useMemo(() => {
    const entries = Object.values(dailyEntries).filter((value): value is number => typeof value === 'number' && !isNaN(value));
    const totalMinutes = entries.reduce((sum: number, minutes: number) => sum + minutes, 0);
    const totalDays = entries.length;
    const totalWeeks = Math.ceil(totalDays / 7);

    return {
      totalMinutes,
      totalHours: totalMinutes / 60,
      averageMinutesPerDay: totalDays > 0 ? totalMinutes / totalDays : 0,
      averageHoursPerDay: totalDays > 0 ? totalMinutes / totalDays / 60 : 0,
      averageMinutesPerWeek: totalWeeks > 0 ? totalMinutes / totalWeeks : 0,
      averageHoursPerWeek: totalWeeks > 0 ? totalMinutes / totalWeeks / 60 : 0,
      averageMinutesPerSession: totalTimesLockedIn > 0 ? totalMinutes / totalTimesLockedIn : 0,
      averageHoursPerSession: totalTimesLockedIn > 0 ? totalMinutes / totalTimesLockedIn / 60 : 0,
    };
  }, [dailyEntries, totalTimesLockedIn]);

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.totalText}>
          Total time locked in: {stats.totalMinutes.toFixed(2)} minutes ({stats.totalHours.toFixed(2)} hours)
        </Text>
      </View>
      <View style={styles.header}>
        <Text style={styles.totalText}>
          Average time locked in per day: {stats.averageMinutesPerDay.toFixed(2)} minutes ({stats.averageHoursPerDay.toFixed(2)} hours)
        </Text>
      </View>
      <View style={styles.header}>
        <Text style={styles.totalText}>
          Average time locked in per week: {stats.averageMinutesPerWeek.toFixed(2)} minutes ({stats.averageHoursPerWeek.toFixed(2)} hours)
        </Text>
      </View>
      <View style={styles.header}>
        <Text style={styles.totalText}>
          Average time locked in per session: {
            totalTimesLockedIn > 0
              ? `${stats.averageMinutesPerSession.toFixed(2)} minutes (${stats.averageHoursPerSession.toFixed(2)} hours)`
              : 'N/A'
          }
        </Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  totalText: {
    fontSize: 18,
    color: '#000000',
    fontWeight: 'bold',
  },
});

export default StatisticsHeader;