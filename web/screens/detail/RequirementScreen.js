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
import Requirement from "../../../common/models/Requirement";
import * as Util from "../../../common/utils/Util";
import * as RequirementsAction from "../../../common/store/actions/requirementsActions";

import Card from "../../components/UI/Card";

const RequirementScreen = (props) => {
  const currUserRole = useSelector((state) => state.teamReducer.role);
  const requirementKey = props.params.requirementKey;
  const REQUIREMENTS = useSelector(
    (state) => state.requirementsReducer.requirements
  );
  const TESTCASES = useSelector((state) => state.testCasesReducer.testcases);
  const requirement = REQUIREMENTS.find((item) => item.key === requirementKey)
    ? REQUIREMENTS.find((item) => item.key === requirementKey)
    : new Requirement();
  const [error, setError] = useState();
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    if (requirement.key.length === 0) {
      props.alert(
        "An error occured",
        "There are an error finding the requirement. Please back to home screen and try again.",
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
  }, [requirementKey]);

  const deleteRequirement = useCallback(() => {
    if (currUserRole.toUpperCase() === "SPECTATOR") {
      props.alert(
        "Not enough privilege",
        "Spectators are not allow to perform this action",
        [{ text: "Ok" }]
      );
    } else {
      props.alert(
        "Delete Confirmation",
        "Are you sure you want to DELETE this requirement?",
        [
          {
            text: "DELETE",
            onPress: async () => {
              props.setIsLoading(true);
              setError(null);
              try {
                await dispatch(
                  RequirementsAction.deleteRequirement(requirementKey)
                );
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
  }, [dispatch, requirementKey]);

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
            {requirement.requirementId} - {requirement.requirementTitle}
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
                deleteRequirement();
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
              } else {props.setParams({ requirementKey: requirementKey });
              history.push("/Home/AddRequirement");}
            }}
          >
            <MaterialCommunityIcons
              style={styles.icon}
              title="Edit Requirement"
              name="pencil"
              size={25}
              color={Colors.primaryColor}
            />
          </TouchableWithoutFeedback>
        </View>
        <Text
          style={[
            styles.status,
            { color: Util.getBgColor(requirement.requirementPriority) },
          ]}
        >
          {requirement.requirementPriority.toUpperCase()}
        </Text>
        <Divider />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.sectionContent}>
            {requirement.requirementDescription}
          </Text>
          <Divider />
        </View>

        <View style={[styles.section, { flex: 1 }]}>
          <Text style={styles.sectionTitle}>Related Test Cases</Text>
          <ScrollView>
            <DataTable style={styles.sectionContent}>
              <DataTable.Header>
                <DataTable.Title>Test Case ID</DataTable.Title>
                <DataTable.Title>Objective</DataTable.Title>
                <DataTable.Title>Status</DataTable.Title>
              </DataTable.Header>
              {TESTCASES.filter(
                (item) => item.requirementKey === requirementKey
              ).length === 0 && (
                <DataTable.Row style={{ alignItems: "center" }}>
                  <DataTable.Cell>No Records...</DataTable.Cell>
                </DataTable.Row>
              )}

              {TESTCASES.map((item, index) => {
                if (item.requirementKey === requirementKey) {
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
  },
});

export default RequirementScreen;
