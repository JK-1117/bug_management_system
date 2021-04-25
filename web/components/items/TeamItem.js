import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableWithoutFeedback,
  Button,
} from "react-native";
import { Avatar } from "react-native-elements";
import { IconButton, Menu } from "react-native-paper";
import { useDispatch } from "react-redux";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import * as Util from "../../../common/utils/Util";
import * as AuthActions from "../../../common/store/actions/authActions";
import User from "../../../common/models/User";
import Colors from "../../../common/constants/Colors";

const TeamItem = (props) => {
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
                  uri: user.photoUrl,
                }
              : null
          }
          rounded
          overlayContainerStyle={{
            backgroundColor: Colors.primaryColorDark,
          }}
          activeOpacity={0.7}
          containerStyle={styles.avatar}
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.username}>{user.displayName}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>
      <View>
        <IconButton
          icon="delete"
          color={Colors.criticalDark}
          size={25}
          onPress={() => {
            props.removeUser(user.email, user.displayName, props.role);
          }}
        />
        <IconButton
          icon="pencil-circle-outline"
          color={Colors.primaryColor}
          size={25}
          onPress={() => {
            props.inputChangeHandler("email", user.email, true);
            props.inputChangeHandler("username", user.displayName, true);
            props.inputChangeHandler("role", props.role, true);
            props.setSelectedUser(true);
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#fff",
    marginVertical: 2,
    paddingVertical: 10,
    borderColor: Colors.bgColor,
    borderTopWidth: 2,
    borderBottomWidth: 2,
  },
  avatarContainer: { paddingRight: 20 },
  avatar: {
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.26,
    elevation: 5,
    backgroundColor: "white",
  },
  textContainer: {
    flexDirection: "column",
    flex: 1,
    justifyContent: "center",
  },
  username: {
    fontSize: 20,
  },
  email: {
    fontSize: 14,
    textAlignVertical: "center",
  },
});

export default TeamItem;
