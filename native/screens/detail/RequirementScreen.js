import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableWithoutFeedback,
} from "react-native";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import { useSelector } from "react-redux";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";

import HeaderButton from "../../components/UI/HeaderButton";
import LoadingModal from "../../components/modals/LoadingModal";
import Requirement from "../../../common/models/Requirement";

import Colors from "../../../common/constants/Colors";
import * as Util from "../../../common/utils/Util";
import * as RequirementsAction from "../../../common/store/actions/requirementsActions";

const RequirementScreen = (props) => {
  const currUserRole = useSelector((state) => state.teamReducer.role);
  const REQUIREMENTS = useSelector(
    (state) => state.requirementsReducer.requirements
  );
  const TESTCASES = useSelector((state) => state.testCasesReducer.testcases);
  const requirementKey = props.navigation.getParam("requirementKey");
  const [requirement, setRequirement] = useState(new Requirement());
  const [showTestCase, setShowTestCase] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState();
  const dispatch = useDispatch();

  useEffect(() => {
    if (error) {
      Alert.alert("An error occured", error, [{ text: "Okay" }]);
    }
  }, [error]);

  const deleteRequirement = useCallback(() => {
    if (currUserRole.toUpperCase() === "SPECTATOR") {
      Alert.alert(
        "Not enough privilege",
        "Spectators are not allow to perform this action",
        [{ text: "Ok" }]
      );
    } else {
      Alert.alert(
        "Delete Confirmation",
        "Are you sure you want to DELETE this requirement?",
        [
          {
            text: "DELETE",
            onPress: async () => {
              setIsLoading(true);
              setError(null);
              try {
                await dispatch(
                  RequirementsAction.deleteRequirement(requirementKey)
                );
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
  }, [dispatch, requirementKey]);

  useEffect(() => {
    props.navigation.setParams({
      requirement: requirement,
      requirementKey: requirement ? requirement.key : "",
      requirementId: requirement ? requirement.requirementId : "",
      currUserRole: currUserRole,
      deleteRequirement: deleteRequirement,
    });
  }, [requirement, currUserRole]);

  useEffect(() => {
    if (REQUIREMENTS) {
      setIsLoading(true);
      const editedReq = REQUIREMENTS.find((item) => item.key === requirementKey)
        ? REQUIREMENTS.find((item) => item.key === requirementKey)
        : new Requirement();
      setRequirement(editedReq);
    }
    setIsLoading(false);
  }, [REQUIREMENTS, requirementKey]);

  return (
    <View style={styles.screen}>
      {isLoading && <LoadingModal />}
      <ScrollView style={styles.scrollArea}>
        <View>
          <Text style={styles.title}>
            {requirement ? requirement.requirementTitle : ""}
          </Text>
        </View>

        <View style={styles.row}>
          <Text
            style={{
              ...styles.subTitle,
              color: Util.getTxtColor(requirement.requirementPriority),
            }}
          >
            {requirement.requirementPriority.toUpperCase()}
          </Text>
        </View>

        <View style={styles.detailContainer}>
          <View style={{ ...styles.option, ...styles.col, minHeight: 100 }}>
            <Text style={styles.formLabel}>Requirement Description:</Text>
            <View style={styles.row}>
              <Text style={styles.formValue}>
                {requirement.requirementDescription
                  ? requirement.requirementDescription
                  : "none"}
              </Text>
            </View>
          </View>
        </View>

        <TouchableWithoutFeedback
          onPress={() => {
            setShowTestCase((prev) => !prev);
          }}
        >
          <View style={styles.option}>
            <Text style={styles.optionText}>Test Cases</Text>
            <View style={styles.icon}>
              <MaterialCommunityIcons
                name={showTestCase ? "minus" : "plus"}
                size={25}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
        {showTestCase &&
          TESTCASES.map((item, index) => {
            if (item.requirementKey === requirementKey) {
              return (
                <TouchableWithoutFeedback
                  key={item.key + new Date().getTime()}
                  onPress={() => {
                    props.navigation.navigate("TestCase", {
                      testcaseKey: item.key,
                    });
                  }}
                >
                  <View style={styles.testcaseContainer}>
                    <Text style={styles.testcaseId}>{item.testcaseId}</Text>
                    <Text style={styles.testcaseObjective}>
                      {item.objective}
                    </Text>
                  </View>
                </TouchableWithoutFeedback>
              );
            }
          })}
      </ScrollView>
    </View>
  );
};

RequirementScreen.navigationOptions = (navData) => {
  const requirementKey = navData.navigation.getParam("requirementKey");
  const currUserRole = navData.navigation.getParam("currUserRole");
  return {
    headerTitle: navData.navigation.getParam("requirementId"),
    headerRight: (
      <HeaderButtons HeaderButtonComponent={HeaderButton}>
        <Item
          title="Delete"
          iconName="delete-forever"
          onPress={navData.navigation.getParam("deleteRequirement")}
        />
        <Item
          title="Add"
          iconName="plus-circle-outline"
          onPress={() => {
            if (currUserRole.toUpperCase() === "SPECTATOR") {
              Alert.alert(
                "Not enough privilege",
                "Spectators are not allow to perform this action",
                [{ text: "Ok" }]
              );
            } else {
              navData.navigation.navigate("AddTestCase", {
                requirementKey: requirementKey,
              });
            }
          }}
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
              navData.navigation.navigate("AddRequirement", {
                requirement: navData.navigation.getParam("requirement"),
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
    fontSize: 18,
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
    marginVertical: 5,
  },
  testcaseContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    padding: 10,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    backgroundColor: "#fff",
  },
  testcaseId: {
    fontFamily: "roboto-regular",
    fontSize: 18,
    textAlignVertical: "center",
  },
  testcaseObjective: {
    flex: 1,
    flexWrap: "wrap",
    flexShrink: 1,
    fontFamily: "roboto-regular",
    fontSize: 18,
    textAlignVertical: "center",
    paddingHorizontal: 10,
  },
});

export default RequirementScreen;
