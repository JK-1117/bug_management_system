import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableWithoutFeedback
} from "react-native";
import { Avatar } from "react-native-elements";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import * as firebase from "firebase";

import Colors from "../../../common/constants/Colors";
import HeaderButton from "../../components/UI/HeaderButton";
import LoadingModal from "../../components/modals/LoadingModal";
import * as Util from "../../../common/utils/Util";
import * as authActions from "../../../common/store/actions/authActions";

const ProfileScreen = props => {
  const userCrud = useSelector(state => state.authReducer);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const [isEditMode, setIsEditMode] = useState(false);
  const [displayName, setDisplayName] = useState(
    userCrud.user.displayName ? userCrud.user.displayName : ""
  );
  const [photoUrl, setPhotoUrl] = useState(
    userCrud.user.photoUrl ? userCrud.user.photoUrl : ""
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (error) {
      Alert.alert("An error occured", error, [{ text: "Okay" }]);
    }
  }, [error]);

  const editDisplayNameHandler = useCallback(async () => {
    setError(null);
    if (displayName && displayName.trim().length > 0) {
      setIsLoading(true);
      try {
        await dispatch(
          authActions.updateDisplayName(
            userCrud.userId,
            userCrud.token,
            displayName
          )
        );
      } catch (err) {
        setError(err.message);
      }
    } else {
      console.log("ERROR");
      setError("username cannot be empty");
    }
    setIsEditMode(false);
    setIsLoading(false);
  }, [dispatch, setError, setIsLoading, displayName]);

  const verifyPermissions = async () => {
      const result = await Permissions.askAsync(
        Permissions.CAMERA,
        Permissions.CAMERA_ROLL
      );
      if (result.status !== "granted") {
        Alert.alert(
          "Insuficient permission!",
          "You need to grant camera permissions to continue.",
          [{ text: "Okay" }]
        );
        return false;
      }
      return true;
  };

  const editAvatarHandler = useCallback(async () => {
    if (!verifyPermissions) {
      return;
    }
    setError(null);
    setIsLoading(true);
    const image = await ImagePicker.launchImageLibraryAsync({ quality: 1 });
    if (image.cancelled) {
      setIsLoading(false);
      return;
    } else {
      const response = await fetch(image.uri);
      const blob = await response.blob();
      const ext = "." + image.uri.split(".").pop();

      var ref = firebase
        .storage()
        .ref()
        .child("avatars/" + userCrud.userId + ext);

      ref.put(blob).on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        snapshot => {
          setIsLoading(true);
        },
        err => {
          setError(err.message);
        },
        async () => {
          await ref.getDownloadURL().then(async url => {
            setPhotoUrl(url);
            await dispatch(
              authActions.updatePhoto(userCrud.userId, userCrud.token, url)
            );
          });
          setIsLoading(false);
        }
      );
    }
  }, [dispatch, setIsLoading, setError]);

  const resetPasswordHandler = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      await dispatch(authActions.resetPassword(userCrud.user.email));
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
    Alert.alert(
      "Resetting Password",
      "An email has been sent to you with password reset instructions",
      [{ text: "Okay" }]
    );
  }, [dispatch, setError, setIsLoading]);

  return (
    <ScrollView style={styles.scroll}>
      {isLoading && <LoadingModal />}
      <View style={styles.screen}>
        <Avatar
          size="xlarge"
          title={Util.getInitials(
            userCrud.user.displayName
              ? userCrud.user.displayName
              : userCrud.user.email
          )}
          rounded
          key={new Date().getTime()}
          source={
            userCrud.user.photoUrl
              ? {
                  uri: userCrud.user.photoUrl
                }
              : null
          }
          showEditButton={true}
          activeOpacity={0.7}
          containerStyle={styles.avatar}
          onEditPress={editAvatarHandler}
        />

        <View style={styles.section}>
          <Text style={styles.label}>E-mail:</Text>
          <Text style={styles.text}>{userCrud.user.email}</Text>
          <View style={styles.icon}>
            <MaterialCommunityIcons name="email" size={25} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Name:</Text>
          {isEditMode ? (
            <TextInput
              style={styles.text}
              placeholder="Enter your username"
              keyboardType="default"
              autoCapitalize="words"
              autoCorrect={false}
              value={displayName}
              onChangeText={text => {
                setDisplayName(text);
              }}
            />
          ) : (
            <Text style={styles.text}>{userCrud.user.displayName}</Text>
          )}
          {isEditMode ? (
            <TouchableWithoutFeedback
              style={styles.icon}
              onPress={editDisplayNameHandler}
            >
              <MaterialCommunityIcons name="check" size={25} />
            </TouchableWithoutFeedback>
          ) : (
            <TouchableWithoutFeedback
              style={styles.icon}
              onPress={() => {
                setIsEditMode(true);
              }}
            >
              <MaterialCommunityIcons name="account-edit" size={25} />
            </TouchableWithoutFeedback>
          )}
        </View>

        <Text style={styles.alternativeText} onPress={resetPasswordHandler}>
          Reset Password
        </Text>
      </View>
    </ScrollView>
  );
};

ProfileScreen.navigationOptions = navData => {
  return {
    headerTitle: "User Profile",
    headerLeft: (
      <HeaderButtons HeaderButtonComponent={HeaderButton}>
        <Item
          title="Menu"
          iconName="menu"
          onPress={() => {
            navData.navigation.toggleDrawer();
          }}
        />
      </HeaderButtons>
    )
  };
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.bgColor
  },
  screen: {
    flex: 1,
    alignItems: "center"
  },
  avatar: {
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.26,
    elevation: 5,
    backgroundColor: "white",
    margin: 30
  },
  section: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: "#fff",
    padding: 15,
    borderBottomColor: Colors.dark,
    borderBottomWidth: 1
  },
  label: {
    fontFamily: "roboto-regular",
    fontSize: 20
  },
  text: {
    flex: 1,
    textAlign: "right",
    fontFamily: "roboto-regular",
    fontSize: 20,
    paddingHorizontal: 10
  },
  alternativeText: {
    fontFamily: "roboto-regular",
    fontSize: 15,
    textDecorationLine: "underline",
    padding: 15,
    color: Colors.primaryColor
  }
});

export default ProfileScreen;
