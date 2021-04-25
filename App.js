import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  SafeAreaView,
  AppRegistry,
  Platform,
  YellowBox,
} from "react-native";
import { enableScreens } from "react-native-screens";
import { AppLoading } from "expo";
import * as Font from "expo-font";
import { createStore, combineReducers, applyMiddleware } from "redux";
import { Provider, useDispatch } from "react-redux";
import ReduxThunk from "redux-thunk";
import * as firebase from "firebase";
import 'react-native-gesture-handler';

import Environment from "./common/constants/Environment";
import NavigationContainer from "./native/navigators/NavigationContainer";
import WebNavigator from "./web/navigators/WebNavigator";
import bugsReducer from "./common/store/reducers/bugsReducer";
import feedsReducer from "./common/store/reducers/feedsReducer";
import projectsReducer from "./common/store/reducers/projectsReducer";
import authReducer from "./common/store/reducers/authReducer";
import teamReducer from "./common/store/reducers/teamReducer";
import requirementsReducer from "./common/store/reducers/requirementsReducer";
import testCasesReducer from "./common/store/reducers/testCasesReducer";
import FeedsAction from "./common/store/actions/feedsActions";
import ProjectsActions from "./common/store/actions/projectsActions";
import MainNavigator from "./web/navigators/MainNavigator";

const rootReducer = combineReducers({
  authReducer: authReducer,
  bugsReducer: bugsReducer,
  feedsReducer: feedsReducer,
  projectsReducer: projectsReducer,
  teamReducer: teamReducer,
  requirementsReducer: requirementsReducer,
  testCasesReducer: testCasesReducer,
});

const store = createStore(rootReducer, applyMiddleware(ReduxThunk));

enableScreens();

const fetchFonts = () => {
  return Font.loadAsync({
    "roboto-light": require("./common/assets/fonts/Roboto-Light.ttf"),
    "roboto-regular": require("./common/assets/fonts/Roboto-Regular.ttf"),
    "roboto-black": require("./common/assets/fonts/Roboto-Black.ttf"),
  });
};

export default function App() {
  const [fontLoaded, setFontLoaded] = useState(false);
  if (!firebase.apps.length) {
    firebase.initializeApp(Environment.firebaseConfig);
  }

  YellowBox.ignoreWarnings(["Setting a timer", "Require cycle"]);

  if (!fontLoaded) {
    return (
      <AppLoading
        startAsync={fetchFonts}
        onFinish={() => setFontLoaded(true)}
      />
    );
  }

  if (Platform.OS === "web") {
    return (
      <Provider store={store}>
        <SafeAreaView style={styles.screen}>
          <WebNavigator />
        </SafeAreaView>
      </Provider>
    );
  }

  return (
    <Provider store={store}>
      <SafeAreaView style={styles.screen}>
        <NavigationContainer />
      </SafeAreaView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  text: {
    fontSize: 22,
  },
});
