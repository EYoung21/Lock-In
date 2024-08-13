import React, { useContext, useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { GoogleSignin, statusCodes, User } from '@react-native-google-signin/google-signin';
import { TotalElapsedContext } from './TotalElapsedContext';
import moment from 'moment';
import { GOOGLE_WEB_CLIENT_ID } from '@env';
import Svg, { Path, Rect, Text as SvgText } from 'react-native-svg';
import { scaleTime, scaleLinear } from 'd3-scale';
import * as d3Shape from 'd3-shape';
import { Picker } from '@react-native-picker/picker';

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

interface GraphData {
  date: string;
  minutes: number;
}

const StatisticsScreen: React.FC = () => {
  const { totalElapsedTime, dailyEntries, setDailyEntries } = useContext(TotalElapsedContext);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [graphType, setGraphType] = useState<'daily' | 'averageWeekly' | 'averageMonthly' | 'averageYearly'>('daily');

  useEffect(() => {
    const generateTestData = () => {
      const testEntries: DailyEntries = {};
      const startDate = moment().subtract(0.1, 'years');
      const endDate = moment();
      let currentDate = startDate.clone();
      while (currentDate.isBefore(endDate)) {
        const randomMinutes = Math.floor(Math.random() * 120);
        testEntries[currentDate.format('YYYY-MM-DD')] = randomMinutes;
        currentDate.add(1, 'day');
      }
      setDailyEntries(testEntries);
    };

    generateTestData();
  }, [setDailyEntries]);

  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: true,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  const getStartOfWeek = (date: moment.Moment) => date.startOf('isoWeek');

  const calculateWeeklyStats = (entries: DailyEntries): WeeklyStats[] => {
    const weeks: { [key: string]: { totalMinutes: number; days: number; daily: DailyEntries } } = {};

    const entryDates = Object.keys(entries).map(date => moment(date));
    if (entryDates.length === 0) return [];

    const firstDate = getStartOfWeek(moment.min(entryDates));
    const lastDate = getStartOfWeek(moment.max(entryDates)).add(1, 'week');

    for (let week = firstDate.clone(); week.isBefore(lastDate); week.add(1, 'week')) {
      const weekKey = week.format('YYYY-MM-DD');
      weeks[weekKey] = { totalMinutes: 0, days: 0, daily: {} };
    }

    Object.keys(entries).forEach((date) => {
      const week = getStartOfWeek(moment(date)).format('YYYY-MM-DD');
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
        avgMinutes: (totalMinutes / (days || 1)).toFixed(2),
        avgHours: (totalMinutes / ((days || 1) * 60)).toFixed(2),
        daily,
      };
    });

    return weeklyStats;
  };

  const weeklyStats = calculateWeeklyStats(dailyEntries);
  // console.log('Weekly Stats:', JSON.stringify(weeklyStats));

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      setUserInfo(userInfo);

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
      console.log('Sign-in error details:', error);
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

  const prepareGraphData = (type: 'daily' | 'averageWeekly' | 'averageMonthly' | 'averageYearly'): GraphData[] => {
    let data: GraphData[] = [];
    switch (type) {
      case 'daily':
        data = Object.keys(dailyEntries).map(date => ({
          date: moment(date).format('YYYY-MM-DD'),
          minutes: dailyEntries[date],
        }));
        break;
      case 'averageWeekly':
        const weeks = calculateWeeklyStats(dailyEntries);
        if (weeks.length === 0) return [];
        data = weeks.map(week => ({
          date: week.week,
          minutes: parseFloat(week.avgMinutes),
        }));
        break;
      case 'averageMonthly':
        const months: { [key: string]: { totalMinutes: number; days: number } } = {};
        Object.keys(dailyEntries).forEach(date => {
          const month = moment(date).format('YYYY-MM');
          if (!months[month]) {
            months[month] = { totalMinutes: 0, days: 0 };
          }
          months[month].totalMinutes += dailyEntries[date];
          months[month].days += 1;
        });
        data = Object.keys(months).map(month => {
          const daysInMonth = moment(month, 'YYYY-MM').daysInMonth();
          return {
            date: month,
            minutes: months[month].totalMinutes / daysInMonth,
          };
        });
        break;
      case 'averageYearly':
        const years: { [key: string]: { totalMinutes: number; days: number } } = {};
        Object.keys(dailyEntries).forEach(date => {
          const year = moment(date).format('YYYY');
          if (!years[year]) {
            years[year] = { totalMinutes: 0, days: 0 };
          }
          years[year].totalMinutes += dailyEntries[date];
          years[year].days += 1;
        });
        data = Object.keys(years).map(year => {
          const daysInYear = moment(year, 'YYYY').isLeapYear() ? 366 : 365;
          return {
            date: year,
            minutes: years[year].totalMinutes / daysInYear,
          };
        });
        break;
      default:
        return [];
    }
    // console.log('Prepared Graph Data:', data);
    return data;
  };

  const graphData = prepareGraphData(graphType);
  // console.log('Graph Data:', graphData);

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = 300;

  let xScale, yScale, line;
  if (graphData.length > 0) {
    xScale = scaleTime()
      .domain([new Date(graphData[0].date), new Date(graphData[graphData.length - 1].date)])
      .range([0, screenWidth - 40]);

    yScale = scaleLinear()
      .domain([0, Math.max(...graphData.map(d => d.minutes))])
      .range([screenHeight - 40, 0]);

    try {
      line = d3Shape.line<GraphData>()
        .x((d) => xScale(new Date(d.date)))
        .y((d) => yScale(d.minutes))
        .curve(d3Shape.curveBasis)(graphData) || '';
    } catch (error) {
      console.error('Error generating line path:', error);
    }
  }

  const xAxisLabel = graphType === 'daily' ? 'Day' :
                     graphType === 'averageWeekly' ? 'Week' :
                     graphType === 'averageMonthly' ? 'Month' : 'Year';

  const yAxisLabel = graphType === 'daily' ? 'Minutes' : 'Average Minutes';

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
        <ScrollView style={styles.tableContainer} contentContainerStyle={{ flexGrow: 1 }}>
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
        </ScrollView>
      </ScrollView>
      <Text style={styles.headerText}>Daily Work Minutes Graph</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={graphType}
          style={styles.picker}
          onValueChange={(itemValue) => setGraphType(itemValue as 'daily' | 'averageWeekly' | 'averageMonthly' | 'averageYearly')}
        >
          <Picker.Item label="Minutes per Day" value="daily" />
          <Picker.Item label="Average Minutes per Week" value="averageWeekly" />
          <Picker.Item label="Average Minutes per Month" value="averageMonthly" />
          <Picker.Item label="Average Minutes per Year" value="averageYearly" />
        </Picker>
      </View>
      <ScrollView horizontal>
        <Svg width={screenWidth} height={screenHeight}>
          <Rect width="100%" height="100%" fill="white" />
          {graphData.length > 0 && line ? (
            <Path d={line} stroke="skyblue" strokeWidth={2} fill="none" />
          ) : (
            <Text style={styles.noDataText}>No data to display</Text>
          )}
          <SvgText
            x={screenWidth / 2}
            y={screenHeight - 10}
            textAnchor="middle"
            fontSize="16"
            fill="black"
          >
            {xAxisLabel}
          </SvgText>
          <SvgText
            x={-screenHeight / 2}
            y={15}
            textAnchor="middle"
            fontSize="16"
            fill="black"
            transform="rotate(-90)"
          >
            {yAxisLabel}
          </SvgText>
        </Svg>
      </ScrollView>
      {graphData.length === 0 && <Text style={styles.noDataText}>No data available for the selected graph type</Text>}
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
  tableContainer: {
    height: 300,
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
  },
  pickerContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  picker: {
    width: 200,
    height: 50,
  },
  noDataText: {
    fontSize: 16,
    color: 'red',
    alignSelf: 'center',
    marginVertical: 10,
  }
});

export default StatisticsScreen;
