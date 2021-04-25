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
import * as AuthActions from "../../../common/store/actions/authActions";
import * as TeamActions from "../../../common/store/actions/teamActions";

const EditRoleModal = props => {
  const ROLE = ["Admin", "Developer", "Spectator"];
  const TEAM = useSelector(state => state.teamReducer.teamUser);
  const USER = useSelector(state => state.authReducer.userList);
  const userId = useSelector(state => state.authReducer.user.userId);
  const [teamUser, setTeamUser] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("Developer");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const dispatch = useDispatch();

  useEffect(() => {
    const tempTeam = USER.filter(item => {
      const userIndex = TEAM.findIndex(user => user.userId === item.userId);
      return userIndex >= 0;
    });

    if (tempTeam.length > 0) {
      setTeamUser(tempTeam);
      setSelectedUserId(tempTeam[0].userId);
    }
  }, [TEAM, USER]);

  const submitHandler = useCallback(async () => {
    setError(null);
    try {
      if (
        TEAM.filter(item => item.role.toLowerCase() === "admin").length < 2 &&
        selectedUserId === userId
      ) {
        setError(
          "Invalid action. Please make sure there is at least 1 Admin in the Team."
        );
      } else {
        setIsLoading(true);
        const selectedUser = await dispatch(
          AuthActions.getUserById(selectedUserId)
        );
        Alert.alert(
          "Confirmation",
          `Are you sure you want to change ${selectedUser.displayName}'s role to ${selectedRole}`,
          [
            {
              text: "Confirm",
              onPress: () => {
                dispatch(TeamActions.editRole(selectedUserId, selectedRole));
              }
            },
            {
              text: "Cancel",
              onPress: () => {
                props.toggle(false);
              }
            }
          ]
        );
        props.toggle(false);
      }
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
  }, [dispatch, selectedRole, selectedUserId]);

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
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                User<Text style={styles.required}>*</Text>
              </Text>
              <Picker
                mode="dropdown"
                selectedValue={selectedUserId}
                style={styles.formControl}
                onValueChange={(itemValue, itemIndex) => {
                  setSelectedUserId(itemValue);
                }}
              >
                {teamUser.map(item => {
                  return (
                    <Picker.Item
                      key={item.userId+new Date().getTime()}
                      label={item.displayName}
                      value={item.userId}
                    />
                  );
                })}
              </Picker>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Role<Text style={styles.required}>*</Text>
              </Text>
              <Picker
                mode="dropdown"
                selectedValue={selectedRole}
                style={styles.formControl}
                onValueChange={(itemValue, itemIndex) => {
                  setSelectedRole(itemValue);
                }}
              >
                {ROLE.map(item => {
                  return <Picker.Item key={item+new Date().getTime()} label={item} value={item} />;
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

export default EditRoleModal;
