import React, { useState, useReducer, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Alert
} from "react-native";
import { SwitchActions } from "react-navigation";
import { MaterialIcons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";

import Colors from "../../../common/constants/Colors";
import MainButton from "../../components/UI/MainButton";
import FormInput from "../../components/UI/FormInput";
import PasswordField from "../../components/UI/PasswordField";
import * as authActions from "../../../common/store/actions/authActions";

const INPUT_CHANGE = "INPUT_CHANGE";

const formReducer = (state, action) => {
  switch (action.type) {
    case INPUT_CHANGE:
      const newValues = {
        ...state.values,
        [action.inputId]: action.values
      };
      const newIsValid = {
        ...state.isValid,
        [action.inputId]: action.isValid
      };
      let newFormIsValid = true;
      for (const key in newIsValid) {
        newFormIsValid = newFormIsValid && newIsValid[key];
      }
      return {
        values: newValues,
        isValid: newIsValid,
        formIsValid: newFormIsValid
      };
    default:
      return state;
  }
};

const AuthScreen = props => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const [isSignup, setIsSignup] = useState(false);
  const [formState, formDispatch] = useReducer(formReducer, {
    values: {
      email: "",
      password: "",
      username: ""
    },
    isValid: {
      email: false,
      password: false,
      username: false
    },
    formIsValid: false
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
          inputId: "username"
        });
      }
      formDispatch({
        type: INPUT_CHANGE,
        values: text,
        isValid: isValid,
        inputId: inputIdentifier
      });
    },
    [formDispatch, isSignup]
  );

  useEffect(() => {
    if (error) {
      Alert.alert("An error occured", error, [{ text: "Okay" }]);
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

      Alert.alert("Signup failed", error, [{ text: "Okay" }]);
    } else {
      setError(null);
      setIsLoading(true);
      try {
        await dispatch(action);
        props.navigation.navigate("StartupScreen");
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    }
  };

  const resetPasswordHandler = async () => {
    if (!formState.isValid.email) {
      Alert.alert("Invalid Input", "Please enter a valid email.", [
        { text: "Okay" }
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
      Alert.alert(
        "Resetting Password",
        "An email has been sent to you with password reset instructions",
        [{ text: "Okay" }]
      );
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ImageBackground
        style={styles.bgImage}
        resizeMode="cover"
        source={require("../../../common/assets/bgImage.png")}
      >
        <View style={styles.main}>
          <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={30}>
            {isSignup && (
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Username"
                  keyboardType="default"
                  autoCapitalize="words"
                  autoCorrect={false}
                  value={formState.values.username}
                  onChangeText={text => {
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
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={formState.values.email}
                onChangeText={text => {
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
                value={formState.values.password}
                onChangeText={text => {
                  textChangeHandler("password", text);
                }}
              />
            </View>
          </KeyboardAvoidingView>

          <View style={styles.buttonContainer}>
            {isLoading ? (
              <ActivityIndicator
                size="large"
                color={Colors.primaryColorLight}
              />
            ) : (
              <MainButton style={styles.button} onPress={authHandler}>
                {isSignup ? "Sign Up" : "Login"}
              </MainButton>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <Text
              style={styles.alternativeText}
              onPress={() => {
                setIsSignup(prevState => !prevState);
              }}
            >
              {isSignup
                ? "Login with an existing account"
                : "Create an Account"}
            </Text>
          </View>

          {!isSignup && (
            <View style={styles.buttonContainer}>
              <Text
                style={styles.alternativeText}
                onPress={resetPasswordHandler}
              >
                Forgot password?
              </Text>
            </View>
          )}
        </View>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  bgImage: {
    width: "100%",
    height: "100%"
  },
  main: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  logoContainer: {
    width: "80%",
    height: 150,
    marginTop: 50,
    marginBottom: 20
  },
  logo: {
    width: "100%",
    height: "100%"
  },
  inputContainer: {
    flexDirection: "row",
    width: "80%",
    marginVertical: 10,
    borderRadius: 20,
    borderColor: Colors.light,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 15
  },
  inputLabel: {
    marginLeft: 10
  },
  textInput: {
    flex: 1,
    fontFamily: "roboto-regular",
    color: Colors.light,
    padding: 0
  },
  buttonContainer: {
    width: "80%",
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10
  },
  button: {
    flex: 1
  },
  alternativeText: {
    fontFamily: "roboto-regular",
    textDecorationLine: "underline",
    color: "white"
  }
});

export default AuthScreen;
