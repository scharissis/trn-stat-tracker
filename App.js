import victoryCustomTheme from './victory-theme.js'
import React from 'react';
import {ActivityIndicator, Button, FlatList, Image, SectionList, StyleSheet, Text, TextInput, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import { StackNavigator, TabNavigator } from 'react-navigation';
import { VictoryBar, VictoryChart } from "victory-native";

export default class App extends React.Component {
  render() {
    return <RootStack />;
  }
}

class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Fortnite StatTracker',
  };

  constructor(props){
    super(props);
    this.state = {text:""};
  }

  render() {
    return (
      <View style={styles.container}>
        <View>
          <Image
            style={{width: 400, height: 100}}
            source={{uri: 'http://gamerselite.com/wp-content/uploads/2017/10/3729.jpg'}}
          />
        </View>
        <View style={styles.homeRow}>
          <TextInput
            style={{height: 45, width: 200, borderColor: 'black', borderWidth: 2, padding: 5}}
            placeholder="EPIC Username"
            onChangeText={(text) => this.setState({text})}
            value={this.state.text}
          />
          <Button
            title="Get Stats!"
            onPress={() => this.props.navigation.navigate('Stats', {user: (this.state.text) ? this.state.text : 'nikhedoniac'}) }
          />
        </View>
      </View>
    );
  }
}

class StatsScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    return {
      title: params.routeName,
    }
  };

  constructor(props){
    super(props);
    this.state = { isLoading: true, dataSource: {} };
  }

  componentDidMount(){
    const { params } = this.props.navigation.state;
    const user = (params.user) ? params.user : 'nikhedoniac';
    const url = 'https://api.fortnitetracker.com/v1/profile/pc/' + user;

    return fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'TRN-Api-Key': '5e6d4c89-a688-4985-8615-7109b4bbc71e'
      },
    }).then(response => {
        if (response.status === 200) {
          return response;
        } else {
          console.log(response.headers);
          throw new Error(response.status + ': TRN API Error!\n');
        }
      })
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          isLoading: false,
          dataSource: responseJson,
        }, function(){
        });
      })
      .catch((error) =>{
        console.error(error);
        this.setState({
          isLoading: false,
          dataSource: error,
          fetchError: true
        }, function(){

        });
      });
  }

  render() {
    if(this.state.isLoading){
      return(
        <View style={{flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center'}}>
          <ActivityIndicator size="large"/>
        </View>
      )
    }

    const { params } = this.props.navigation.state;
    const user = params ? params.user : null;
    var mode = this.props.navigation.state.routeName;
    var modeMap = {'Solo': 'p2', 'Duo': 'p10', 'Squad': 'p9'};
    var stats = this.state.dataSource.stats[modeMap[mode]];
    var bottom75wins = stats.matches.valueInt - stats.top25.valueInt;

    if (this.state.fetchError){
      return(
        <View style={{flex: 1, padding: 20}}>
          <Text>
            Error! Does this player exist?
          </Text>
        </View>
      )
    }

    return (
      <View style={styles.container}>
        <Text style={{fontSize: 20, fontWeight: 'bold', paddingTop: 10}}>{user}</Text>
        <ScrollView style={{flex: 1, paddingTop: 5}}>
          <View style={styles.homeRow}>
            <Text style={{fontWeight: 'bold'}}>TRN Rating:   </Text>
            <Text>{stats.trnRating.value} (Percentile: {stats.trnRating.percentile}%)</Text>
          </View>
          <View style={styles.homeRow}>
            <Text style={{fontWeight: 'bold'}}>Score:   </Text>
            <Text>{stats.score.value} (Percentile: {stats.score.percentile}%)</Text>
          </View>
          <View style={styles.homeRow}>
            <Text style={{fontWeight: 'bold'}}>Matches Played:   </Text>
            <Text>{stats.matches.value} (Percentile: {stats.matches.percentile}%)</Text>
          </View>
          <View style={styles.homeRow}>
            <Text style={{fontWeight: 'bold'}}>Wins:   </Text>
            <Text>Top1: {stats.top1.value} | Top3: {stats.top3.value} | Top10: {stats.top10.value} | Top25: {stats.top25.value}</Text>
          </View>
          <View style={styles.homeRow}>
            <Text style={{fontWeight: 'bold'}}>K/D Ratio:   </Text>
            <Text>{stats.kd.value} (Percentile: {stats.kd.percentile}%)</Text>
          </View>

          <VictoryChart width={350} theme={victoryCustomTheme}>
            <VictoryBar
              barRatio={1.0}
              labels={(d) => `y: ${d.y}`}
              data = {[
                { pos: 'Win', num: stats.top1.valueInt },
                { pos: 'Top3', num: stats.top3.valueInt },
                { pos: 'Top5', num: stats.top5.valueInt },
                { pos: 'Top10', num: stats.top10.valueInt },
                { pos: 'Top25', num: stats.top25.valueInt },
                { pos: 'Other', num: bottom75wins },
              ]}
              x="pos" y="num"
            />
          </VictoryChart>
        </ScrollView>
      </View>
    );
  }
}

const StatsStack = TabNavigator({
  Solo: { screen: StatsScreen },
  Duo: { screen: StatsScreen },
  Squad: { screen: StatsScreen }
});

const RootStack = StackNavigator(
  {
    Home: {
      screen: HomeScreen,
    },
    Stats: {
      screen: StatsStack,
    },
  },
  {
    initialRouteName: 'Home',
    navigationOptions: {
      headerStyle: {
        backgroundColor: '#f4511e',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  homeRow: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    alignItems: 'flex-start',
  },
});
