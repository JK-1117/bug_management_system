import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  TouchableWithoutFeedback,
  Picker,
} from "react-native";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import { useSelector } from "react-redux";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";

import HeaderButton from "../../components/UI/HeaderButton";
import Colors from "../../../common/constants/Colors";
import AttachmentItem from "../../components/items/AttachmentItem";
import * as Util from "../../../common/utils/Util";
import * as BugsAction from "../../../common/store/actions/bugsActions";
import Bug from "../../../common/models/Bug";
import Testcase from "../../../common/models/Testcase";
import LoadingModal from "../../components/modals/LoadingModal";

const BugScreen = (props) => {
  const currUserRole = useSelector((state) => state.teamReducer.role);
  const TEAM = useSelector((state) => state.teamReducer.teamUser);
  const USERS = useSelector((state) => state.authReducer.userList);
  const BUGS = useSelector((state) => state.bugsReducer.bugs);
  const PROJECT = useSelector((state) => state.projectsReducer.projects);
  const TESTCASES = useSelector(
    (state) => state.testCasesReducer.projectTestcases
  );
  const bugKey = props.navigation.getParam("bugKey");
  const [teamUser, setTeamUser] = useState([]);
  const [bug, setBug] = useState(new Bug());
  const [testcase, setTestcase] = useState(new Testcase());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState();
  const dispatch = useDispatch();

  const [showAttachment, setShowAttachment] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [assignedTo, setAssignedTo] = useState();
  const [tester, setTester] = useState();

  const updateCurrentBug = useCallback(
    async (updatedBug) => {
      try {
        setError(null);
        setIsLoading(true);
        const project = PROJECT.filter(
          (item) => (item.id = updatedBug.projectKey)
        )[0];
        await dispatch(
          BugsAction.updateBug(
            updatedBug.key,
            updatedBug.bugId,
            updatedBug.bugTitle,
            updatedBug.projectKey,
            project.projectId,
            project.projectName,
            updatedBug.testcaseKey,
            updatedBug.status,
            updatedBug.bugDescription,
            updatedBug.buildInfo,
            updatedBug.environment,
            updatedBug.severity,
            updatedBug.dueDate,
            updatedBug.priority,
            updatedBug.assignedTo,
            updatedBug.tester,
            updatedBug.stepToReproduce,
            updatedBug.attemptToRepeat,
            updatedBug.attachments
          )
        );
      } catch (err) {
        setError(err);
      }
      setIsLoading(false);
    },
    [dispatch]
  );
  
  const deleteBug = useCallback(() => {
    if (currUserRole.toUpperCase() === "SPECTATOR") {
      Alert.alert(
        "Not enough privilege",
        "Spectators are not allow to perform this action",
        [{ text: "Ok" }]
      );
    } else {
      Alert.alert(
        "Delete Confirmation",
        "Are you sure you want to DELETE this bug?",
        [
          {
            text: "DELETE",
            onPress: async () => {
              setIsLoading(true);
              setError(null);
              try {
                await dispatch(BugsAction.deleteBug(bugKey));
                props.navigation.popToTop();
              } catch (err) {
                setError(err.message);
              }
              setIsLoading(false);
            },
            style: "destructive",
          },
          { text: "CANCEL", style: "cancel" },
        ]
      );
    }
  }, [dispatch, bugKey]);

  useEffect(() => {
    const tempTeam = USERS.filter((item) => {
      const userIndex = TEAM.findIndex((user) => user.userId === item.userId);
      return userIndex >= 0;
    });

    if (tempTeam.length > 0) {
      setTeamUser(tempTeam);
    }
  }, [TEAM, USERS]);

  useEffect(() => {
    if (error) {
      Alert.alert("An error occured", error, [{ text: "Okay" }]);
    }
  }, [error]);

  useEffect(() => {
    props.navigation.setParams({
      bug: bug,
      bugId: bug.bugId,
      currUserRole: currUserRole,
      deleteBug: deleteBug,
    });
  }, [bug, currUserRole]);

  useEffect(() => {
    if (TESTCASES[bug.projectKey] && bug.testcaseKey !== "") {
      setTestcase(
        TESTCASES[bug.projectKey].filter(
          (item) => item.key === bug.testcaseKey
        )[0]
      );
    }
  }, [bug, TESTCASES]);

  useEffect(() => {
    if (BUGS) {
      setIsLoading(true);
      const bug = BUGS.find((item) => item.key === bugKey)
        ? BUGS.find((item) => item.key === bugKey)
        : new Bug();
      setBug(bug);
      setAssignedTo(bug.assignedTo);
      setTester(bug.tester);
    }
    setIsLoading(false);
  }, [BUGS]);

  const renderAttachment = (itemData) => {
    return <AttachmentItem item={itemData.item} />;
  };

  return (
    <View style={styles.screen}>
      {isLoading && <LoadingModal />}
      <ScrollView style={styles.scrollArea} nestedScrollEnabled={true}>
        <Text style={styles.title}>{bug ? bug.bugTitle : ""}</Text>

        <View style={styles.row}>
          <Text style={styles.reportBy}>
            By {bug ? bug.reportBy.username : ""}
          </Text>
          <Text style={styles.reportBy}>
            -{Util.formateTimestamp(bug.reportTime)}
          </Text>
        </View>

        <View style={styles.row}>
          <Text
            style={{
              ...styles.subTitle,
              color: Util.getTxtColor(bug.status),
            }}
          >
            {bug.status.toUpperCase()}
          </Text>
          <Text
            style={{
              ...styles.subTitle,
              color: Util.getTxtColor(bug.severity),
            }}
          >
            {bug.severity.toUpperCase()}
          </Text>
          <Text
            style={{
              ...styles.subTitle,
              color: Util.getTxtColor(bug.priority),
            }}
          >
            {bug.priority.toUpperCase()}
          </Text>
        </View>

        <View style={{ ...styles.option, flexDirection: "column" }}>
          <View style={styles.row}>
            <Text style={styles.optionText}>Assigned to: </Text>
            <Picker
              mode="dropdown"
              selectedValue={assignedTo}
              style={styles.formControl}
              onValueChange={(itemValue, itemIndex) => {
                setAssignedTo(itemValue);
                bug.assignedTo = itemValue;
                updateCurrentBug(bug);
              }}
            >
              <Picker.Item key="none" label="none" value="" />
              {teamUser.map((item) => {
                return (
                  <Picker.Item
                    key={item.userId + new Date().getTime()}
                    label={item.displayName ? item.displayName : item.email}
                    value={item.userId}
                  />
                );
              })}
            </Picker>
          </View>
          <View style={styles.row}>
            <Text style={styles.optionText}>Tester: </Text>
            <Picker
              mode="dropdown"
              selectedValue={tester}
              style={styles.formControl}
              onValueChange={(itemValue, itemIndex) => {
                setTester(itemValue);
                bug.tester = itemValue;
                updateCurrentBug(bug);
              }}
            >
              <Picker.Item key="none" label="none" value="" />
              {teamUser.map((item) => {
                return (
                  <Picker.Item
                    key={item.userId + new Date().getTime()}
                    label={item.displayName ? item.displayName : item.email}
                    value={item.userId}
                  />
                );
              })}
            </Picker>
          </View>
        </View>

        <TouchableWithoutFeedback
          onPress={() => {
            setShowDetail((prev) => !prev);
          }}
        >
          <View style={styles.option}>
            <Text style={styles.optionText}>Details</Text>
            <View style={styles.icon}>
              <MaterialCommunityIcons
                name={showDetail ? "minus" : "plus"}
                size={25}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
        {showDetail && (
          <View style={styles.detailContainer}>
            <View style={[styles.option, styles.col]}>
              <Text style={styles.formLabel}>Due Date:</Text>
              <View style={styles.row}>
                <Text style={styles.formValue}>
                  {Util.formatDate(bug.dueDate)}
                </Text>
              </View>
            </View>

            <View style={[styles.option, styles.col]}>
              <Text style={styles.formLabel}>Related Test Case:</Text>
              <View style={styles.row}>
                <Text
                  style={{ ...styles.formValue, flex: 0 }}
                >{`${testcase.testcaseId} - `}</Text>
                <Text style={{ ...styles.formValue, flex: 1 }}>
                  {testcase.objective}
                </Text>
              </View>
            </View>

            <View style={[styles.option, styles.col]}>
              <Text style={styles.formLabel}>Bug Description:</Text>
              <View style={styles.row}>
                <Text style={styles.formValue}>{bug.bugDescription}</Text>
              </View>
            </View>

            <View style={[styles.option, styles.col]}>
              <Text style={styles.formLabel}>Build Information:</Text>
              <View style={styles.row}>
                <Text style={styles.formValue}>{bug.buildInfo}</Text>
              </View>
            </View>

            <View style={[styles.option, styles.col]}>
              <Text style={styles.formLabel}>Environment:</Text>
              <View style={styles.row}>
                <Text style={styles.formValue}>{bug.environment}</Text>
              </View>
            </View>

            <View style={[styles.option, styles.col]}>
              <Text style={styles.formLabel}>Step to Reproduce:</Text>
              <View style={styles.row}>
                <Text style={styles.formValue}>{bug.stepToReproduce}</Text>
              </View>
            </View>

            <View style={[styles.option, styles.col]}>
              <Text style={styles.formLabel}>Attempt to Repeat:</Text>
              <View style={styles.row}>
                <Text style={styles.formValue}>{bug.attemptToRepeat}</Text>
              </View>
            </View>
          </View>
        )}

        <TouchableWithoutFeedback
          onPress={() => {
            setShowAttachment((prev) => !prev);
          }}
        >
          <View style={styles.option}>
            <Text style={styles.optionText}>Attachments</Text>
            <View style={styles.icon}>
              <MaterialCommunityIcons
                name={showAttachment ? "minus" : "plus"}
                size={25}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
        {showAttachment &&
          bug.attachments.map((item, index) => {
            return (
              <AttachmentItem item={item} key={index + new Date().getTime()} />
            );
          })}
      </ScrollView>
    </View>
  );
};

