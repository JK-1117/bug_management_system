import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Picker,
  TouchableWithoutFeedback,
} from "react-native";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import { useSelector } from "react-redux";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";

import HeaderButton from "../../components/UI/HeaderButton";
import LoadingModal from "../../components/modals/LoadingModal";
import Testcase from "../../../common/models/Testcase";
import Requirement from "../../../common/models/Requirement";

import * as TestCasesActions from "../../../common/store/actions/testCasesActions";
import Colors from "../../../common/constants/Colors";
import * as TestStatus from "../../../common/constants/TestStatus";
import * as Util from "../../../common/utils/Util";

const TestCaseScreen = (props) => {
  const currUserRole = useSelector((state) => state.teamReducer.role);
  const PROJECT = useSelector((state) => state.projectsReducer.projects);
  const REQUIREMENTS = useSelector(
    (state) => state.requirementsReducer.requirements
  );
  const TESTCASES = useSelector((state) => state.testCasesReducer.testcases);
  const BUGS = useSelector((state) => state.bugsReducer.bugs);
  const TEAM = useSelector((state) => state.teamReducer.teamUser);
  const USERS = useSelector((state) => state.authReducer.userList);
  const testcaseKey = props.navigation.getParam("testcaseKey");
  const [testcase, setTestcase] = useState(
    TESTCASES
      ? TESTCASES.filter((item) => item.key === testcaseKey)[0]
      : new Testcase()
  );
  const [requirement, setRequirement] = useState(new Requirement());
  const [status, setStatus] = useState(testcase.status);
  const [teamUser, setTeamUser] = useState([]);
  const [tester, setTester] = useState();

  const [showDetail, setShowDetail] = useState(false);
  const [showDependency, setShowDependency] = useState(false);
  const [showBug, setShowBug] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState();
  const dispatch = useDispatch();

  const updateCurrentTestCase = useCallback(
    async (updatedTestCase) => {
      try {
        setError(null);
        setIsLoading(true);
        const project = PROJECT.filter(
          (item) => (item.id = updatedTestCase.projectKey)
        )[0];
        await dispatch(
          TestCasesActions.updateTestcase(
            updatedTestCase.key,
            updatedTestCase.testcaseId,
            updatedTestCase.objective,
            updatedTestCase.status,
            updatedTestCase.requirementKey,
            updatedTestCase.tester,
            updatedTestCase.input,
            updatedTestCase.expectedResult,
            updatedTestCase.specialProcedure,
            updatedTestCase.intercaseDependency,
            project.id,
            project.projectId,
            project.projectName
          )
        );
      } catch (err) {
        console.log(err);
        setError(err);
      }
      setIsLoading(false);
    },
    [dispatch]
  );

  useEffect(() => {
    if (error) {
      Alert.alert("An error occured", error, [{ text: "Okay" }]);
    }
  }, [error]);

  useEffect(() => {
    const tempTeam = USERS.filter((item) => {
      const userIndex = TEAM.findIndex((user) => user.userId === item.userId);
      return userIndex >= 0;
    });

    if (tempTeam.length > 0) {
      setTeamUser(tempTeam);
    }
  }, [TEAM, USERS]);

  const deleteTestcase = useCallback(() => {
    if (currUserRole.toUpperCase() === "SPECTATOR") {
      Alert.alert(
        "Not enough privilege",
        "Spectators are not allow to perform this action",
        [{ text: "Ok" }]
      );
    } else {
      Alert.alert(
        "Delete Confirmation",
        "Are you sure you want to DELETE this Test Case?",
        [
          {
            text: "DELETE",
            onPress: async () => {
              setIsLoading(true);
              setError(null);
              try {
                await dispatch(TestCasesActions.deleteTestcase(testcaseKey));
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
  }, [dispatch, testcaseKey]);

  useEffect(() => {
    props.navigation.setParams({
      testcase: testcase,
      testcaseKey: testcaseKey,
      testcaseId: testcase ? testcase.testcaseId : "",
      currUserRole: currUserRole,
      deleteTestcase: deleteTestcase,
    });
  }, [testcase, currUserRole]);

  useEffect(() => {
    if (REQUIREMENTS && testcase.requirementKey !== "") {
      setRequirement(
        REQUIREMENTS.filter((item) => item.key === testcase.requirementKey)[0]
      );
    }
  }, [testcase, REQUIREMENTS]);

  useEffect(() => {
    if (TESTCASES) {
      setIsLoading(true);
      const editedTestcase = TESTCASES.find((item) => item.key === testcaseKey)
        ? TESTCASES.find((item) => item.key === testcaseKey)
        : new Testcase();
      setTestcase(editedTestcase);
      setStatus(testcase.status);
      setTester(testcase.tester);
    }
    setIsLoading(false);
  }, [TESTCASES, testcaseKey]);

  return (
    <View style={styles.screen}>
      {isLoading && <LoadingModal />}
      <ScrollView style={styles.scrollArea}>
        <View>
          <Text style={styles.title}>{testcase ? testcase.objective : ""}</Text>
        </View>

        <View style={{ ...styles.option, flexDirection: "column" }}>
          <View style={styles.row}>
            <Text style={styles.optionText}>Status: </Text>
            <Picker
              mode="dropdown"
              style={styles.formControl}
              selectedValue={status}
              onValueChange={(itemValue, itemIndex) => {
                setStatus(itemValue);
                testcase.status = itemValue;
                updateCurrentTestCase(testcase);
              }}
            >
              {TestStatus.TEST_STATUS.map((item) => {
                return (
                  <Picker.Item
                    color={Util.getTxtColor(item)}
                    key={item + new Date().getTime()}
                    label={item.toUpperCase()}
                    value={item}
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
                testcase.tester = itemValue;
                updateCurrentTestCase(testcase);
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
            <Text style={styles.optionText}>Detail</Text>
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
              <Text style={styles.formLabel}>Related Requirement:</Text>
              <View style={styles.row}>
                <Text
                  style={{ ...styles.formValue, flex: 0 }}
                >{`${requirement.requirementId} - `}</Text>
                <Text style={{ ...styles.formValue, flex: 1 }}>
                  {requirement.requirementTitle}
                </Text>
              </View>
            </View>

            <View style={[styles.option, styles.col]}>
              <Text style={styles.formLabel}>Input:</Text>
              <View style={styles.row}>
                <Text style={styles.formValue}>{testcase.input}</Text>
              </View>
            </View>

            <View style={[styles.option, styles.col]}>
              <Text style={styles.formLabel}>Expected Result:</Text>
              <View style={styles.row}>
                <Text style={styles.formValue}>{testcase.expectedResult}</Text>
              </View>
            </View>

            <View style={[styles.option, styles.col]}>
              <Text style={styles.formLabel}>Special Procedure:</Text>
              <View style={styles.row}>
                <Text style={styles.formValue}>
                  {testcase.specialProcedure}
                </Text>
              </View>
            </View>
          </View>
        )}

        <TouchableWithoutFeedback
          onPress={() => {
            setShowDependency((prev) => !prev);
          }}
        >
          <View style={styles.option}>
            <Text style={styles.optionText}>Intercase Dependency</Text>
            <View style={styles.icon}>
              <MaterialCommunityIcons
                name={showDependency ? "minus" : "plus"}
                size={25}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
        {showDependency && testcase.intercaseDependency && (
          <View style={styles.detailContainer}>
            {TESTCASES.filter((tempTC) =>
              testcase.intercaseDependency.includes(tempTC.key)
            ).map((item, index) => {
              return (
                <TouchableWithoutFeedback
                  key={item.key + new Date().getTime()}
                  onPress={() => {
                    props.navigation.navigate("TestCase", {
                      testcaseKey: item.key,
                    });
                    setShowDependency(false);
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
            })}
          </View>
        )}

        <TouchableWithoutFeedback
          onPress={() => {
            setShowBug((prev) => !prev);
          }}
        >
          <View style={styles.option}>
            <Text style={styles.optionText}>Bugs</Text>
            <View style={styles.icon}>
              <MaterialCommunityIcons
                name={showBug ? "minus" : "plus"}
                size={25}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
        {showBug && (
          <View style={styles.detailContainer}>
            {BUGS.map((item, index) => {
              if (item.testcaseKey === testcaseKey) {
                return (
                  <TouchableWithoutFeedback
                    key={item.key + new Date().getTime()}
                    onPress={() => {
                      props.navigation.navigate("Bug", {
                        bugKey: item.key,
                      });
                      setShowBug(false);
                    }}
                  >
                    <View style={styles.testcaseContainer} key={item.key}>
                      <Text style={styles.testcaseId}>{item.bugId}</Text>
                      <Text style={styles.testcaseObjective}>
                        {item.bugTitle}
                      </Text>
                    </View>
                  </TouchableWithoutFeedback>
                );
              }
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

TestCaseScreen.navigationOptions = (navData) => {
  const testcaseKey = navData.navigation.getParam("testcaseKey");
  const currUserRole = navData.navigation.getParam("currUserRole");
  return {
    headerTitle: navData.navigation.getParam("testcaseId"),
    headerRight: (
      <HeaderButtons HeaderButtonComponent={HeaderButton}>
        <Item
          title="Delete"
          iconName="delete-forever"
          onPress={navData.navigation.getParam("deleteTestcase")}
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
              navData.navigation.navigate("AddBug", {
                testcaseKey: testcaseKey,
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
              navData.navigation.navigate("AddTestCase", {
                testcase: navData.navigation.getParam("testcase"),
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
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#fff",
  },
  statusPicker: {
    flex: 0.5,
    fontFamily: "roboto-black",
    marginHorizontal: 10,
    height: 35,
  },
});

export default TestCaseScreen;
