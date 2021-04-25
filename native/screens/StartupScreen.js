import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  ActivityIndicator,
  Alert,
  AsyncStorage,
  StyleSheet
} from "react-native";
import { Notifications } from "expo";
import * as Permissions from "expo-permissions";
import { useDispatch } from "react-redux";

import Colors from "../../common/constants/Colors";
import * as authActions from "../../common/store/actions/authActions";
import * as FeedsActions from "../../common/store/actions/feedsActions";
import * as TeamActions from "../../common/store/actions/teamActions";
import * as ProjectsActions from "../../common/store/actions/projectsActions";
import * as BugsActions from "../../common/store/actions/bugsActions";
import * as RequirementsActions from "../../common/store/actions/requirementsActions";
import * as TestCasesActions from "../../common/store/actions/testCasesActions";

const StartupScreen = props => {
  const [error, setError] = useState();
  const dispatch = useDispatch();
  const loadFeeds = useCallback(async () => {
    setError(null);
    try {
      dispatch(FeedsActions.fetchFeeds());
      dispatch(ProjectsActions.fetchProjects());
      dispatch(BugsActions.fetchBugs());
      dispatch(RequirementsActions.fetchRequirements());
      dispatch(TestCasesActions.fetchTestcase());
      dispatch(TeamActions.fetchTeam());
      dispatch(TeamActions.fetchInvitation());
    } catch (err) {
      setError(err.message);
    }
  }, [dispatch, setError]);

  const getExpoToken = async () => {
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    // only asks if permissions have not already been determined, because
    // iOS won't necessarily prompt the user a second time.
    // On Android, permissions are granted on app installation, so
    // `askAsync` will never prompt the user

    // Stop here if the user did not grant permissions
    if (status !== "granted") {
      alert("No notification permissions!");
      return;
    }

    // Get the token that identifies this device
    let token = await Notifications.getExpoPushTokenAsync();
    dispatch(authActions.updateExpoToken(token));
    dispatch(TeamActions.updateExpoToken(token));
  };

  useEffect(() => {
    const tryLogin = async () => {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        props.navigation.navigate("Auth");
        return;
      }
      const transformedData = JSON.parse(userData);
      // const { email, password } = transformedData;
      const { token, userId, expiryDate } = transformedData;
      const expirationDate = new Date(expiryDate);

      if (expirationDate <= new Date() || !token || !userId) {
        props.navigation.navigate("Auth");
        return;
      }

      const expirationTime = expirationDate.getTime() - new Date().getTime();

      dispatch(authActions.authenticate(userId, token, expirationTime)).then(
        async () => {
          await loadFeeds();
          await getExpoToken();
          props.navigation.navigate("Main");
        }
      );
      // dispatch(authActions.login(email, password));
    };

    tryLogin();
  }, [dispatch, loadFeeds]);

  useEffect(() => {
    if (error) {
      Alert.alert("An error occured", error, [{ text: "Okay" }]);
    }
  }, [error]);

  return (
    <View style={styles.screen}>
      <ActivityIndicator size="large" color={Colors.primaryColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

export default StartupScreen;
