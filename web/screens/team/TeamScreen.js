import React, { useState, useEffect, useCallback, useReducer } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
  Picker,
  Button,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Colors from "../../../common/constants/Colors";
import * as TeamActions from "../../../common/store/actions/teamActions";
import * as AuthActions from "../../../common/store/actions/authActions";

import Card from "../../components/UI/Card";
import TeamItem from "../../components/items/TeamItem";
import FormInput from "../../components/UI/FormInput";
import * as Util from "../../../common/utils/Util";

const FORM_UPDATE = "FORM_UPDATE";

const formReducer = (state, action) => {
  if (action.type === FORM_UPDATE) {
    const updatedValues = {
      ...state.inputValues,
      [action.inputId]: action.value,
    };
    const updatedValidities = {
      ...state.inputValidities,
      [action.inputId]: action.isValid,
    };
    let updatedFormIsValid = true;
    for (const key in updatedValidities) {
      updatedFormIsValid = updatedFormIsValid && updatedValidities[key];
    }
    return {
      inputValues: updatedValues,
      inputValidities: updatedValidities,
      formIsValid: updatedFormIsValid,
    };
  }
  return state;
};

const TeamScreen = (props) => {
  const currUserRole = useSelector((state) => state.teamReducer.role);
  const currUserEmail = useSelector((state) => state.authReducer.user).email;
  const TEAMUSER = useSelector((state) => state.teamReducer.teamUser);
  const USER = useSelector((state) => state.authReducer.userList);
  const ROLE = ["Admin", "Developer", "Spectator"];

  const { setIsLoading } = props;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState();
  const [selectedUser, setSelectedUser] = useState(false);
  const [selectedRole, setSelectedRole] = useState("Developer");
  const [ADMIN, setAdmin] = useState([]);
  const [DEVELOPER, setDeveloper] = useState([]);
  const [SPECTATOR, setSpector] = useState([]);
  const dispatch = useDispatch();

  const [formState, dispatchFormState] = useReducer(formReducer, {
    inputValues: {
      email: "",
      username: "",
      role: "Developer",
    },
    inputValidities: {
      email: false,
      username: true,
      role: true,
    },
    formIsValid: false,
  });

  const inputChangeHandler = useCallback(
    (inputIdentifier, inputValue, inputValidity) => {
      dispatchFormState({
        type: FORM_UPDATE,
        value: inputValue,
        isValid: inputValidity,
        inputId: inputIdentifier,
      });
    },
    [dispatchFormState]
  );

  const fetchTeam = useCallback(async () => {
    setError(null);
    setIsRefreshing(true);
    try {
      await dispatch(TeamActions.fetchTeam());
    } catch (err) {
      setError(err.message);
    }
    setIsRefreshing(false);
  }, [dispatch, setError, setIsRefreshing]);

  useEffect(() => {
    setIsLoading(true);
    fetchTeam().then(async () => {
      await dispatch(AuthActions.fetchUserList());
      setIsLoading(false);
    });
  }, [fetchTeam]);

  useEffect(() => {
    const { query } = props;

    const tempTeam = TEAMUSER.filter((item) => {
      return USER.findIndex((user) => {
        if (query) {
          return (
            (user.displayName.toUpperCase().indexOf(query.toUpperCase()) >= 0 ||
              user.email.toUpperCase().indexOf(query.toUpperCase()) >= 0) &&
            user.userId === item.userId
          );
        }
        return user.userId === item.userId;
      }) >= 0;
    });

    setAdmin(tempTeam.filter((item) => item.role.toLowerCase() === "admin"));
    setDeveloper(
      tempTeam.filter((item) => item.role.toLowerCase() === "developer")
    );
    setSpector(
      tempTeam.filter((item) => item.role.toLowerCase() === "spectator")
    );
  }, [TEAMUSER, USER, props.query]);

  const editRole = useCallback(async () => {
    if (ADMIN.length < 2 && formState.inputValues.email === currUserEmail) {
      setError(
        "Invalid action. Please make sure there is at least 1 Admin in the Team."
      );
    } else {
      props.alert(
        `Confirmation`,
        `Are you sure you want to change ${formState.inputValues.username}'s role to ${formState.inputValues.role}`,
        [
          {
            text: "Confirm",
            onPress: async () => {
              setIsLoading(true);
              const selectedUserId = await dispatch(
                AuthActions.getUserByEmail(formState.inputValues.email)
              );
              dispatch(
                TeamActions.editRole(selectedUserId, formState.inputValues.role)
              );
              props.loadFeeds();
              setIsLoading(false);
            },
          },
          {
            text: "Cancel",
            color: Colors.criticalDark,
          },
        ]
      );
    }
  }, [ADMIN, formState, dispatch, setError]);

  const addUser = useCallback(async () => {
    const selectedUserId = await dispatch(
      AuthActions.getUserByEmail(formState.inputValues.email)
    );
    if (!selectedUserId) {
      setError("User not found, please ensure the email entered is correct.");
    } else if (
      TEAMUSER.filter((item) => item.userId === selectedUserId).length > 0
    ) {
      setError("User is already in the team");
    } else {
      await dispatch(
        TeamActions.createInvitation(selectedUserId, formState.inputValues.role)
      );
      props.alert(
        "Invitation sent",
        "Please ask the user to confirm the invitation.",
        [{ text: "Ok" }]
      );
    }
  }, [formState, dispatch, setError]);

  const removeUser = useCallback(
    async (selectedEmail, selectedUsername, selectedRole) => {
      const selectedUserId = await dispatch(
        AuthActions.getUserByEmail(selectedEmail)
      );
      const confirmFn = async () => {
        setIsLoading(true);
        const newTeamId = await dispatch(
          TeamActions.removeFromTeam(selectedUserId)
        );
        dispatch(AuthActions.updateTeamId(selectedUserId, newTeamId));
        props.loadFeeds();
        setIsLoading(false);
      };

      if (currUserRole.toLowerCase() !== "admin") {
        props.alert(
          "Not enough privilege",
          "Only team admin can perform this action",
          [{ text: "Ok" }]
        );
      } else if (selectedEmail === currUserEmail) {
        if (ADMIN.length < 2) {
          props.alert(
            "Invalid Actions",
            "Please make sure there is at least 1 Admin in the Team.",
            [{ text: "Ok" }]
          );
        } else {
          props.alert(
            `Confirmation`,
            `Are you sure you want to remove yourself from the team?`,
            [
              {
                text: "Confirm",
                onPress: confirmFn,
              },
              {
                text: "Cancel",
                color: Colors.criticalDark,
              },
            ]
          );
        }
      } else if (selectedRole.toLowerCase() === "admin") {
        props.alert(
          `Confirmation`,
          `Selected user is a Team Admin. Are you sure you want to remove ${selectedUsername} from the team?`,
          [
            {
              text: "Confirm",
              onPress: confirmFn,
            },
            {
              text: "Cancel",
              color: Colors.criticalDark,
            },
          ]
        );
      } else {
        props.alert(
          `Confirmation`,
          `Are you sure you want to remove ${selectedUsername} from the team?`,
          [
            {
              text: "Confirm",
              onPress: confirmFn,
            },
            {
              text: "Cancel",
              color: Colors.criticalDark,
            },
          ]
        );
      }
    },
    [setIsLoading, dispatch]
  );

  const submitHandler = useCallback(async () => {
    setError(null);
    try {
      setIsLoading(true);
      if (currUserRole.toLowerCase() !== "admin") {
        props.alert(
          "Not enough privilege",
          "Only team admin can perform this action",
          [{ text: "Ok" }]
        );
      } else if (!formState.formIsValid) {
        props.alert("Input not valid", "Please check the error in the form.", [
          { text: "Ok" },
        ]);
      } else if (selectedUser) {
        editRole();
        inputChangeHandler("email", "", false);
        inputChangeHandler("username", "", true);
        inputChangeHandler("role", "Developer", true);
        setSelectedUser(false);
      } else if (!selectedUser) {
        addUser();
        inputChangeHandler("email", "", false);
        inputChangeHandler("username", "", true);
        inputChangeHandler("role", "Developer", true);
        setSelectedUser(false);
      }
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
  }, [editRole, addUser, setError, setIsLoading, currUserRole]);

  useEffect(() => {
    if (error) {
      props.alert("An error occured", error, [{ text: "Ok" }]);
    }
  }, [error]);

  const renderTeamItem = (itemData, role) => {
    return (
      <TeamItem
        userId={itemData.item.userId}
        inputChangeHandler={inputChangeHandler}
        role={role}
        setSelectedUser={setSelectedUser}
        removeUser={removeUser}
      />
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Card style={styles.card}>
        <View style={styles.listHeader}>
          <View style={styles.listTitle}>
            <Text style={styles.listTitleText}>
              {selectedUser ? "Edit Role" : "Add User"}
            </Text>
          </View>
        </View>

        <View style={[styles.container, { marginVertical: 5 }]}>
          <FormInput
            id="email"
            label="Email"
            errorText="Please enter a valid email!"
            email
            onInputChange={inputChangeHandler}
            required
            value={formState.inputValues.email}
            initialValue={formState.inputValues.email}
            initiallyValid={formState.inputValidities.email}
            underlineColor={Colors.primaryColorDark}
          />

          <FormInput
            id="username"
            label="Username"
            errorText="Please enter a valid username!"
            onInputChange={inputChangeHandler}
            disabled
            value={formState.inputValues.username}
            initialValue={formState.inputValues.username}
            initiallyValid={formState.inputValidities.username}
            underlineColor={Colors.primaryColorDark}
          />

          <View style={styles.formGroup}>
            {/* <Text style={styles.formLabel}>
              Role<Text style={styles.required}>*</Text>
            </Text> */}
            <Picker
              mode="dropdown"
              selectedValue={formState.inputValues.role}
              style={styles.formControl}
              onValueChange={(itemValue, itemIndex) => {
                inputChangeHandler("role", itemValue, true);
              }}
            >
              {ROLE.map((item) => {
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
        </View>

        <View style={[styles.container, { flex: "none" }]}>
          <View style={{ flex: 1 }}></View>
          <View style={styles.btnContainer}>
            <Button
              title="cancel"
              color={Colors.criticalDark}
              onPress={() => {
                setSelectedUser(false);
                inputChangeHandler("email", new String(), false);
                inputChangeHandler("username", new String(), true);
                inputChangeHandler("role", "Developer", true);
              }}
            />
            <Button
              title={selectedUser ? "save" : "add"}
              color={Colors.primaryColor}
              onPress={submitHandler}
            />
          </View>
        </View>
      </Card>

      <View style={styles.container}>
        <Card style={[styles.card, { flex: 1 }]}>
          <View style={styles.listHeader}>
            <View style={styles.listTitle}>
              <MaterialCommunityIcons
                name="account-key"
                size={30}
                color={Colors.primaryColor}
              />
              <Text style={styles.listTitleText}>ADMIN ({ADMIN.length})</Text>
            </View>
          </View>
          <FlatList
            style={styles.list}
            data={ADMIN}
            keyExtractor={(item, index) => item.userId}
            renderItem={(itemData) => {
              return renderTeamItem(itemData, "Admin");
            }}
          />
        </Card>

        <Card style={[styles.card, { flex: 1 }]}>
          <View style={styles.listHeader}>
            <View style={styles.listTitle}>
              <MaterialCommunityIcons
                name="account-multiple"
                size={30}
                color={Colors.primaryColor}
              />
              <Text style={styles.listTitleText}>
                DEVELOPER ({DEVELOPER.length})
              </Text>
            </View>
          </View>
          <FlatList
            style={styles.list}
            data={DEVELOPER}
            keyExtractor={(item, index) => item.userId}
            renderItem={(itemData) => {
              return renderTeamItem(itemData, "Developer");
            }}
          />
        </Card>

        <Card style={[styles.card, { flex: 1 }]}>
          <View style={styles.listHeader}>
            <View style={styles.listTitle}>
              <MaterialCommunityIcons
                name="face"
                size={30}
                color={Colors.primaryColor}
              />
              <Text style={styles.listTitleText}>
                SPECTATOR ({SPECTATOR.length})
              </Text>
            </View>
          </View>
          <FlatList
            style={styles.list}
            data={SPECTATOR}
            keyExtractor={(item, index) => item.userId}
            renderItem={(itemData) => {
              return renderTeamItem(itemData, "Spectator");
            }}
          />
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flex: 1,
  },
  card: {
    backgroundColor: "#fff",
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  list: {
    width: "100%",
  },
  listHeader: {
    flexDirection: "row",
    padding: 5,
  },
  listTitle: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
  },
  listTitleText: {
    fontSize: 18,
    marginHorizontal: 10,
  },
  formControl: {
    flex: 1,
    fontSize: 18,
    paddingHorizontal: 2,
    marginTop: 1,
    marginBottom: 23,
  },
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
  },
  required: {
    color: "red",
  },
  btnContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 150,
  },
});

export default TeamScreen;
