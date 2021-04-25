import React, { useReducer, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { TextInput, HelperText } from "react-native-paper";

const INPUT_CHANGE = "INPUT_CHANGE";
const INPUT_BLUR = "INPUT_BLUR";

const inputReducer = (state, action) => {
  switch (action.type) {
    case INPUT_CHANGE:
      return {
        ...state,
        value: action.value,
        isValid: action.isValid,
      };
    case INPUT_BLUR:
      return {
        ...state,
        touched: true,
      };
    default:
      return state;
  }
};

const FormInput = (props) => {
  const [inputState, dispatch] = useReducer(inputReducer, {
    value: props.initialValue ? props.initialValue : "",
    isValid: props.initiallyValid,
    touched: false,
  });

  const { onInputChange } = props;

  useEffect(() => {
    onInputChange(props.id, inputState.value, inputState.isValid);
  }, [inputState, onInputChange]);

  const textChangeHandler = (text) => {
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

  useEffect(() => {
    if (props.value) {
      textChangeHandler(props.value);
    }
  }, [props.value]);

  const lostFocusHandler = () => {
    dispatch({ type: INPUT_BLUR });
  };

  return (
    <View style={styles.formGroup}>
      <TextInput
        {...props}
        mode="outlined"
        style={{ ...styles.formControl, ...props.inputStyle }}
        value={inputState.value}
        onChangeText={textChangeHandler}
        onTouchEnd={lostFocusHandler}
        error={!inputState.isValid}
        // mode="outlined"
      />
      <HelperText type="error" visible={!inputState.isValid}>
        {props.errorText}
      </HelperText>
    </View>
  );
};

const styles = StyleSheet.create({
  formGroup: {
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  formLabel: {
    fontSize: 14,
    textAlignVertical: "center",
    marginVertical: 3,
  },
  formControl: {
    width: "100%",
    fontSize: 18,
    paddingHorizontal: 2,
  },
  required: { color: "red", fontSize: 12 },
});

export default FormInput;
