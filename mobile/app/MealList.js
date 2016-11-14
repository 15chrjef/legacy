import React from 'react';

// import packages
import { StyleSheet, View, ScrollView,Text, Dimensions, ActivityIndicator, Platform, AsyncStorage } from 'react-native';
import { Container, Content, Button } from 'native-base';
import Drawer from 'react-native-drawer';

// import components
import LoggedMeal from './LoggedMeal';
import InfoDisplay from './InfoDisplay';
import LogoDisplay from './LogoDisplay';
import HeadBuffer from './HeadBuffer';
import ToggleAnimatingActivityIndicator from './ToggleAnimatingActivityIndicator'
import ControlPanel from './ControlPanel';

// establish constants
const userUrl = 'https://mealdotlegacy.herokuapp.com/api/user/';
const mealUrl = 'https://mealdotlegacy.herokuapp.com/api/meal/';
const width = Dimensions.get('window').width;
let calor = 0;

// MealList Component
export default class MealList extends React.Component {
  constructor(props) {
    super(props);
    this.getData = this.getData.bind(this);
    this.postMeal = this.postMeal.bind(this);
    this.gotoNext = this.gotoNext.bind(this);
    this.clearMeals = this.clearMeals.bind(this);
    this.CalorieCounter = this.CalorieCounter.bind(this);
    this.closeDrawer = this.closeDrawer.bind(this);
    this.openDrawer = this.openDrawer.bind(this);
    this.updateMeals = this.updateMeals.bind(this);
    this.state = {
      animating: true,
      //Drawer Related States
      drawerOpen: false,
      drawerDisabled: false,
      animating: true
    }
  } // end constructor

  setToggleTimeout() {
    this.setState({animating: !this.state.animating});
  } // end setToggleTimeout

  // displays calories, switches to red if over recommended calories
  CalorieCounter(){
    var self = this;
    var calor = 0;
    self.props.getMealList().forEach((meal) => {
      calor += meal.recipe.calories
    })
    AsyncStorage.getItem(self.props.userId, (err,value) => {
      if(value !== null){
        global._count = JSON.parse(value);
      }
      global._cals = ('Weekly Calories Consumed: ' + Math.round(calor) + '/' + (global._count || 14000));
    
      if(calor > (global._globalCaloriesCount || 14000)){
        self.setState({
          view: {
            backgroundColor: 'red',
            borderRadius: 20,
            width: width * .8,
            height: 50,
            //for ios phone, overflow needs to be set as 'hidden'
          },
        })
      } else{
        self.setState({
          view: {
            backgroundColor: '#1e90ff',
            borderRadius: 20,
            width: width * .8,
            height: 50,
            //
          },
        })
      }
      if(self.state.animating){
        self.setToggleTimeout();
      }
    })
  } // end CalorieCounter

  // populates users individual meal list view with saved meals/recipes
  getData(cb) {
    fetch(userUrl + this.props.getUserId(), {
      method: 'GET',
      headers: { 'x-access-token': this.props.getToken() },
    })
    .then(res => res.json())
    .then((data) => {
      this.props.updateMealList(data.mealsObjs);
    }).done(() => {
      if (cb) { cb(); }
    });
  } // end getData

  // for deletion when entered into an individual meal
  postMeal(recipeId, mealId) {
    fetch(mealUrl + mealId, {
      method: 'DELETE',
      headers: { 'x-access-token': this.props.getToken() },
    })
    .then(() => {
      this.getData(() => {
        this.props.navigator.pop();
        this.CalorieCounter();
        });
    });
  } // end postMeal

  // deletes all meals
  clearMeals() {
    fetch(userUrl + 'clearMeals/' + this.props.getUserId(), {
      method: 'PUT',
      headers: { 'x-access-token': this.props.getToken() },
    }).then((res) => {
      console.log('clearMeals res', res);
      this.getData(() => {
        this.CalorieCounter();
      });
    });
  } // end clearMeals 

  // for navigation
  gotoNext(recipe, mealId, getData) {
    const nutrients = recipe.digest.map(nutrient => [nutrient.label, nutrient.total])
    this.props.navigator.push({
      component: InfoDisplay,
      passProps: {
        recipe,
        nutrients,
        mealId,
        postMeal: this.postMeal,
        text: 'Remove',
      },
    });
  } // end gotoNext

  updateMeals() {
    this.getData(() => {
      this.CalorieCounter();
    })
  } // end updateMeals

  closeDrawer() {
    this.refs.drawer.close()
  } // end closeDrawer

  openDrawer() {
    this.refs.drawer.open()
  } // end openDrawer

  componentWillMount() {
    var self = this;
    if(!this.state.animating){
      this.setToggleTimeout()
    }
    this.getData(this.CalorieCounter);
  } // end componentWillMount

  render() {
    return (
      <Drawer
        ref="drawer"
        type="overlay"
        content={
          <ControlPanel userId={this.props.userId} closeDrawer={this.closeDrawer} updateCalories={this.CalorieCounter}/>
        }
        //need to think what is the best way to close it;
        acceptTap={true}
        tapToClose={true}
        captureGestures={true}
        style={styles.drawer}
        onOpen={() => {
          this.setState({drawerOpen: true})
        }}
        onClose={() => {
          this.setState({drawerOpen: false})
        }}
        
        tweenDuration={100}
        panThreshold={0.08}
        disabled={this.state.drawerDisabled}
        openDrawerOffset={() => width *.5}
        closedDrawerOffset={() => 0}
        panOpenMask={0}
        panCloseMask={0.5}
        negotiatePan
        >
          <View style={styles.container}>
            <HeadBuffer />
            <LogoDisplay openDrawer={this.openDrawer}/>
            <Text style={styles.Title}>Weekly Meals!</Text>
            <ActivityIndicator
              animating={this.state.animating}
              size="large"
              />
              <View
                style={this.state.view}
                elevation={3}
                >
                  <Text style={styles.text}> {global._cals} </Text>
              </View>
            <ScrollView
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
            >
              {this.props.getMealList().map((meal, i) => (
                <View style={styles.searchItemBorder} key={i}>
                  <LoggedMeal
                    recipe={meal.recipe}
                    showInfo={this.gotoNext}
                    token={this.props.getToken()}
                    updateMeals={this.updateMeals}
                    key={i}
                    mealId={meal._id} // eslint-disable-line no-underscore-dangle
                    textStyle={{color: 'white',fontWeight: 'bold', fontSize: 20}}
                  />
                </View>
              ))}

              <Container>
                <Content>
                  <Button rounded large onPress={this.clearMeals} style={styles.clearBtn}>
                     <Text style={styles.clearBtnText}>Clear All</Text>
                  </Button>
                </Content>
              </Container>

            </ScrollView>
          </View>
      </Drawer>
    );
  } // end render
} // end MealList Component

// stylesheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  contentContainer: {
    marginTop: 15,
    alignItems: 'center',
    paddingBottom: 10
  },
  searchItemBorder:{
    padding: 5,
    marginBottom: 5, 
  },
  Title: {
    color: '#1e90ff',
    fontWeight: 'bold',
    marginTop: 5,
    fontSize:24
  },
  text: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  }, 
  //Drawer Related Styles
  drawer: {
    shadowColor: '#000000', 
    shadowOpacity: 0.3, 
    shadowRadius: 15
  },
  clearBtn: {
    width: width * .9,
    backgroundColor: 'red'
  },
  clearBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
}); // end styles
