import React, { useContext, useState, useEffect, useMemo } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Dimensions, Alert, Platform } from 'react-native';
import { TotalElapsedContext } from './TotalElapsedContext';
import moment from 'moment';
import Svg, { Path, Rect, Text as SvgText } from 'react-native-svg';
import { scaleTime, scaleLinear } from 'd3-scale';
import * as d3Shape from 'd3-shape';
import { Picker } from '@react-native-picker/picker';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import DocumentPicker from 'react-native-document-picker';
import StatisticsHeader from './StatisticsHeader';

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
  const { totalElapsedTime, dailyEntries, setDailyEntries, totalTimesLockedIn } = useContext(TotalElapsedContext);
  const [graphType, setGraphType] = useState<'daily' | 'average Weekly' | 'average Monthly' | 'average Yearly'>('daily');

  useEffect(() => {
    const generateTestData = () => {
      const testEntries: DailyEntries = {};
      const startDate = moment().subtract(0.5, 'years');
      const endDate = moment();
      let currentDate = startDate.clone();
      while (currentDate.isBefore(endDate)) {
        const randomMinutes = Math.floor(Math.random() * 60);
        testEntries[currentDate.format('YYYY-MM-DD')] = randomMinutes;
        currentDate.add(1, 'day');
      }
      setDailyEntries(testEntries);
    };

    if (Object.keys(dailyEntries).length === 0) { //only generates test data if daily entries is empty (user hasn't locked in yet)
      generateTestData();
    }
  }, []);

  const downloadCSV = async () => {
    const csvContent = Object.entries(dailyEntries)
      .map(([date, minutes]) => `${date},${minutes}`)
      .join('\n');
    const header = 'Date,Minutes\n';
    const csvString = `${header}${csvContent}`;
    
    const path = Platform.OS === 'ios' 
      ? `${RNFS.DocumentDirectoryPath}/chastity_data.csv`
      : `${RNFS.ExternalDirectoryPath}/chastity_data.csv`;

    try {
      await RNFS.writeFile(path, csvString, 'utf8');
      
      await Share.open({
        url: Platform.OS === 'android' ? `file://${path}` : path,
        type: 'text/csv',
        filename: 'chastity_data.csv'
      });
    } catch (error) {
      console.error('Error sharing file:', error);
      Alert.alert('Error', 'Failed to download and share CSV');
    }
  };

  const uploadCSV = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      
      if (result[0].uri) {
        const fileContent = await RNFS.readFile(result[0].uri, 'utf8');
        const lines = fileContent.split('\n');
        const newEntries: DailyEntries = {};
        
        // Skip the header row
        for (let i = 1; i < lines.length; i++) {
          const [date, minutes] = lines[i].split(',');
          if (date && minutes) {
            newEntries[date.trim()] = parseInt(minutes.trim(), 10);
          }
        }
        
        setDailyEntries(newEntries);
        Alert.alert('Success', 'CSV data uploaded and synced successfully');
      }
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        // User cancelled the picker
      } else {
        console.error('Error uploading CSV:', error);
        Alert.alert('Error', 'Failed to upload and sync CSV data');
      }
    }
  };

  const getStartOfWeek = (date: moment.Moment) => date.startOf('isoWeek');

  const calculateWeeklyStats = (entries: DailyEntries): [WeeklyStats[], number] => {
    const weeks: { [key: string]: { totalMinutes: number; days: number; daily: DailyEntries } } = {};
    
    const entryDates = Object.keys(entries).map(date => moment(date));
    if (entryDates.length === 0) return [[], 0];
  
    const firstDate = getStartOfWeek(moment.min(entryDates));
    const lastDate = getStartOfWeek(moment.max(entryDates)).add(1, 'week');
  
    for (let week = firstDate.clone(); week.isBefore(lastDate); week.add(1, 'week')) {
      const weekKey = week.format('YYYY-MM-DD');
      weeks[weekKey] = { totalMinutes: 0, days: 0, daily: {} };
    }

    let totalDays = 0;
    Object.entries(entries).forEach(([date, minutes]) => {
      const week = getStartOfWeek(moment(date)).format('YYYY-MM-DD');
      if (!weeks[week]) {
        weeks[week] = { totalMinutes: 0, days: 0, daily: {} };
      }
      const validMinutes = minutes === null ? 0 : Number(minutes);
      weeks[week].totalMinutes += validMinutes;
      weeks[week].days += 1;
      totalDays += 1;
      weeks[week].daily[date] = validMinutes;
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
  
    return [weeklyStats, totalDays];
  };

  const prepareGraphData = (type: 'daily' | 'average Weekly' | 'average Monthly' | 'average Yearly'): GraphData[] => {
    // console.log("Preparing graph data for type:", type);
    // console.log("Daily entries before processing:", dailyEntries);
    let data: GraphData[] = [];
    switch (type) {
      case 'daily':
        data = Object.entries(dailyEntries)
          .filter(([_, minutes]) => {
            const isValid = typeof minutes === 'number' && !isNaN(minutes) && minutes !== null;
            if (!isValid) {
              console.log("Filtered out entry:", _, minutes);
            }
            return isValid;
          })
          .map(([date, minutes]) => {
            const entry = {
              date: moment(date).format('YYYY-MM-DD'),
              minutes: Number(minutes),
            };
            return entry;
          });
        break;
      case 'average Weekly':
        const weeks = calculateWeeklyStats(dailyEntries);
        if (weeks[0].length === 0) return [];
          data = weeks[0].map(week => ({
            date: moment(week.week, 'MM/DD/YYYY').format('YYYY-MM-DD'),
            minutes: parseFloat(week.avgMinutes),
          }));
          break;
      case 'average Monthly':
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
      case 'average Yearly':
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
    return data;
  };

  const [weeklyStats, totalDays2] = useMemo(() => calculateWeeklyStats(dailyEntries), [dailyEntries]);
  const graphData = useMemo(() => prepareGraphData(graphType), [graphType, dailyEntries]);

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = 300;

  let xScale, yScale, line;
  if (graphData.length > 0) {
    // console.log("Setting up scales and line generator");
    xScale = scaleTime()
      .domain([new Date(graphData[0].date), new Date(graphData[graphData.length - 1].date)])
      .range([0, screenWidth - 40]);

    yScale = scaleLinear()
      .domain([0, Math.max(...graphData.map(d => d.minutes))])
      .range([screenHeight - 40, 0]);

    // console.log("xScale domain:", xScale.domain());
    // console.log("yScale domain:", yScale.domain());

    try {
      // console.log("Attempting to generate line");
      line = d3Shape.line()
        .x(d => {
          const xValue = xScale(new Date(d.date));
          // console.log("X value for", d.date, ":", xValue);
          return xValue;
        })
        .y(d => {
          const yValue = yScale(d.minutes);
          // console.log("Y value for", d.minutes, ":", yValue);
          return yValue;
        })
        .curve(d3Shape.curveBasis)(graphData);
      // console.log("Generated line:", line);
    } catch (error) {
      console.error('Error generating line path:', error);
    }
  }

  // Add this right after the existing line generation code
  if (!line || typeof line !== 'string' || line.length === 0) {
    // console.log("Generating simple line path");
    const simpleLine = graphData.reduce((path, point, index) => {
      const x = xScale(new Date(point.date));
      const y = yScale(point.minutes);
      return `${path}${index === 0 ? 'M' : 'L'}${x},${y}`;
    }, '');
    // console.log("Simple line path:", simpleLine);
    line = simpleLine;
  }

  const xAxisLabel = graphType === 'daily' ? 'Day' :
                     graphType === 'average Weekly' ? 'Week' :
                     graphType === 'average Monthly' ? 'Month' : 'Year';

  const yAxisLabel = graphType === 'daily' ? 'Minutes' : 'Average Minutes';

  // console.log("Graph data length:", graphData.length);
  // console.log("Line data exists:", !!line);
  // console.log("Screen dimensions:", screenWidth, screenHeight);

  return (
    <View style={styles.container}>
      <StatisticsHeader />

      <View style={styles.buttonContainer}>
        <Button title="Download CSV" onPress={downloadCSV} />
        <Button title="Upload CSV" onPress={uploadCSV} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.headerText}>Weekly Statistics</Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tableContainer}>
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
      </ScrollView>



      <Text style={styles.headerText}>{graphType.slice(0, 1).toUpperCase() + graphType.slice(1, graphType.length)} Minutes Graph</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={graphType}
          style={styles.picker}
          onValueChange={(itemValue) => setGraphType(itemValue as 'daily' | 'average Weekly' | 'average Monthly' | 'average Yearly')}
        >
          <Picker.Item label="Minutes per Day" value="daily" />
          <Picker.Item label="Average Minutes per Week" value="average Weekly" />
          <Picker.Item label="Average Minutes per Month" value="average Monthly" />
          <Picker.Item label="Average Minutes per Year" value="average Yearly" />
        </Picker>
      </View>

      <ScrollView horizontal>
        <Svg width={screenWidth} height={screenHeight}>
          <Rect width="100%" height="100%" fill="white" />
          {graphData.length > 1 && typeof line === 'string' && line.length > 0 ? (
            <>
              <Path d={line} stroke="skyblue" strokeWidth={2} fill="none" />
              {/* {console.log("Rendering graph. Path:", line)} */}
            </>
          ) : (
            <>
              <SvgText
                x={screenWidth / 2}
                y={screenHeight / 2}
                textAnchor="middle"
                fontSize="16"
                fill="black"
              >
                Not enough data to display graph
              </SvgText>
              {console.log("Not rendering graph. graphData.length:", graphData.length, "line:", line)}
            </>
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
      {graphData.length <= 1 && (
        <Text style={styles.noDataText}>
          Not enough data available for the selected graph type
        </Text>
      )}
      {graphData.length === 0 && <Text style={styles.noDataText}>No data available for the selected graph type</Text>}
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
  scrollContainer: {
    flexGrow: 1,
  },
  tableContainer: {
    flex: 1,  // Change to flex to allow dynamic height
    width: '100%',
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
  },
  cellText: {
    color: '#000',
  },
  pickerContainer: {
    alignItems: 'center',
    marginVertical: 0,
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
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
});

export default StatisticsScreen;