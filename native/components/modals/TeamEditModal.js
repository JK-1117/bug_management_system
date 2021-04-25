import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Alert,
  TouchableWithoutFeedback
} from "react-native";

import Colors from "../../../common/constants/Colors";

const TeamEditModal = props => {
  const { currRole } = props;

  return (
    <Modal transparent={true} visible={props.visible} animationType="fade">
      <TouchableWithoutFeedback
        onPress={() => {
          props.toggle(false);
        }}
      >
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <TouchableWithoutFeedback
              onPress={() => {
                if (currRole.toLowerCase() === "admin") {
                  props.addUser(true);
                } else {
                  Alert.alert(
                    "Not enough privilege",
                    "Only team admin can perform this action",
                    [{ text: "Okay" }]
                  );
                }
                props.toggle(false);
              }}
            >
              <View style={styles.option}>
                <Text style={styles.optionText}>Invite User</Text>
              </View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback
              onPress={() => {
                if (currRole.toLowerCase() === "admin") {
                  props.removeUser(true);
                } else {
                  Alert.alert(
                    "Not enough privilege",
                    "Only team admin can perform this action",
                    [{ text: "Okay" }]
                  );
                }
                props.toggle(false);
              }}
            >
              <View style={styles.option}>
                <Text style={styles.optionText}>Remove User</Text>
              </View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback
              onPress={() => {
                if (currRole.toLowerCase() === "admin") {
                  props.editRole(true);
                } else {
                  Alert.alert(
                    "Not enough privilege",
                    "Only team admin can perform this action",
                    [{ text: "Okay" }]
                  );
                }
                props.toggle(false);
              }}
            >
              <View style={styles.option}>
                <Text style={styles.optionText}>Edit User Role</Text>
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
    alignItems: "flex-end",
    paddingVertical: 50
    // backgroundColor: "rgba(0,0,0,0.3)"
  },
  modalContent: {
    width: 150,
    backgroundColor: Colors.bgColor,
    right: 5,
    elevation: 8,
    shadowColor: "black",
    shadowOpacity: 0.26,
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 8
  },
  title: {
    fontFamily: "roboto-regular",
    fontSize: 20,
    width: "100%",
    textAlignVertical: "bottom",
    padding: 10
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

export default TeamEditModal;
