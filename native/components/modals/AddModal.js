import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { useSelector } from "react-redux";

import Colors from "../../../common/constants/Colors";

const AddModal = (props) => {
  const currUserRole = useSelector((state) => state.teamReducer.role);
  const PROJECTS = useSelector((state) => state.projectsReducer.projects);
  const noProject = PROJECTS.length <= 0;

  const spectatorAlert = () => {
    Alert.alert(
      "Not enough privilege",
      "Spectators are not allow to perform this action",
      [{ text: "Ok" }]
    );
  };
  const noProjectAlert = () => {
    Alert.alert("No Project", "Please create a project first", [
      { text: "Okay" },
    ]);
  };

  return (
    <Modal transparent={true} visible={props.visible} animationType="fade">
      <TouchableWithoutFeedback
        onPress={() => {
          props.toggle(false);
        }}
      >
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            {props.project && (
              <TouchableWithoutFeedback
                onPress={() => {
                  if (currUserRole.toUpperCase() === "SPECTATOR") {
                    spectatorAlert();
                  } else {
                    props.navigation.navigate("AddProject");
                    props.toggle(false);
                  }
                }}
              >
                <View style={styles.option}>
                  <Text style={styles.optionText}>Project</Text>
                </View>
              </TouchableWithoutFeedback>
            )}

            {props.requirement && (
              <TouchableWithoutFeedback
                onPress={() => {
                  if (currUserRole.toUpperCase() === "SPECTATOR") {
                    spectatorAlert();
                  } else if (noProject) {
                    noProjectAlert();
                  } else {
                    props.navigation.navigate("AddRequirement", {
                      projectKey: props.id,
                    });
                    props.toggle(false);
                  }
                }}
              >
                <View style={styles.option}>
                  <Text style={styles.optionText}>Requirement</Text>
                </View>
              </TouchableWithoutFeedback>
            )}

            {props.testcase && (
              <TouchableWithoutFeedback
                onPress={() => {
                  if (currUserRole.toUpperCase() === "SPECTATOR") {
                    spectatorAlert();
                  } else if (noProject) {
                    noProjectAlert();
                  } else {
                    props.navigation.navigate("AddTestCase", {
                      projectKey: props.id,
                    });
                    props.toggle(false);
                  }
                }}
              >
                <View style={styles.option}>
                  <Text style={styles.optionText}>Test Case</Text>
                </View>
              </TouchableWithoutFeedback>
            )}

            {props.bug && (
              <TouchableWithoutFeedback
                onPress={() => {
                  if (currUserRole.toUpperCase() === "SPECTATOR") {
                    spectatorAlert();
                  } else if (noProject) {
                    noProjectAlert();
                  } else {
                    props.navigation.navigate("AddBug", {
                      projectKey: props.id,
                    });
                    props.toggle(false);
                  }
                }}
              >
                <View style={styles.option}>
                  <Text style={styles.optionText}>Bug</Text>
                </View>
              </TouchableWithoutFeedback>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

AddModal.defaultProps = {
  project: true,
  requirement: true,
  testcase: true,
  bug: true,
};

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    alignItems: "flex-end",
    paddingVertical: 50,
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
    shadowRadius: 8,
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
    backgroundColor: "#fff",
  },
  optionText: {
    fontSize: 16,
    fontFamily: "roboto-regular",
    textAlignVertical: "center",
  },
});

export default AddModal;
