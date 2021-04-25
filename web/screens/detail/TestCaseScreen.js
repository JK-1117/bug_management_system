import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { useSelector } from "react-redux";
import { Divider, DataTable } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";

import Colors from "../../../common/constants/Colors";
import Testcase from "../../../common/models/Testcase";
import Requirement from "../../../common/models/Requirement";
import * as Util from "../../../common/utils/Util";
import * as TestStatus from "../../../common/constants/TestStatus";
import * as TestCasesActions from "../../../common/store/actions/testCasesActions";

import Card from "../../components/UI/Card";

const TestCaseScreen = (props) => {
  const currUserRole = useSelector((state) => state.teamReducer.role);
  const testcaseKey = props.params.testcaseKey;
  const REQUIREMENTS = useSelector(
    (state) => state.requirementsReducer.requirements
  );
  const TESTCASES = useSelector((state) => state.testCasesReducer.testcases);
  const BUGS = useSelector((state) => state.bugsReducer.bugs);
  const USERS = useSelector((state) => state.authReducer.userList);

  const testcase = TESTCASES.find((item) => item.key === testcaseKey)
    ? TESTCASES.find((item) => item.key === testcaseKey)
    : new Testcase();
  const requirement = REQUIREMENTS.find(
    (item) => item.key === testcase.requirementKey
  )
    ? REQUIREMENTS.find((item) => item.key === testcase.requirementKey)
    : new Requirement();
  const [error, setError] = useState();
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    if (testcase.key.length === 0) {
      props.alert(
        "An error occured",
        "There are an error finding the test case. Please back to home screen and try again.",
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
  }, [testcaseKey]);

  const deleteTestcase = useCallback(() => {
    if (currUserRole.toUpperCase() === "SPECTATOR") {
      props.alert(
        "Not enough privilege",
        "Spectators are not allow to perform this action",
        [{ text: "Ok" }]
      );
    } else {
      props.alert(
        "Delete Confirmation",
        "Are you sure you want to DELETE this Test Case?",
        [
          {
            text: "DELETE",
            onPress: async () => {
              props.setIsLoading(true);
              setError(null);
              try {
                await dispatch(TestCasesActions.deleteTestcase(testcaseKey));
              } catch (err) {
                setError(err.message);
              }
              history.push("/Home");
              props.setIsLoading(false);
            },
            style: "destructive",
          },
          { text: "CANCEL", style: "cancel" },
        ]
      );
    }
  }, [dispatch, testcaseKey]);

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
            {testcase.testcaseId} - {testcase.objective}
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
                deleteTestcase();
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
              } else {props.setParams({ testcaseKey: testcaseKey });
              history.push("/Home/AddTestCase");}
            }}
          >
            <MaterialCommunityIcons
              style={styles.icon}
              title="Edit Test Case"
              name="pencil"
              size={25}
              color={Colors.primaryColor}
            />
          </TouchableWithoutFeedback>
        </View>
        <View style={styles.formGroup}>
          <Text
            style={[styles.status, { color: Util.getBgColor(testcase.status) }]}
          >
            {testcase.status.toUpperCase()}
          </Text>
          <Text style={styles.status}>
            {USERS.find((item) => item.userId === testcase.tester)
              ? "By " + USERS.find((item) => item.userId === testcase.tester).displayName
              : ""}
          </Text>
        </View>
        <Divider />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detail</Text>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Related Requirement :</Text>
            <Text style={styles.sectionContent}>
              {requirement.requirementId} - {requirement.requirementTitle}
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Input :</Text>
            <Text style={styles.sectionContent}>{testcase.input}</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Expected Result :</Text>
            <Text style={styles.sectionContent}>{testcase.expectedResult}</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Special Procedure :</Text>
            <Text style={styles.sectionContent}>
              {testcase.specialProcedure}
            </Text>
          </View>
          <Divider />
        </View>

        <View style={[styles.section, { flex: 1 }]}>
          <Text style={styles.sectionTitle}>Intercase Dependency</Text>
          <ScrollView>
            <DataTable style={styles.sectionContent}>
              <DataTable.Header>
                <DataTable.Title>Test Case ID</DataTable.Title>
                <DataTable.Title>Objective</DataTable.Title>
                <DataTable.Title>Status</DataTable.Title>
              </DataTable.Header>
              {testcase.intercaseDependency.length === 0 && (
                <DataTable.Row style={{ alignItems: "center" }}>
                  <DataTable.Cell>No Records...</DataTable.Cell>
                </DataTable.Row>
              )}

              {testcase.intercaseDependency.map((tempKey, index) => {
                const item = TESTCASES.find(
                  (tempItem) => tempItem.key === tempKey
                )
                  ? TESTCASES.find((tempItem) => tempItem.key === tempKey)
                  : new Testcase();
                return (
                  <DataTable.Row
                    key={item.key}
                    style={
                      index % 2 === 0 ? { backgroundColor: "#fcfcfc" } : {}
                    }
                    onPress={() => {
                      props.setParams({
                        testcaseKey: item.key,
                      });
                      history.push("/Home/TestCase");
                    }}
                  >
                    <DataTable.Cell>{item.testcaseId}</DataTable.Cell>
                    <DataTable.Cell>{item.objective}</DataTable.Cell>
                    <DataTable.Cell>
                      <Text
                        style={[
                          styles.status,
                          {
                            color: Util.getBgColor(item.status),
                          },
                        ]}
                      >
                        {item.status}
                      </Text>
                    </DataTable.Cell>
                  </DataTable.Row>
                );
              })}
            </DataTable>
          </ScrollView>
          <Divider />
        </View>

        <View style={[styles.section, { flex: 1 }]}>
          <Text style={styles.sectionTitle}>Bugs</Text>
          <ScrollView>
            <DataTable style={styles.sectionContent}>
              <DataTable.Header>
                <DataTable.Title>Bug ID</DataTable.Title>
                <DataTable.Title style={{ flex: 4 }}>Title</DataTable.Title>
                <DataTable.Title>Status</DataTable.Title>
                <DataTable.Title style={{ flex: 1.5 }}>
                  Severity
                </DataTable.Title>
                <DataTable.Title>Priority</DataTable.Title>
              </DataTable.Header>
              {BUGS.filter((item) => item.testcaseKey === testcaseKey)
                .length === 0 && (
                <DataTable.Row style={{ alignItems: "center" }}>
                  <DataTable.Cell>No Records...</DataTable.Cell>
                </DataTable.Row>
              )}

              {BUGS.map((item, index) => {
                if (item.testcaseKey === testcaseKey) {
                  return (
                    <DataTable.Row
                      key={item.key}
                      style={
                        index % 2 === 0 ? { backgroundColor: "#fcfcfc" } : {}
                      }
                      onPress={() => {
                        props.setParams({
                          bugKey: item.key,
                        });
                        history.push("/Home/Bug");
                      }}
                    >
                      <DataTable.Cell>{item.bugId}</DataTable.Cell>
                      <DataTable.Cell style={{ flex: 4 }}>
                        {item.bugTitle}
                      </DataTable.Cell>
                      <DataTable.Cell>
                        <Text
                          style={[
                            styles.status,
                            {
                              color: Util.getBgColor(item.status),
                            },
                          ]}
                        >
                          {item.status}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell style={{ flex: 1.5 }}>
                        <Text
                          style={[
                            styles.status,
                            {
                              color: Util.getBgColor(item.severity),
                            },
                          ]}
                        >
                          {item.severity}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell>
                        <Text
                          style={[
                            styles.status,
                            {
                              color: Util.getBgColor(item.priority),
                            },
                          ]}
                        >
                          {item.priority}
                        </Text>
                      </DataTable.Cell>
                    </DataTable.Row>
                  );
                }
              })}
            </DataTable>
          </ScrollView>
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
    flex: 1,
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
});

export default TestCaseScreen;