BugScreen.navigationOptions = (navData) => {
  const currUserRole = navData.navigation.getParam("currUserRole");
  return {
    headerTitle: navData.navigation.getParam("bugId"),
    headerRight: (
      <HeaderButtons HeaderButtonComponent={HeaderButton}>
        <Item
          title="Delete"
          iconName="delete-forever"
          onPress={navData.navigation.getParam("deleteBug")}
        />
        <Item
          title="Edit"
          iconName="square-edit-outline"
          onPress={() => {
            if (currUserRole.toUpperCase() === "SPECTATOR") {
              Alert.alert(
                "Not enough privilege",
                "Spectators are not allow to perform this action",
                [{ text: "Ok" }]
              );
            } else {
              navData.navigation.navigate("AddBug", {
                bug: navData.navigation.getParam("bug"),
              });
            }
          }}
        />
      </HeaderButtons>
    ),
  };
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollArea: {
    width: "100%",
    backgroundColor: Colors.bgColor,
  },
  title: {
    width: "100%",
    padding: 10,
    fontFamily: "roboto-regular",
    fontSize: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 2,
    backgroundColor: "#fff",
  },
  reportBy: {
    fontFamily: "roboto-regular",
    fontSize: 12,
    marginHorizontal: 10,
  },
  subTitle: {
    fontFamily: "roboto-black",
    fontSize: 14,
    marginHorizontal: 10,
  },
  strong: {
    fontFamily: "roboto-black",
  },
  formControl: {
    flex: 1,
    fontSize: 16,
  },
  formLabel: {
    fontFamily: "roboto-regular",
    fontSize: 14,
    textAlignVertical: "center",
  },
  list: {
    width: "100%",
    padding: 5,
    backgroundColor: Colors.bgColor,
  },
  option: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    marginVertical: 3,
    padding: 10,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    backgroundColor: "#fff",
  },
  optionText: {
    flex: 1,
    flexShrink: 1,
    fontFamily: "roboto-regular",
    fontSize: 18,
    textAlignVertical: "center",
    padding: 2,
  },
  formValue: {
    flex: 1,
    flexShrink: 1,
    fontFamily: "roboto-regular",
    fontSize: 16,
    textAlignVertical: "center",
    padding: 2,
  },
  col: {
    flexDirection: "column",
    flexWrap: "wrap",
    flexShrink: 1,
    marginVertical: 0,
  },
  row: {
    flexDirection: "row",
  },
  icon: {
    marginHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  detailContainer: {
    marginBottom: 5,
  },
});

export default BugScreen;
