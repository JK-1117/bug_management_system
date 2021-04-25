import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
} from "react-native";
import { Divider } from "react-native-paper";
import { useSelector, useDispatch } from "react-redux";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useHistory } from "react-router-dom";

import Colors from "../../../common/constants/Colors";
import Bug from "../../../common/models/Bug";
import Testcase from "../../../common/models/Testcase";
import User from "../../../common/models/User";
import * as Util from "../../../common/utils/Util";
import * as BugsAction from "../../../common/store/actions/bugsActions";

import Card from "../../components/UI/Card";
import AttachmentItem from "../../components/items/AttachmentItem";

const BugScreen = (props) => {
  const currUserRole = useSelector((state) => state.teamReducer.role);
  const bugKey = props.params.bugKey;
  const PROJECTS = useSelector((state) => state.projectsReducer.projects);
  const TESTCASES = useSelector((state) => state.testCasesReducer.testcases);
  const USERS = useSelector((state) => state.authReducer.userList);
  const BUGS = useSelector((state) => state.bugsReducer.bugs);

  const bug = BUGS.find((item) => item.key === bugKey)
    ? BUGS.find((item) => item.key === bugKey)
    : new Bug();
  const tester = USERS.find((item) => item.userId === bug.tester)
    ? USERS.find((item) => item.userId === bug.tester)
    : new User();
  const assignedTo = USERS.find((item) => item.userId === bug.assignedTo)
    ? USERS.find((item) => item.userId === bug.assignedTo)
    : new User();
  const testcase = TESTCASES.find((item) => item.key === bug.testcaseKey)
    ? TESTCASES.find((item) => item.key === bug.testcaseKey)
    : new Testcase();
  const [error, setError] = useState();
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    if (bug.key.length === 0) {
      props.alert(
        "An error occured",
        "There are an error finding the bug. Please back to home screen and try again.",
        [
          {
            text: "OK",
            onPress: () => {
              history.push("/Home");
            },
          },
        ]
      );
    }
  }, [bugKey]);

  const deleteBug = useCallback(() => {
    if (currUserRole.toUpperCase() === "SPECTATOR") {
      props.alert(
        "Not enough privilege",
        "Spectators are not allow to perform this action",
        [{ text: "Ok" }]
      );
    } else {
      props.alert(
        "Delete Confirmation",
        "Are you sure you want to DELETE this bug?",
        [
          {
            text: "DELETE",
            onPress: async () => {
              props.setIsLoading(true);
              setError(null);
              try {
                await dispatch(BugsAction.deleteBug(bugKey));
              } catch (err) {
                setError(err.message);
              }
              history.push("/Home");
              props.setIsLoading(false);
            },
          },
          { text: "CANCEL", style: "cancel" },
        ]
      );
    }
  }, [dispatch, bugKey]);

  useEffect(() => {
    if (error) {
      props.alert("An error occured", error, [{ text: "Okay" }]);
    }
  }, [error]);

  return (
    <View style={styles.screen}>
      <Card style={styles.form}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {bug.bugId} - {bug.bugTitle}
          </Text>
          <TouchableWithoutFeedback
            onPress={() => {
              if (currUserRole.toUpperCase() === "SPECTATOR") {
                props.alert(
                  "Not enough privilege",
                  "Spectators are not allow to perform this action",
                  [{ text: "Ok" }]
                );
              } else {
                deleteBug();
              }
            }}
          >
            <MaterialCommunityIcons
              title="Delete Project"
              name="delete-forever"
              size={35}
              color={Colors.criticalDark}
            />
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback
            onPress={() => {
              if (currUserRole.toUpperCase() === "SPECTATOR") {
                props.alert(
                  "Not enough privilege",
                  "Spectators are not allow to perform this action",
                  [{ text: "Ok" }]
                );
              } else {
                props.setParams({ bugKey: bugKey });
                history.push("/Home/AddBug");
              }
            }}
          >
            <MaterialCommunityIcons
              style={styles.icon}
              title="Edit Bug"
              name="pencil"
              size={25}
              color={Colors.primaryColor}
            />
          </TouchableWithoutFeedback>
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.status}>
            -{Util.formatDatetime(new Date(bug.reportTime))}
          </Text>
          <Text style={styles.status}>by {bug.reportBy.username}</Text>
        </View>
        <View style={styles.formGroup}>
          <Text style={[styles.status, { color: Util.getBgColor(bug.status) }]}>
            {bug.status.toUpperCase()}
          </Text>
          <Text
            style={[styles.status, { color: Util.getBgColor(bug.severity) }]}
          >
            {bug.severity.toUpperCase()}
          </Text>
          <Text
            style={[styles.status, { color: Util.getBgColor(bug.priority) }]}
          >
            {bug.priority.toUpperCase()}
          </Text>
        </View>
        <Divider />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.sectionContent}>{bug.bugDescription}</Text>
          <Divider />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detail</Text>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Due Date :</Text>
            <Text style={styles.sectionContent}>
              {Util.formatDate(new Date(bug.dueDate))}
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Assigned to :</Text>
            <Text style={styles.sectionContent}>{assignedTo.displayName}</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Tester :</Text>
            <Text style={styles.sectionContent}>{tester.displayName}</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Related Test Case :</Text>
            <Text style={styles.sectionContent}>
              {testcase.testcaseId} - {testcase.objective}
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Build Information :</Text>
            <Text style={styles.sectionContent}>{bug.buildInfo}</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Environment :</Text>
            <Text style={styles.sectionContent}>{bug.environment}</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Step to Reproduce :</Text>
            <Text style={styles.sectionContent}>{bug.stepToReproduce}</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Attempt to Repeat :</Text>
            <Text style={styles.sectionContent}>{bug.attemptToRepeat}</Text>
          </View>
          <Divider />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attachments</Text>
          <View style={styles.attachmentContainer}>
            {bug.attachments.map((item, index) => {
              return (
                <TouchableWithoutFeedback
                  key={item.uri}
                  title={item.name}
                  onPress={() => {
                    window.open(item.uri);
                  }}
                >
                  <View style={{ margin: 20 }}>
                    <Image
                      title={item.name}
                      source={{ uri: item.uri }}
                      style={styles.previewImg}
                    />
                  </View>
                </TouchableWithoutFeedback>
              );
            })}
          </View>
          <Divider />
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
  },
  form: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 30,
  },
  header: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
  },
  title: {
    // flex: 1,
    padding: 10,
    fontSize: 25,
    color: Colors.primaryColorDark,
  },
  icon: {
    marginHorizontal: 20,
  },
  status: {
    fontWeight: "bold",
    marginHorizontal: 10,
  },
  section: {
    padding: 10,
    minHeight: 100,
  },
  sectionTitle: {
    fontSize: 20,
    paddingHorizontal: 10,
  },
  sectionContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 16,
  },
  formGroup: {
    flexDirection: "row",
    paddingHorizontal: 10,
  },
  formLabel: {
    flex: 0.3,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  previewImg: {
    width: 130,
    height: 130,
    backgroundColor: Colors.light,
    resizeMode: "cover",
  },
  attachmentContainer: {
    flexDirection: "row",
    flex: 1,
    paddingHorizontal: 30,
    flexWrap: "wrap",
  },
});

export default BugScreen;
