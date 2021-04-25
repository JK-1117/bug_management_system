import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  ActivityIndicator,
  Alert,
  AsyncStorage,
  StyleSheet,
} from "react-native";
import { Redirect } from "react-router-dom";
import { useDispatch } from "react-redux";

import Colors from "../../common/constants/Colors";
import { alertMessage } from "../../common/utils/Util";
import * as authActions from "../../common/store/actions/authActions";
import * as FeedsActions from "../../common/store/actions/feedsActions";
import * as TeamActions from "../../common/store/actions/teamActions";
import * as ProjectsActions from "../../common/store/actions/projectsActions";
import * as BugsActions from "../../common/store/actions/bugsActions";
import * as RequirementsActions from "../../common/store/actions/requirementsActions";
import * as TestCasesActions from "../../common/store/actions/testCasesActions";

const StartupScreen = (props) => {
  const [error, setError] = useState();
  const [path, setPath] = useState(null);
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

      if (expirationDate <= new Date() || !token || !userId) {
        setPath("/");
        return;
      }

      const expirationTime = expirationDate.getTime() - new Date().getTime();

      dispatch(authActions.authenticate(userId, token, expirationTime)).then(
        async () => {
          await loadFeeds();
          setPath("/Home");
        }
      );
      // dispatch(authActions.login(email, password));
    };

    tryLogin();
  }, [dispatch, loadFeeds, setPath]);

  useEffect(() => {
    if (error) {
      props.alert("An error occured", error, [{ text: "Ok" }]);
    }
  }, [error]);

  return (
    <View style={styles.screen}>
      {path && <Redirect to={path} />}
      <ActivityIndicator size="large" color={Colors.primaryColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default StartupScreen;
