import React, { useState, useEffect, useCallback, useReducer } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Picker,
  TouchableWithoutFeedback,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Divider } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import Colors from "../../../common/constants/Colors";
import Testcase from "../../../common/models/Testcase";
import { TEST_STATUS } from "../../../common/constants/TestStatus";
import * as TestCasesActions from "../../../common/store/actions/testCasesActions";

import FormInput from "../../components/UI/FormInput";
import Card from "../../components/UI/Card";

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

const AddTestCaseScreen = (props) => {
  const testcaseKey = props.params.testcaseKey;
  const projectKey = props.params.projectKey;
  const selectedrequirementKey = props.params.requirementKey;
  const PROJECTS = useSelector((state) => state.projectsReducer.projects);
  const REQUIREMENTS = useSelector(
    (state) => state.requirementsReducer.projectRequirements
  );
  const TESTCASES = useSelector((state) => state.testCasesReducer.testcases);
  const TEAM = useSelector((state) => state.teamReducer.teamUser);
  const USER = useSelector((state) => state.authReducer.userList);
  const [teamUser, setTeamUser] = useState([]);
  const userCrud = useSelector((state) => state.authReducer.user);
  const project = projectKey
    ? PROJECTS.find((project) => project.id === projectKey)
    : PROJECTS[0];
  const editedTestCase = TESTCASES.find((item) => item.key === testcaseKey);

  const [selectedTestcase, setSelectedTestcase] = useState("");
  const [filteredTestcase, setFilteredTestcase] = useState([]);
  const [error, setError] = useState();
  const dispatch = useDispatch();
  const history = useHistory();

  const [formState, dispatchFormState] = useReducer(formReducer, {
    inputValues: {
      objective: editedTestCase ? editedTestCase.objective : "",
      requirementKey: editedTestCase
        ? editedTestCase.requirementKey
        : selectedrequirementKey,
      status: editedTestCase ? editedTestCase.status : TEST_STATUS[0],
      tester: editedTestCase ? editedTestCase.tester : "",
      input: editedTestCase ? editedTestCase.input : "",
      expectedResult: editedTestCase ? editedTestCase.expectedResult : "",
      specialProcedure: editedTestCase ? editedTestCase.specialProcedure : "",
      intercaseDependency: editedTestCase
        ? editedTestCase.intercaseDependency
        : [],
      selectedProject: editedTestCase
        ? PROJECTS.find((project) => project.id === editedTestCase.projectKey)
        : project,
    },
    inputValidities: {
      objective: editedTestCase ? true : false,
      selectedProject: editedTestCase ? true : true,
      requirementKey: editedTestCase ? true : true,
      status: editedTestCase ? true : true,
      tester: editedTestCase ? true : true,
      input: editedTestCase ? true : false,
      expectedResult: editedTestCase ? true : false,
      specialProcedure: editedTestCase ? true : true,
      intercaseDependency: editedTestCase ? true : true,
    },
    formIsValid: editedTestCase ? true : false,
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

  useEffect(() => {
    const tempTeam = USER.filter((item) => {
      const userIndex = TEAM.findIndex((user) => user.userId === item.userId);
      return userIndex >= 0;
    });

    if (tempTeam.length > 0) {
      setTeamUser(tempTeam);
    }
  }, [TEAM, USER]);

  useEffect(() => {
    if (TESTCASES) {
      const proKey = formState.inputValues.selectedProject.id;
      let tempList = TESTCASES.filter(
        (item) =>
          !formState.inputValues.intercaseDependency.includes(item.key) &&
          item.key !== testcaseKey &&
          item.projectKey === proKey
      );
      if (editedTestCase) {
        tempList = tempList.filter((item) => item !== editedTestCase);
      }
      setFilteredTestcase(tempList);
    }
  }, [formState, TESTCASES]);

  const addDependency = (newDependency) => {
    if (newDependency !== "") {
      let oldDependency = [...formState.inputValues.intercaseDependency];
      oldDependency.push(newDependency);
      inputChangeHandler("intercaseDependency", oldDependency, true);
      setSelectedTestcase("");
    }
  };

  const deleteDependency = (selectedDependency) => {
    let oldDependency = [...formState.inputValues.intercaseDependency];
    oldDependency = oldDependency.filter((item) => item !== selectedDependency);
    inputChangeHandler("intercaseDependency", oldDependency, true);
  };

  const submitHandler = useCallback(async () => {
    setError(null);
    try {
      if (!formState.formIsValid) {
        props.alert(
          "Input not valid",
          "Please ensure all * fields are filled and check the error in the form.",
          [{ text: "Okay" }]
        );
      } else if (editedTestCase) {
        props.setIsLoading(true);
        await dispatch(
          TestCasesActions.updateTestcase(
            editedTestCase.key,
            editedTestCase.testcaseId,
            formState.inputValues.objective,
            formState.inputValues.status,
            formState.inputValues.requirementKey,
            formState.inputValues.tester,
            formState.inputValues.input,
            formState.inputValues.expectedResult,
            formState.inputValues.specialProcedure,
            formState.inputValues.intercaseDependency,
            formState.inputValues.selectedProject.id,
            formState.inputValues.selectedProject.projectId,
            formState.inputValues.selectedProject.projectName
          )
        );
        props.loadFeeds();
        props.setParams({ testcaseKey: editedTestCase.key });
        history.push("/Home/TestCase");
      } else {
        props.setIsLoading(true);
        await dispatch(
          TestCasesActions.createTestcase(
            formState.inputValues.objective,
            formState.inputValues.requirementKey,
            formState.inputValues.tester,
            formState.inputValues.input,
            formState.inputValues.expectedResult,
            formState.inputValues.specialProcedure,
            formState.inputValues.intercaseDependency,
            formState.inputValues.selectedProject.id,
            formState.inputValues.selectedProject.projectId,
            formState.inputValues.selectedProject.projectName
          )
        );
        props.loadFeeds();
        props.setParams({
          projectId: formState.inputValues.selectedProject.id,
        });
        history.push("/Home/Project");
      }
    } catch (err) {
      setError(err.message);
    }
    props.setIsLoading(false);
  }, [dispatch, projectKey, formState]);

  useEffect(() => {
    if (error) {
      props.alert("An error occured", error, [{ text: "Okay" }]);
    }
  }, [error]);

  return (
    <View style={styles.screen}>
      <Card style={styles.form}>
        <Text style={styles.title}>TEST CASE INFORMATION</Text>
        <Divider />
        <View style={[styles.formgroup, { paddingVertical: 15 }]}>
          <Text style={styles.formLabel}>
            Project<Text style={styles.required}>*</Text>
          </Text>
          <Picker
            mode="dropdown"
            enabled={!editedTestCase}
            selectedValue={formState.inputValues.selectedProject.id}
            style={styles.formControl}
            onValueChange={(itemValue, itemIndex) => {
              setSelectedTestcase("");
              inputChangeHandler("requirementKey", "", true);
              inputChangeHandler("intercaseDependency", [], true);
              inputChangeHandler(
                "selectedProject",
                PROJECTS.find((item) => item.id === itemValue),
                true
              );
            }}
          >
            {PROJECTS.map((item) => {
              return (
                <Picker.Item
                  key={item.id + new Date().getTime()}
                  label={item.projectName}
                  value={item.id}
                />
              );
            })}
          </Picker>
        </View>

        <View style={styles.formgroup}>
          <FormInput
            id="objective"
            label="Objective"
            errorText="Objective cannot be empty!"
            placeholder="e.g. ID Verification"
            autoCapitalize="sentences"
            autoCorrect
            returnKeyType="next"
            onInputChange={inputChangeHandler}
            initialValue={formState.inputValues.objective}
            initiallyValid={formState.inputValidities.objective}
            required
          />
        </View>

        <View style={[styles.formgroup, { paddingVertical: 15 }]}>
          <Text style={styles.formLabel}>Related Requirement</Text>
          <Picker
            mode="dropdown"
            selectedValue={formState.inputValues.requirementKey}
            style={styles.formControl}
            onValueChange={(itemValue, itemIndex) => {
              inputChangeHandler("requirementKey", itemValue, true);
            }}
          >
            <Picker.Item key="none" label="none" value="" />
            {REQUIREMENTS[formState.inputValues.selectedProject.id] &&
              REQUIREMENTS[formState.inputValues.selectedProject.id].map(
                (item) => {
                  return (
                    <Picker.Item
                      key={item.key + new Date().getTime()}
                      label={`${item.requirementId} - ${item.requirementTitle}`}
                      value={item.key}
                    />
                  );
                }
              )}
          </Picker>
        </View>

        <View style={[styles.formgroup, { paddingVertical: 15 }]}>
          <Text style={styles.formLabel}>Status</Text>
          <Picker
            enabled={!!editedTestCase}
            mode="dropdown"
            selectedValue={formState.inputValues.status}
            style={styles.formControl}
            onValueChange={(itemValue, itemIndex) => {
              inputChangeHandler("status", itemValue, true);
            }}
          >
            {TEST_STATUS.map((item) => {
              return <Picker.Item key={item} label={item} value={item} />;
            })}
          </Picker>

          <Text style={styles.formLabel}>Tester</Text>
          <Picker
            mode="dropdown"
            selectedValue={formState.inputValues.tester}
            style={styles.formControl}
            onValueChange={(itemValue, itemIndex) => {
              inputChangeHandler("tester", itemValue, true);
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

        <View style={styles.formgroup}>
          <FormInput
            id="input"
            label="Input"
            errorText="Input cannot be empty!"
            placeholder="e.g. 120123"
            autoCapitalize="none"
            returnKeyType="next"
            onInputChange={inputChangeHandler}
            initialValue={formState.inputValues.input}
            initiallyValid={formState.inputValidities.input}
            required
          />
        </View>

        <View style={styles.formgroup}>
          <FormInput
            id="expectedResult"
            label="Expected Result"
            errorText="Expected Result cannot be empty!"
            placeholder="e.g. System display error message"
            inputStyle={styles.textArea}
            autoCapitalize="none"
            autoCorrect
            multiline={true}
            numberOfLines={4}
            onInputChange={inputChangeHandler}
            initialValue={formState.inputValues.expectedResult}
            initiallyValid={formState.inputValidities.expectedResult}
            required
          />
        </View>

        <View style={styles.formgroup}>
          <FormInput
            id="specialProcedure"
            label="Special Procedure Requirement"
            placeholder="e.g. Import required data"
            inputStyle={styles.textArea}
            autoCapitalize="none"
            autoCorrect
            multiline={true}
            numberOfLines={4}
            onInputChange={inputChangeHandler}
            initialValue={formState.inputValues.specialProcedure}
            initiallyValid={formState.inputValidities.specialProcedure}
          />
        </View>

        <View style={[styles.formgroup, { paddingVertical: 15 }]}>
          <Text style={styles.formLabel}>
            Intercase Dependencies (multiple)
          </Text>
          <Picker
            mode="dropdown"
            selectedValue={selectedTestcase}
            style={[styles.formControl, styles.fullLength]}
            onValueChange={(itemValue, itemIndex) => {
              setSelectedTestcase(itemValue);
            }}
          >
            <Picker.Item key="none" label="none" value="" />
            {filteredTestcase.map((item) => {
              return (
                <Picker.Item
                  key={item.key + new Date().getTime()}
                  label={`${item.testcaseId} - ${item.objective}`}
                  value={item.key}
                />
              );
            })}
          </Picker>
          <TouchableWithoutFeedback
            onPress={() => {
              addDependency(selectedTestcase);
            }}
          >
            <View style={styles.icon}>
              <MaterialCommunityIcons name="plus-circle-outline" size={25} />
            </View>
          </TouchableWithoutFeedback>
        </View>
        {formState.inputValues.intercaseDependency.map((item) => {
          const tc = TESTCASES.find((tc) => tc.key === item)
            ? TESTCASES.find((tc) => tc.key === item)
            : new Testcase();
          return (
            <View
              key={"T" + tc.key + new Date().getTime()}
              style={styles.testcaseContainer}
            >
              <Text style={styles.testcaseId}>{tc.testcaseId}</Text>
              <Text style={styles.testcaseObjective}>{tc.objective}</Text>
              <TouchableWithoutFeedback
                onPress={() => {
                  deleteDependency(tc.key);
                }}
              >
                <View style={styles.icon}>
                  <MaterialCommunityIcons name="delete-forever" size={25} />
                </View>
              </TouchableWithoutFeedback>
            </View>
          );
        })}

        <View style={styles.formgroup}>
          <View style={styles.btn}>
            <Button
              title="cancel"
              color={Colors.criticalDark}
              onPress={() => {
                inputChangeHandler("objective", "", false);
                inputChangeHandler("selectedProject", PROJECTS[0], true);
                inputChangeHandler("requirementKey", "", true);
                inputChangeHandler("tester", "", true);
                inputChangeHandler("input", "", true);
                inputChangeHandler("expectedResult", "", true);
                inputChangeHandler("specialProcedure", "", true);
                inputChangeHandler("intercaseDependency", [], true);
                props.setParams({
                  projectId: formState.inputValues.selectedProject.id,
                });
                history.push("/Home/Project");
              }}
            />
          </View>
          <View style={styles.btn}>
            <Button
              title={editedTestCase ? "save" : "add"}
              color={Colors.primaryColor}
              onPress={submitHandler}
            />
          </View>
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
    // flex: 1,
    width: "80%",
    backgroundColor: "#fff",
    padding: 30,
  },
  formgroup: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 5,
  },
  title: {
    width: "100%",
    padding: 10,
    fontSize: 20,
  },
  textArea: {
    width: "100%",
    fontSize: 18,
    textAlignVertical: "top",
    borderColor: "gray",
    borderWidth: 1,
  },
  rowContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  formLabel: {
    fontSize: 16,
    textAlignVertical: "center",
    marginVertical: 3,
    marginHorizontal: 15,
  },
  formControl: {
    flex: 1,
    marginHorizontal: 15,
    fontSize: 18,
  },
  dateContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 15,
    backgroundColor: "#fff",
  },
  btn: {
    padding: 0,
    marginHorizontal: 15,
  },
  required: {
    color: Colors.danger,
  },
  row: {
    flexDirection: "row",
  },
  fullLength: {
    flex: 1,
  },
  icon: {
    marginHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  testcaseContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 30,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderTopColor: "gray",
    borderTopWidth: 1,
  },
  testcaseId: {
    marginHorizontal: 15,
    fontSize: 18,
    textAlignVertical: "center",
  },
  testcaseObjective: {
    flex: 1,
    fontSize: 18,
  },
});

export default AddTestCaseScreen;
