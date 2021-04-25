import React, { useState, useReducer, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Button,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { Redirect } from "react-router-dom";

import PasswordField from "../../components/UI/PasswordField";
import Alert from "../../components/UI/Alert";

import Colors from "../../../common/constants/Colors";
import { alertMessage, useQuery } from "../../../common/utils/Util";
import * as authActions from "../../../common/store/actions/authActions";
import * as FeedsActions from "../../../common/store/actions/feedsActions";

const INPUT_CHANGE = "INPUT_CHANGE";

const formReducer = (state, action) => {
  switch (action.type) {
    case INPUT_CHANGE:
      const newValues = {
        ...state.values,
        [action.inputId]: action.values,
      };
      const newIsValid = {
        ...state.isValid,
        [action.inputId]: action.isValid,
      };
      let newFormIsValid = true;
      for (const key in newIsValid) {
        newFormIsValid = newFormIsValid && newIsValid[key];
      }
      return {
        values: newValues,
        isValid: newIsValid,
        formIsValid: newFormIsValid,
      };
    default:
      return state;
  }
};

const AuthScreen = (props) => {
  const [path, setPath] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [AlertTitle, setAlertTitle] = useState("");
  const [AlertContent, setAlertContent] = useState("");
  const [AlertButtons, setAlertButtons] = useState([]);
  const [error, setError] = useState();
  const [isSignup, setIsSignup] = useState(false);
  const query = useQuery();

  const alert = (title, content, buttons) => {
    setAlertTitle(title);
    setAlertContent(content);
    setAlertButtons(buttons);
    setShowAlert(true);
  };

  const [formState, formDispatch] = useReducer(formReducer, {
    values: {
      email: "",
      password: "",
      username: "",
    },
    isValid: {
      email: false,
      password: false,
      username: false,
    },
    formIsValid: false,
  });

  const textChangeHandler = useCallback(
    (inputIdentifier, text) => {
      const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      let isValid = true;
      if (text.trim().length === 0) {
        isValid = false;
      }
      if (inputIdentifier === "email" && !emailRegex.test(text.toLowerCase())) {
        isValid = false;
      }
      if (inputIdentifier === "password" && text.length < 6) {
        isValid = false;
      }
      if (!isSignup) {
        formDispatch({
          type: INPUT_CHANGE,
          values: formState.values.username,
          isValid: true,
          inputId: "username",
        });
      }
      formDispatch({
        type: INPUT_CHANGE,
        values: text,
        isValid: isValid,
        inputId: inputIdentifier,
      });
    },
    [formDispatch, isSignup]
  );

  useEffect(() => {
    if (error) {
      alert("An error occured", error, [{ text: "Ok" }]);
    }
  }, [error]);

  const dispatch = useDispatch();
  const authHandler = async () => {
    let action = isSignup
      ? authActions.signup(
          formState.values.email,
          formState.values.password,
          formState.values.username
        )
      : authActions.login(formState.values.email, formState.values.password);

    if (!formState.formIsValid && isSignup) {
      let error = "";
      error += formState.isValid.email ? "" : "Please enter a valid email.\n";
      error += formState.isValid.password
        ? ""
        : "Password length should be at least 6";
      error += formState.isValid.username ? "" : "username cannot be empty";

      alert("Signup failed", error, [{ text: "Ok" }]);
    } else {
      setError(null);
      setIsLoading(true);
      try {
        await dispatch(action);
        setPath("loading");
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    }
  };

  const resetPasswordHandler = async () => {
    if (!formState.isValid.email) {
      alert("Invalid Input", "Please enter a valid email.", [
        { text: "Ok" },
      ]);
    } else {
      setError(null);
      setIsLoading(true);
      try {
        await dispatch(authActions.resetPassword(formState.values.email));
      } catch (err) {
        setError(err.message);
      }
      setIsLoading(false);
      alert(
        "Resetting Password",
        "An email has been sent to you with password reset instructions",
        [{ text: "Ok" }]
      );
    }
  };
  return (
    <LinearGradient
      colors={[Colors.accentColor, Colors.primaryColor]}
      start={[0, 1]}
      end={[1, 0]}
      style={styles.screen}
    >
      {path && <Redirect to={path} />}
      {showAlert && (
        <Alert
          show={setShowAlert}
          title={AlertTitle}
          content={AlertContent}
          buttonArray={AlertButtons}
        />
      )}
      <View style={styles.form}>
        <Image
          source={require("../../../common/assets/dragonfly_logo.png")}
          style={styles.logo}
        />
        {isSignup && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Username"
              placeholderTextColor="#fff"
              keyboardType="default"
              autoCapitalize="words"
              autoCorrect={false}
              value={formState.values.username}
              onChangeText={(text) => {
                textChangeHandler("username", text);
              }}
            />
            <MaterialIcons
              name="person"
              color={Colors.light}
              size={30}
              style={styles.inputLabel}
            />
          </View>
        )}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Email"
            placeholderTextColor="#fff"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={formState.values.email}
            onChangeText={(text) => {
              textChangeHandler("email", text);
            }}
          />
          <MaterialIcons
            name="email"
            color={Colors.light}
            size={30}
            style={styles.inputLabel}
          />
        </View>
        <View style={styles.inputContainer}>
          <PasswordField
            placeholder="Password"
            placeholderTextColor="#fff"
            value={formState.values.password}
            onChangeText={(text) => {
              textChangeHandler("password", text);
            }}
          />
        </View>

        <View style={styles.buttonContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color={Colors.primaryColorLight} />
          ) : (
            <View style={styles.button}>
              <Button
                title={isSignup ? "Sign Up" : "Login"}
                color={Colors.primaryColorDark}
                onPress={authHandler}
              />
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Text
            style={styles.alternativeText}
            onPress={() => {
              setIsSignup((prevState) => !prevState);
            }}
          >
            {isSignup ? "Login with an existing account" : "Create an Account"}
          </Text>
        </View>

        {!isSignup && (
          <View style={styles.buttonContainer}>
            <Text style={styles.alternativeText} onPress={resetPasswordHandler}>
              Forgot password?
            </Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { width: "100%", height: 150, marginBottom: 20 },
  form: {
    width: 400,
    paddingTop: 50,
    paddingBottom: 100,
    paddingHorizontal: 50,
    backgroundColor: "#6a818c",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.26,
    elevation: 8,
    borderRadius: 10,
  },
  inputContainer: {
    flexDirection: "row",
    width: "100%",
    marginVertical: 10,
    borderRadius: 20,
    borderColor: Colors.light,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  inputLabel: {
    marginLeft: 20,
  },
  textInput: {
    flex: 1,
    color: Colors.light,
    padding: 0,
  },
  buttonContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  button: {
    flex: 1,
  },
  alternativeText: {
    textDecorationLine: "underline",
    color: "white",
  },
});

export default AuthScreen;
