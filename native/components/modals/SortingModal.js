import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback
} from "react-native";

import Colors from "../../../common/constants/Colors";

const SortingModal = props => {

  return (
    <Modal transparent={true} visible={props.visible} animationType="fade">
      <TouchableWithoutFeedback
        onPress={() => {
          props.toggle(false)
        }}
      >
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Sorting</Text>
              <TouchableWithoutFeedback>
                <View style={styles.option}>
                  <Text style={styles.optionText}>Ascending</Text>
                </View>
              </TouchableWithoutFeedback>

              <TouchableWithoutFeedback>
                <View style={styles.option}>
                  <Text style={styles.optionText}>Descending</Text>
                </View>
              </TouchableWithoutFeedback>
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
    paddingVertical: 50,
    backgroundColor: "rgba(0,0,0,0.3)"
  },
  modalContent: {
    width: "100%",
    backgroundColor: Colors.bgColor,
    paddingVertical: 15
  },
  title: {
    fontFamily: "roboto-regular",
    fontSize: 20,
    width: "100%",
    textAlignVertical: "bottom",
    padding: 10,
  },
  option: {
    justifyContent: "center",
    padding: 10,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    backgroundColor: "#fff"
  },
  optionText: {
    fontSize: 16,
    fontFamily: "roboto-regular",
    textAlignVertical: "center"
  }
});

export default SortingModal;
