import React, { useReducer, useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Button,
  Alert,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Picker
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

import Colors from "../../../common/constants/Colors";
import FormInput from "../UI/FormInput";
import * as AuthActions from "../../../common/store/actions/authActions";
import * as TeamActions from "../../../common/store/actions/teamActions";

const FORM_UPDATE = "FORM_UPDATE";

const formReducer = (state, action) => {
  if (action.type === FORM_UPDATE) {
    const updatedValues = {
      ...state.inputValues,
      [action.inputId]: action.value
    };
    const updatedValidities = {
      ...state.inputValidities,
      [action.inputId]: action.isValid
    };
    let updatedFormIsValid = true;
    for (const key in updatedValidities) {
      updatedFormIsValid = updatedFormIsValid && updatedValidities[key];
    }
    return {
      inputValues: updatedValues,
      inputValidities: updatedValidities,
      formIsValid: updatedFormIsValid
    };
  }
  return state;
};

const AddUserModal = props => {
  const ROLE = ["Admin", "Developer", "Spectator"];
  const TEAM = useSelector(state => state.teamReducer.teamUser);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const dispatch = useDispatch();

  const [formState, dispatchFormState] = useReducer(formReducer, {
    inputValues: {
      email: "",
      role: "Developer"
    },
    inputValidities: {
      email: false,
      role: true
    },
    formIsValid: false
  });

  const inputChangeHandler = useCallback(
    (inputIdentifier, inputValue, inputValidity) => {
      dispatchFormState({
        type: FORM_UPDATE,
        value: inputValue,
        isValid: inputValidity,
        inputId: inputIdentifier
      });
    },
    [dispatchFormState]
  );

  const submitHandler = useCallback(async () => {
    setError(null);
    try {
      if (!formState.formIsValid) {
        Alert.alert("Input not valid", "Please check the error in the form.", [
          { text: "Okay" }
        ]);
      } else {
        setIsLoading(true);
        const userId = await dispatch(
          AuthActions.getUserByEmail(formState.inputValues.email)
        );
        if (!userId) {
          setError(
            "User not found, please ensure the email entered is correct."
          );
        } else if (TEAM.filter(item => item.userId === userId).length > 0) {
          setError("User is already in the team");
        } else {
          await dispatch(
            TeamActions.createInvitation(userId, formState.inputValues.role)
          );
          props.toggle(false);
        }
      }
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
  }, [dispatch, formState]);

  useEffect(() => {
    if (error) {
      Alert.alert("Something went wrong...", error, [{ text: "Okay" }]);
    }
  }, [error]);

  return (
    <Modal transparent={true} visible={props.visible} animationType="fade">
      <TouchableWithoutFeedback
        onPress={() => {
          props.toggle(false);
        }}
      >
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <FormInput
              id="email"
              label="E-mail"
              errorText="Please enter a valid email"
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              onInputChange={inputChangeHandler}
              initialValue={formState.inputValues.email}
              initiallyValid={false}
              required
              email
            />

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Role<Text style={styles.required}>*</Text>
              </Text>
              <Picker
                mode="dropdown"
                selectedValue={formState.inputValues.role}
                style={styles.formControl}
                onValueChange={(itemValue, itemIndex) => {
                  inputChangeHandler("role", itemValue, true);
                }}
              >
                {ROLE.map(item => {
                  return (
                    <Picker.Item
                      key={item + new Date().getTime()}
                      label={item}
                      value={item}
                    />
                  );
                })}
              </Picker>
            </View>

            <View style={styles.formGroup}>
              {isLoading ? (
                <ActivityIndicator
                  color={Colors.primaryColorLight}
                  size="small"
                />
              ) : (
                <View style={styles.buttonContainer}>
                  <View style={styles.btn}>
                    <Button
                      title="Confirm"
                      color={Colors.primaryColorDark}
                      onPress={submitHandler}
                    />
                  </View>
                  <View style={styles.btn}>
                    <Button
                      title="Cancel"
                      color={Colors.dangerDark}
                      onPress={() => props.toggle(false)}
                    />
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    backgroundColor: "rgba(0,0,0,0.3)"
  },
  modalContent: {
    width: "80%",
    backgroundColor: Colors.bgColor,
    // right: 5,
    // elevation: 8,
    shadowColor: "black",
    shadowOpacity: 0.26,
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 8
  },
  formGroup: {
    justifyContent: "center",
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff"
  },
  formLabel: {
    fontFamily: "roboto-regular",
    fontSize: 14,
    textAlignVertical: "center"
  },
  formControl: {
    width: "100%",
    fontSize: 18,
    borderBottomColor: "gray",
    borderBottomWidth: 1
  },
  required: {
    color: Colors.danger
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  btn: {
    marginHorizontal: 5
  }
});

export default AddUserModal;
