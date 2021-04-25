import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  TouchableWithoutFeedback,
} from "react-native";

import Card from "./Card";

import Colors from "../../../common/constants/Colors";

const Alert = (props) => {
  const { buttonArray } = props;

  return (
    <View style={styles.modal}>
      <View style={styles.modalContent}>
        <Text style={styles.title}>{props.title}</Text>
        <Text style={styles.content}>{props.content}</Text>
        <View style={styles.buttonContainer}>
          {buttonArray.map((item, index) => {
            return (
              <View style={styles.btn} key={item.text}>
                <Button
                  title={item.text}
                  color={item.color ? item.color : Colors.primaryColor}
                  onPress={() => {
                    props.show(false);
                    if (item.onPress) {
                      item.onPress();
                    }
                  }}
                />
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modal: {
    position: "absolute",
    zIndex: 100,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    paddingTop: 200,
  },
  modalContent: {
    width: 350,
    minHeight: 150,
    backgroundColor: "#fff",
    padding: 20,
    elevation: 8,
    shadowColor: "black",
    shadowOpacity: 0.26,
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 8,
    zIndex: 101,
  },
  title: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    fontSize: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  btn: {
    marginHorizontal: 5,
  },
});

export default Alert;
