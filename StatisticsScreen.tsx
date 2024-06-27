import React, { useContext, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { GoogleSignin, statusCodes, User } from '@react-native-google-signin/google-signin';
import { TotalElapsedContext } from './TotalElapsedContext';
import moment from 'moment';
import { supabase } from './supabaseClient';
import { GOOGLE_WEB_CLIENT_ID } from '@env';

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

// console.log(GOOGLE_WEB_CLIENT_ID);

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  offlineAccess: true,
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const StatisticsScreen: React.FC = () => {
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
  
      // Store user data in Supabase
      const { idToken } = await GoogleSignin.getTokens();
      const response = await fetch('http://localhost:3000/storeUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });
      const result = await response.json();
      console.log('User stored in backend:', result);
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
    const data = weeklyStats.map(item => [
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
    ]);

    try {
      const response = await fetch('http://localhost:3000/createSheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });
      const result = await response.text();
      console.log('Spreadsheet created:', result);
    } catch (error) {
      console.error('Error exporting data to Google Sheets:', error);
    }
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
      <Text style={styles.headerText}>Weekly Statistics</Text>
      <ScrollView horizontal>
        <View>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={[styles.headerCell, styles.cellText]}>Week</Text>
              <Text style={[styles.headerCell, styles.cellText]}>Total Hours</Text>
              <Text style={[styles.headerCell, styles.cellText]}>Total Minutes</Text>
              <Text style={[styles.headerCell, styles.cellText]}>Avg Hours</Text>
              <Text style={[styles.headerCell, styles.cellText]}>Avg Minutes</Text>
              <Text style={[styles.headerCell, styles.cellText]}>Monday</Text>
              <Text style={[styles.headerCell, styles.cellText]}>Tuesday</Text>
              <Text style={[styles.headerCell, styles.cellText]}>Wednesday</Text>
              <Text style={[styles.headerCell, styles.cellText]}>Thursday</Text>
              <Text style={[styles.headerCell, styles.cellText]}>Friday</Text>
              <Text style={[styles.headerCell, styles.cellText]}>Saturday</Text>
              <Text style={[styles.headerCell, styles.cellText]}>Sunday</Text>
            </View>
            {weeklyStats.map((item) => (
              <View key={item.week} style={styles.tableRow}>
                <Text style={[styles.cell, styles.cellText]}>{item.week}</Text>
                <Text style={[styles.cell, styles.cellText]}>{Number(item.totalHours).toFixed(2)}</Text>
                <Text style={[styles.cell, styles.cellText]}>{item.totalMinutes.toFixed(2)}</Text>
                <Text style={[styles.cell, styles.cellText]}>{Number(item.avgHours).toFixed(2)}</Text>
                <Text style={[styles.cell, styles.cellText]}>{Number(item.avgMinutes).toFixed(2)}</Text>
                <Text style={[styles.cell, styles.cellText]}>{(item.daily[moment(item.week, 'MM/DD/YYYY').isoWeekday(1).format('YYYY-MM-DD')] || 0).toFixed(2)}</Text>
                <Text style={[styles.cell, styles.cellText]}>{(item.daily[moment(item.week, 'MM/DD/YYYY').isoWeekday(2).format('YYYY-MM-DD')] || 0).toFixed(2)}</Text>
                <Text style={[styles.cell, styles.cellText]}>{(item.daily[moment(item.week, 'MM/DD/YYYY').isoWeekday(3).format('YYYY-MM-DD')] || 0).toFixed(2)}</Text>
                <Text style={[styles.cell, styles.cellText]}>{(item.daily[moment(item.week, 'MM/DD/YYYY').isoWeekday(4).format('YYYY-MM-DD')] || 0).toFixed(2)}</Text>
                <Text style={[styles.cell, styles.cellText]}>{(item.daily[moment(item.week, 'MM/DD/YYYY').isoWeekday(5).format('YYYY-MM-DD')] || 0).toFixed(2)}</Text>
                <Text style={[styles.cell, styles.cellText]}>{(item.daily[moment(item.week, 'MM/DD/YYYY').isoWeekday(6).format('YYYY-MM-DD')] || 0).toFixed(2)}</Text>
                <Text style={[styles.cell, styles.cellText]}>{(item.daily[moment(item.week, 'MM/DD/YYYY').isoWeekday(7).format('YYYY-MM-DD')] || 0).toFixed(2)}</Text>
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
  cellText: {
    color: '#000',
  }
});

export default StatisticsScreen;
