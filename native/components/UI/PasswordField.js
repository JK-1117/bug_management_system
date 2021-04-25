import React, { useState, useEffect } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Colors from "../../../common/constants/Colors";

const PasswordField = props => {
  const [isHidden, setIsHidden] = useState(true);

  return (
    <View style={styles.inputContainer}>
      <TextInput
        {...props}
        style={styles.textInput}
        placeholder={props.placeholder}
        secureTextEntry={isHidden}
        autoCorrect={false}
      />
      <TouchableOpacity onPress={() => setIsHidden(prevState => !prevState)}>
        <MaterialCommunityIcons
          name={isHidden ? "eye" : "eye-off"}
          color={Colors.light}
          size={30}
          style={styles.inputLabel}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flex: 1,
    flexDirection: "row"
  },
  inputLabel: {
    marginLeft: 10
  },
  textInput: {
    flex: 1,
    fontFamily: "roboto-regular",
    color: Colors.light
  }
});

export default PasswordField;
