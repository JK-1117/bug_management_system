import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
//   TextInput,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from "react-native";
import { Avatar } from "react-native-elements";
import { TextInput } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import * as firebase from "firebase";

import Colors from "../../../common/constants/Colors";
import * as Util from "../../../common/utils/Util";
import * as authActions from "../../../common/store/actions/authActions";

import Card from "../../components/UI/Card";

const ProfileScreen = (props) => {
  const userCrud = useSelector((state) => state.authReducer);
  const { setIsLoading } = props;
  const [error, setError] = useState();
  const [isEditMode, setIsEditMode] = useState(false);
  const [displayName, setDisplayName] = useState(
    userCrud.user.displayName ? userCrud.user.displayName : ""
  );
  const [photoUrl, setPhotoUrl] = useState(
    userCrud.user.photoUrl ? userCrud.user.photoUrl : ""
  );
  const dispatch = useDispatch();

  const editAvatarHandler = useCallback(async () => {
    try {
      setError(null);
      const image = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 1,
      });
      if (image.cancelled) {
        console.log("image cancelled:", image);
        setIsLoading(false);
        return;
      } else {
        setIsLoading(true);
        const response = await fetch(image.uri);
        const blob = await response.blob();
        const ext = "." + blob.type.split("/").pop();

        var ref = firebase
          .storage()
          .ref()
          .child("avatars/" + userCrud.userId + ext);

        ref.put(blob).on(
          firebase.storage.TaskEvent.STATE_CHANGED,
          (snapshot) => {
            setIsLoading(true);
          },
          (err) => {
            setError(err.message);
          },
          async () => {
            await ref.getDownloadURL().then(async (url) => {
              setPhotoUrl(url);
              await dispatch(
                authActions.updatePhoto(userCrud.userId, userCrud.token, url)
              );
            });
            setIsLoading(false);
          }
        );
      }
      setIsLoading(false);
    } catch (err) {
      setError(err);
    }
  }, [dispatch, setIsLoading, setError]);

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

  const resetPasswordHandler = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      await dispatch(authActions.resetPassword(userCrud.user.email));
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
    props.alert(
      "Resetting Password",
      "An email has been sent to you with password reset instructions",
      [{ text: "Okay" }]
    );
  }, [dispatch, setError, setIsLoading]);

  useEffect(() => {
    if (error) {
      props.alert("An error occured", error, [{ text: "Okay" }]);
    }
  }, [error]);

  return (
    <View style={styles.screen}>
      <Card style={styles.form}>
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
                  uri: userCrud.user.photoUrl,
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
              onChangeText={(text) => {
                setDisplayName(text);
              }}
            />
          ) : (
            <Text style={styles.text}>{userCrud.user.displayName}</Text>
          )}
          {isEditMode ? (
            <TouchableWithoutFeedback
              title="Save"
              style={styles.icon}
              onPress={editDisplayNameHandler}
            >
              <MaterialCommunityIcons name="check" size={25} />
            </TouchableWithoutFeedback>
          ) : (
            <TouchableWithoutFeedback
              title="Edit Username"
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
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
  },
  form: {
    flex: 1,
    alignItems: "center",
    width: "80%",
    backgroundColor: "#fff",
    paddingHorizontal: 30,
    paddingVertical: 10,
  },
  title: {
    width: "100%",
    padding: 10,
    fontSize: 20,
  },
  avatar: {
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.26,
    elevation: 5,
    backgroundColor: "white",
    margin: 30,
  },
  section: {
    flexDirection: "row",
    width: "60%",
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderBottomColor: Colors.dark,
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 20,
  },
  text: {
    flex: 1,
    textAlign: "right",
    fontSize: 20,
    paddingHorizontal: 10,
    height: 28,
    marginHorizontal: 20
  },
  alternativeText: {
    fontSize: 15,
    textDecorationLine: "underline",
    padding: 15,
    color: Colors.primaryColor,
  },
});

export default ProfileScreen;
