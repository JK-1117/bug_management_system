import React, { useReducer, useEffect } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";

const INPUT_CHANGE = "INPUT_CHANGE";
const INPUT_BLUR = "INPUT_BLUR";

const inputReducer = (state, action) => {
  switch (action.type) {
    case INPUT_CHANGE:
      return {
        ...state,
        value: action.value,
        isValid: action.isValid
      };
    case INPUT_BLUR:
      return {
        ...state,
        touched: true
      };
    default:
      return state;
  }
};

const FormInput = props => {
  const [inputState, dispatch] = useReducer(inputReducer, {
    value: props.initialValue ? props.initialValue : "",
    isValid: props.initiallyValid,
    touched: false
  });

  const { onInputChange } = props;

  useEffect(() => {
    if (inputState.touched) {
      onInputChange(props.id, inputState.value, inputState.isValid);
    }
  }, [inputState, onInputChange]);

  const textChangeHandler = text => {
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let isValid = true;
    if (props.required && text.trim().length === 0) {
      isValid = false;
    }
    if (props.email && !emailRegex.test(text.toLowerCase())) {
      isValid = false;
    }
    if (props.min != null && +text < props.min) {
      isValid = false;
    }
    if (props.max != null && +text > props.max) {
      isValid = false;
    }
    if (props.minLength != null && text.length < props.minLength) {
      isValid = false;
    }
    dispatch({ type: INPUT_CHANGE, value: text, isValid: isValid });
  };

  const lostFocusHandler = () => {
    dispatch({ type: INPUT_BLUR });
  };

  return (
    <View style={styles.formGroup}>
      <Text style={styles.formLabel}>
        {props.label}
        {props.required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        {...props}
        style={{ ...styles.formControl, ...props.inputStyle }}
        value={inputState.value}
        onChangeText={textChangeHandler}
        onTouchEnd={lostFocusHandler}
      />
      {!inputState.isValid && inputState.touched && (
        <Text style={styles.required}>{props.errorText}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  formGroup: {
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#fff"
  },
  formLabel: {
    fontFamily: "roboto-regular",
    fontSize: 14,
    textAlignVertical: "center",
    marginVertical: 3
  },
  formControl: {
    width: "100%",
    fontSize: 18,
    paddingHorizontal: 2,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1
  },
  required: { color: "red", fontSize: 12 }
});

export default FormInput;
