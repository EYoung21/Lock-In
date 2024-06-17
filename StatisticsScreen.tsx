import React, { useContext, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { GoogleSignin, statusCodes, User } from '@react-native-google-signin/google-signin';
import { TotalElapsedContext } from './TotalElapsedContext';
import moment from 'moment';
import RNFS from 'react-native-fs';
import { uploadFileToGoogleDrive } from './GoogleDriveService';

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

GoogleSignin.configure({
  webClientId: '293282385409-o6ame9v5jm4vr059rdb3ckp7ahb45jlo.apps.googleusercontent.com',
  offlineAccess: true,
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const StatisticsScreen = () => {
  const { totalElapsedTime, dailyEntries } = useContext(TotalElapsedContext);
  const [userInfo, setUserInfo] = useState<User | null>(null);

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

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      setUserInfo(userInfo);
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign in is in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play services not available');
      } else if (error.code === 'DEVELOPER_ERROR') {
        console.log('Developer error:', error.message);
      } else {
        console.log('An unexpected error occurred', error);
      }
    }
  };

  const exportData = async () => {
    let csvContent = 'Week, Total Hours, Total Minutes, Avg Hours, Avg Minutes, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday\n';
    weeklyStats.forEach(item => {
      const row = [
        item.week,
        item.totalHours,
        item.totalMinutes.toFixed(2),
        item.avgHours,
        item.avgMinutes,
        (item.daily[moment(item.week, 'MM/DD/YYYY').isoWeekday(1).format('YYYY-MM-DD')] || 0).toFixed(2),
        (item.daily[moment(item.week, 'MM/DD/YYYY').isoWeekday(2).format('YYYY-MM-DD')] || 0).toFixed(2),
        (item.daily[moment(item.week, 'MM/DD/YYYY').isoWeekday(3).format('YYYY-MM-DD')] || 0).toFixed(2),
        (item.daily[moment(item.week, 'MM/DD/YYYY').isoWeekday(4).format('YYYY-MM-DD')] || 0).toFixed(2),
        (item.daily[moment(item.week, 'MM/DD/YYYY').isoWeekday(5).format('YYYY-MM-DD')] || 0).toFixed(2),
        (item.daily[moment(item.week, 'MM/DD/YYYY').isoWeekday(6).format('YYYY-MM-DD')] || 0).toFixed(2),
        (item.daily[moment(item.week, 'MM/DD/YYYY').isoWeekday(7).format('YYYY-MM-DD')] || 0).toFixed(2)
      ].join(',') + '\n';
      csvContent += row;
    });

    const filePath = `${RNFS.DocumentDirectoryPath}/statistics.csv`;
    await RNFS.writeFile(filePath, csvContent, 'utf8');
    await uploadFileToGoogleDrive(filePath, 'text/csv');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.totalText}>Total time locked in: {totalElapsedTime.toFixed(2)} minutes</Text>
      </View>
      <View>
        {userInfo ? (
          <Button title="Backup to Google Drive" onPress={exportData} />
        ) : (
          <Button title="Sign in with Google" onPress={signIn} />
        )}
      </View>
      <ScrollView horizontal>
        <View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
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
  headerText: {
    fontSize: 18,
    color: '#000000',
    fontWeight: 'bold',
    alignSelf: 'center',
    marginVertical: 10,
  },
  table: {
    marginTop: 10,
    marginBottom: 20,
    alignSelf: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 5,
    alignSelf: 'center',
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
    alignSelf: 'center',
  },
});

export default StatisticsScreen;
