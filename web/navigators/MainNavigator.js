import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, AsyncStorage } from "react-native";
import { useSelector } from "react-redux";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import * as firebase from "firebase";
import { useDispatch } from "react-redux";

import DrawerNavigator from "./DrawerNavigator";
import StartupScreen from "../screens/StartupScreen";
import AuthScreen from "../screens/user/AuthScreen";

import * as authActions from "../../common/store/actions/authActions";

const MainNavigator = (props) => {
  const [path, setPath] = useState(null);
  const isAuth = useSelector((state) => !!state.authReducer.token);
  const authReducer = useSelector((state) => state.authReducer);
  const dispatch = useDispatch();

  useEffect(() => {
    const sessionExpiry = async () => {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const transformedData = JSON.parse(userData);
        const { token, userId, expiryDate } = transformedData;
        const expirationDate = new Date(expiryDate);

        if (expirationDate <= new Date()) {
          alert("Session expired, please login again.");
          return;
        } else if (!isAuth) {
          setPath("/");
          return;
        }
      }
    };

    sessionExpiry();
  }, [isAuth]);

  useEffect(() => {
    const tryLogin = async () => {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        setPath("/");
        return;
      }
      const transformedData = JSON.parse(userData);
      // const { email, password } = transformedData;
      const { token, userId, expiryDate } = transformedData;
      const expirationDate = new Date(expiryDate);

      if (expirationDate <= new Date()) {
        alert("Session expired, please login again.");
        return;
      } else if (!token || !userId) {
        setPath("/");
        return;
      }

      const expirationTime = expirationDate.getTime() - new Date().getTime();

      dispatch(authActions.authenticate(userId, token, expirationTime)).then(
        async () => {
          setPath("/Home");
        }
      );
      // dispatch(authActions.login(email, password));
    };

    tryLogin();
  }, [dispatch, setPath]);

  // switch (screen) {
  //   case "StartupScreen":
  //     return (
  //       <StartupScreen navigation={{ navigate: navigate, params: params }} />
  //     );
  //   case "Auth":
  //     return <AuthScreen navigation={{ navigate: navigate, params: params }} />;
  //   case "Main":
  //     return (
  //       <DrawerNavigator navigation={{ navigate: navigate, params: params }} />
  //     );
  // }

  return (
    <Router>
      {path && <Redirect to={path} />}
      <Switch>
        <Route path="/loading">
          <StartupScreen />
        </Route>
        <Route exact path="/">
          <AuthScreen />
        </Route>
        <Route path="/Home">
          <DrawerNavigator />
        </Route>
      </Switch>
    </Router>
  );
};

const styles = StyleSheet.create({});

export default MainNavigator;
