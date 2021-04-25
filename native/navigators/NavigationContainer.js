import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  YellowBox,
  StyleSheet,
  ImageBackground,
  Platform,
} from "react-native";
import Toast from "react-native-simple-toast";
import { useSelector } from "react-redux";
import { NavigationActions } from "react-navigation";
import NetInfo from "@react-native-community/netinfo";

import MainNavigator from "./MainNavigator";
import Colors from "../../common/constants/Colors";

const NavigationContainer = (props) => {
  const [isReachable, setIsReachable] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const navRef = useRef();
  const isAuth = useSelector((state) => !!state.authReducer.token);

  useEffect(() => {
    // Subscribe
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
      setIsReachable(state.isInternetReachable);
    });

    if (isConnected && isReachable && !isAuth) {
      Toast.show("Session Expired", Toast.LONG);
      navRef.current.dispatch(
        NavigationActions.navigate({ routeName: "Auth" })
      );
    }

    return () => {
      // Unsubscribe
      unsubscribe();
    };
  }, [isAuth, setIsConnected, setIsReachable, NetInfo]);

  if (!isConnected || !isReachable) {
    return (
      <View style={styles.screen}>
        <ImageBackground
          style={styles.bgImage}
          resizeMode="cover"
          source={require("../../common/assets/splash.png")}
        >
          <Text style={styles.text}>
            Please check your internet connection and try again later...
          </Text>
        </ImageBackground>
      </View>
    );
  }

  return <MainNavigator ref={navRef} />;
};

const styles = StyleSheet.create({
  bgImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontFamily: "roboto-black",
    fontSize: 18,
    color: Colors.light,
    padding: 20,
    textAlign: "center",
  },
});

export default NavigationContainer;
