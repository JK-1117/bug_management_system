import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Button,
} from "react-native";

import Colors from "../../../common/constants/Colors";

const WidthModal = (props) => {
  const [show, setShow] = useState(true);

  if (!show) {
    return null;
  }
  return (
    <View style={styles.modalContent}>
      <Text style={{ flex: 1, fontSize: 16 }}>
        Please download the DragonFly mobile app for better small screen experience
      </Text>
      <View style={styles.buttonContainer}>
        <Button
          color={Colors.primaryColor}
          title="Got it"
          onPress={() => {
            setShow(false);
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    position: "absolute",
    width: 350,
    height: 150,
    backgroundColor: "#fff",
    padding: 20,
    left: 300,
    top: 100,
    elevation: 8,
    shadowColor: "black",
    shadowOpacity: 0.26,
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 8,
    zIndex: 100,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
});

export default WidthModal;
