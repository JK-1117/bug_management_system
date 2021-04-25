import React, { useState, useCallback, useEffect } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { Avatar } from "react-native-elements";
import { useDispatch } from "react-redux";

import * as Util from "../../../common/utils/Util";
import * as AuthActions from "../../../common/store/actions/authActions";
import User from "../../../common/models/User";
import Colors from "../../../common/constants/Colors";

const TeamItem = props => {
  const [error, setError] = useState(null);
  const [user, setUser] = useState(new User());

  const dispatch = useDispatch();

  const getUser = useCallback(async () => {
    setError(null);
    try {
      const profile = await dispatch(AuthActions.getUserById(props.userId));
      if (profile) {
        setUser(profile);
      }
    } catch (err) {
      setError(err.message);
    }
  }, [dispatch, setError]);

  useEffect(() => {
    getUser();
    if (error) {
      Alert.alert("An error occured", error, [{ text: "Okay" }]);
    }
  }, [error, getUser]);

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Avatar
          size="medium"
          title={Util.getInitials(
            user.displayName ? user.displayName : user.email
          )}
          key={new Date().getTime()}
          source={
            user.photoUrl
              ? {
                  uri: user.photoUrl
                }
              : null
          }
          rounded
          overlayContainerStyle={{
            backgroundColor: Colors.primaryColorDark
          }}
          activeOpacity={0.7}
          containerStyle={styles.avatar}
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.username}>{user.displayName}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: "#fff",
    marginVertical: 2,
    padding: 10
  },
  avatarContainer: { paddingHorizontal: 20 },
  avatar: {
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.26,
    elevation: 5,
    backgroundColor: "white"
  },
  textContainer: {
    flexDirection: "column",
    flex: 1,
    justifyContent: "center"
  },
  username: {
    fontFamily: "roboto-regular",
    fontSize: 20
  },
  email: {
    fontFamily: "roboto-regular",
    fontSize: 14,
    textAlignVertical: "center"
  }
});

export default TeamItem;
