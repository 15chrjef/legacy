import React from 'react';

// import packages
import { PropTypes, ScrollView, StyleSheet, Text, TextInput, Dimensions, View, AsyncStorage } from 'react-native'
import { Button, Radio, Container, Content } from 'native-base'

// establish constants
const width = Dimensions.get('window').width;

// ControlPanel Component
export default class ControlPanel extends React.Component {
  constructor(props) {
    super(props);
    this.Calculate = this.Calculate.bind(this);
    this.onFemaleSelect = this.onFemaleSelect.bind(this);
    this.onMaleSelect = this.onMaleSelect.bind(this);
    this.changeGlobalCalories = this.changeGlobalCalories.bind(this);
    this.state={
      calories: '',
      age: '',
      weight: '',
      feet: '',
      inches: '',
      gender: 'male',
      maleR: true,
      femaleR: false
    }
  } // end constructor

  onMaleSelect(){
    this.setState({
      femaleR:  false,
      maleR: true
    })
  } // end onMaleSelect

  onFemaleSelect(){
    this.setState({
      femaleR: true,
      maleR: false
    })
  } // end onFemaleSelect

  // for calculating BMR
  Calculate(){
    console.log(this.state.weight, this.state.feet, this.state.inches, this.state.age )
    var BMR = Math.floor((655.1 + ( 4.35 * Number(this.state.weight) ) + ( 4.7 * Number(this.state.feet) * 12 + Number(this.state.inches) ) - ( 4.7 * Number(this.state.age) ) ) * 7)
    console.log(BMR)
      this.setState({calories: BMR})
  } // end Calculate

  // for setting/updating recommended weekly calories consumption
  changeGlobalCalories() {
    var self = this;
    global._globalCaloriesCount = parseInt(self.state.calories);
    AsyncStorage.setItem(self.props.userId, JSON.stringify(global._globalCaloriesCount),() => {
      self.props.updateCalories();
    })
  } // end changeGlobalCalories

  render() {
    return (
      <ScrollView style={styles.container}>
        <Text>Enter Your Calorie Info</Text>
         <TextInput
        placeholder='Enter Age'    
        style={{height: 40, width: width * .4, color: 'black'}}
        placeholderTextColor='gray'
        underlineColorAndroid='gray'
        onChangeText={age => this.setState({age: age})}
        />
         <TextInput
        placeholder='Enter Weight'    
        style={{height: 40, width: width * .4, color: 'black'}}
        onChangeText={text => this.setState({ text: text })}
        placeholderTextColor='gray'
        underlineColorAndroid='gray'
        onChangeText={weight => this.setState({weight: weight})}
        />
        <Text>Height</Text>
        <TextInput
        placeholder='Feet'    
        style={{height: 40, width: width * .2, color: 'black'}}
        textStyle={{fontSize: 12}}
        placeholderTextColor='gray'
        underlineColorAndroid='gray'
        onChangeText={feet => this.setState({feet: feet})}
        />
        <TextInput
        placeholder='Inches'    
        style={{height: 40, width: width * .2, color: 'black'}}
        textStyle={{fontSize: 12}}
        placeholderTextColor='gray'
        underlineColorAndroid='gray'
        onChangeText={inches => this.setState({inches: inches})}
        />
        <Container>
          <Content style={{marginLeft: 5}}>
            <Text>Male</Text>
            <Radio
              selected={this.state.maleR}
              onPress={this.onMaleSelect}
            />
            <Text>Female</Text>
            <Radio
            selected={this.state.femaleR}
            onPress={this.onFemaleSelect}
            />
          </Content>
        </Container>
        <View>
          <Button
            style={{ width: width * .4, height: 30, backgroundColor: 'gray', marginTop: 10}}
            textStyle={{color: 'white',fontWeight: 'bold', fontSize: 20}}
            rounded  
            onPress={() => this.Calculate()}
            >
            Calculate
          </Button>
          <Text style={{marginTop: 20}}>Reccomended Calories</Text>
          <TextInput
            placeholder='Ex:14000'    
            style={{height: 40, width: width * .4, color: 'black'}}
            onChangeText={calories => this.setState({calories: calories})}
            placeholderTextColor='gray'
            underlineColorAndroid='gray'
            value = {this.state.calories.toString()}
            />
          <Button
            style={{ width: width * .4, height: 30}}
            textStyle={{color: 'white',fontWeight: 'bold', fontSize: 20}}
            onPress={() => this.changeGlobalCalories()}
            rounded  
            >
            Submit
          </Button>
        </View>
      </ScrollView>
    )
  } //end render
} // end ControlPanel Component

// stylesheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 2,
    opacity: .9,
    paddingLeft: 5
  },
  button: {
    backgroundColor: 'white',
    padding: 10,
  }
}) // end styles
