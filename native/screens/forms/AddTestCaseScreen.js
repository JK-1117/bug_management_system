import React, { useState, useEffect, useCallback, useReducer } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ScrollView,
  Picker,
  FlatList
} from "react-native";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import { useDispatch, useSelector } from "react-redux";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import HeaderButton from "../../components/UI/HeaderButton";
import Colors from "../../../common/constants/Colors";
import FormInput from "../../components/UI/FormInput";
import LoadingModal from "../../components/modals/LoadingModal";
import * as TestCasesActions from "../../../common/store/actions/testCasesActions";

import Testcase from "../../../common/models/Testcase";

const FORM_UPDATE = "FORM_UPDATE";

const formReducer = (state, action) => {
  if (action.type === FORM_UPDATE) {
    const updatedValues = {
      ...state.inputValues,
      [action.inputId]: action.value
    };
    const updatedValidities = {
      ...state.inputValidities,
      [action.inputId]: action.isValid
    };
    let updatedFormIsValid = true;
    for (const key in updatedValidities) {
      updatedFormIsValid = updatedFormIsValid && updatedValidities[key];
    }
    return {
      inputValues: updatedValues,
      inputValidities: updatedValidities,
      formIsValid: updatedFormIsValid
    };
  }
  return state;
};

const AddTestCaseScreen = props => {
  const PROJECTS = useSelector(state => state.projectsReducer.projects);
  const REQUIREMENTS = useSelector(
    state => state.requirementsReducer.projectRequirements
  );
  const TESTCASES = useSelector(
    state => state.testCasesReducer.projectTestcases
  );
  const TEAM = useSelector(state => state.teamReducer.teamUser);
  const USER = useSelector(state => state.authReducer.userList);
  const [teamUser, setTeamUser] = useState([]);
  const userCrud = useSelector(state => state.authReducer.user);
  const projectKey = props.navigation.getParam("projectKey");
  const project = projectKey
    ? PROJECTS.filter(project => project.id === projectKey)[0]
    : PROJECTS[0];
  const selectedrequirementKey = props.navigation.getParam("requirementKey")
    ? props.navigation.getParam("requirementKey")
    : "";
  const testcaseKey = props.navigation.getParam("testcaseKey");
  const editedTestCase = props.navigation.getParam("testcase");

  let scrollView = null;
  const [selectedTestcase, setSelectedTestcase] = useState("");
  const [filteredTestcase, setFilteredTestcase] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const dispatch = useDispatch();

  const [formState, dispatchFormState] = useReducer(formReducer, {
    inputValues: {
      objective: editedTestCase ? editedTestCase.objective : "",
      requirementKey: editedTestCase
        ? editedTestCase.requirementKey
        : selectedrequirementKey,
      tester: editedTestCase ? editedTestCase.tester : "",
      input: editedTestCase ? editedTestCase.input : "",
      expectedResult: editedTestCase ? editedTestCase.expectedResult : "",
      specialProcedure: editedTestCase ? editedTestCase.specialProcedure : "",
      intercaseDependency: editedTestCase
        ? editedTestCase.intercaseDependency
        : [],
      selectedProject: editedTestCase
        ? PROJECTS.filter(
            project => project.id === editedTestCase.projectKey
          )[0]
        : project
    },
    inputValidities: {
      objective: editedTestCase ? true : false,
      projectKey: editedTestCase ? true : true,
      requirementKey: editedTestCase ? true : true,
      tester: editedTestCase ? true : true,
      input: editedTestCase ? true : false,
      expectedResult: editedTestCase ? true : false,
      specialProcedure: editedTestCase ? true : true,
      intercaseDependency: editedTestCase ? true : true
    },
    formIsValid: editedTestCase ? true : false
  });

  const inputChangeHandler = useCallback(
    (inputIdentifier, inputValue, inputValidity) => {
      dispatchFormState({
        type: FORM_UPDATE,
        value: inputValue,
        isValid: inputValidity,
        inputId: inputIdentifier
      });
    },
    [dispatchFormState]
  );

  useEffect(() => {
    const tempTeam = USER.filter(item => {
      const userIndex = TEAM.findIndex(user => user.userId === item.userId);
      return userIndex >= 0;
    });

    if (tempTeam.length > 0) {
      setTeamUser(tempTeam);
    }
  }, [TEAM, USER]);

  useEffect(() => {
    if (TESTCASES) {
      const proKey = formState.inputValues.selectedProject.id;
      if (TESTCASES[proKey]) {
        let tempList = TESTCASES[proKey].filter(
          item =>
            !formState.inputValues.intercaseDependency.includes(item.key) &&
            item.key !== testcaseKey
        );
        if (editedTestCase) {
          tempList = tempList.filter(item => item !== editedTestCase);
        }
        setFilteredTestcase(tempList);
      } else {
        setFilteredTestcase([]);
      }
    }
  }, [formState, TESTCASES]);

  const addDependency = newDependency => {
    if (newDependency !== "") {
      let oldDependency = [...formState.inputValues.intercaseDependency];
      oldDependency.push(newDependency);
      inputChangeHandler("intercaseDependency", oldDependency, true);
      setSelectedTestcase("");
      setTimeout(
        (function(scrollView) {
          return function() {
            scrollView.scrollToEnd({ animated: true });
          };
        })(scrollView),
        100
      );
    }
  };

  const deleteDependency = selectedDependency => {
    let oldDependency = [...formState.inputValues.intercaseDependency];
    oldDependency = oldDependency.filter(item => item !== selectedDependency);
    inputChangeHandler("intercaseDependency", oldDependency, true);
  };

  const submitHandler = useCallback(async () => {
    setError(null);
    try {
      if (!formState.formIsValid) {
        Alert.alert(
          "Input not valid",
          "Please ensure all * fields are filled and check the error in the form.",
          [{ text: "Okay" }]
        );
      } else if (editedTestCase) {
        setIsLoading(true);
        await dispatch(
          TestCasesActions.updateTestcase(
            editedTestCase.key,
            editedTestCase.testcaseId,
            formState.inputValues.objective,
            editedTestCase.status,
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
        props.navigation.popToTop();
        props.navigation.navigate("TestCase", {
          testcaseKey: editedTestCase.key
        });
      } else {
        setIsLoading(true);
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
        props.navigation.popToTop();
      }
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
  }, [dispatch, projectKey, formState]);

  useEffect(() => {
    if (error) {
      Alert.alert("An error occured", error, [{ text: "Okay" }]);
    }
  }, [error]);

  useEffect(() => {
    props.navigation.setParams({
      submitFN: submitHandler
    });
  }, [submitHandler]);

  return (
    <KeyboardAvoidingView behavior="height" keyboardVerticalOffset={100}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          ref={ref => {
            scrollView = ref;
          }}
          style={styles.scrollArea}
        >
          <View style={styles.screen}>
            {isLoading && <LoadingModal />}
            <Text style={styles.title}>TEST CASE INFORMATION</Text>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Project<Text style={styles.required}>*</Text>
              </Text>
              <Picker
                mode="dropdown"
                enabled={!editedTestCase}
                selectedValue={formState.inputValues.selectedProject}
                style={styles.formControl}
                onValueChange={(itemValue, itemIndex) => {
                  setSelectedTestcase("");
                  inputChangeHandler("requirementKey", "", true);
                  inputChangeHandler("intercaseDependency", [], true);
                  inputChangeHandler("selectedProject", itemValue, true);
                }}
              >
                {PROJECTS.map(item => {
                  return (
                    <Picker.Item
                      key={item.id + new Date().getTime()}
                      label={item.projectName}
                      value={item}
                    />
                  );
                })}
              </Picker>
            </View>

            <View style={styles.formGroup}>
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
                    item => {
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

            <View style={styles.formGroup}>
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
                {teamUser.map(item => {
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

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Intercase Dependencies (multiple)
              </Text>
              <View style={styles.row}>
                <Picker
                  mode="dropdown"
                  selectedValue={selectedTestcase}
                  style={[styles.formControl, styles.fullLength]}
                  onValueChange={(itemValue, itemIndex) => {
                    setSelectedTestcase(itemValue);
                  }}
                >
                  <Picker.Item key="none" label="none" value="" />
                  {filteredTestcase.map(item => {
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
                    <MaterialCommunityIcons
                      name="plus-circle-outline"
                      size={25}
                    />
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </View>
            {formState.inputValues.intercaseDependency.map(item => {
              const tc = TESTCASES[formState.inputValues.selectedProject.id]
                ? TESTCASES[formState.inputValues.selectedProject.id].filter(
                    tc => tc.key === item
                  )[0]
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
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

AddTestCaseScreen.navigationOptions = navData => {
  const submitFN = navData.navigation.getParam("submitFN");
  return {
    headerTitle: navData.navigation.getParam("testcase")
      ? "Update Test Case"
      : "Add Test Case",
    headerLeft: (
      <HeaderButtons HeaderButtonComponent={HeaderButton}>
        <Item
          title="Cancel"
          iconName="close"
          onPress={() => {
            navData.navigation.pop();
          }}
        />
      </HeaderButtons>
    ),
    headerRight: (
      <HeaderButtons HeaderButtonComponent={HeaderButton}>
        <Item title="Save" iconName="check" onPress={submitFN} />
      </HeaderButtons>
    )
  };
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bgColor
  },
  scrollArea: {
    width: "100%",
    backgroundColor: Colors.bgColor
  },
  list: {
    flex: 1,
    width: "100%",
    padding: 5,
    backgroundColor: Colors.bgColor
  },
  title: {
    width: "100%",
    padding: 10,
    fontFamily: "roboto-regular",
    fontSize: 18
  },
  formGroup: {
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 15,
    paddingVertical: 10,
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
  textArea: {
    width: "100%",
    fontFamily: "roboto-regular",
    fontSize: 18,
    textAlignVertical: "top",
    borderColor: "gray",
    borderWidth: 1
  },
  required: { color: "red" },
  row: {
    flexDirection: "row"
  },
  fullLength: {
    flex: 1
  },
  icon: {
    marginHorizontal: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  testcaseContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderTopColor: "gray",
    borderTopWidth: 1
  },
  testcaseId: {
    marginRight: 15,
    fontFamily: "roboto-regular",
    fontSize: 18,
    textAlignVertical: "center"
  },
  testcaseObjective: {
    flex: 1,
    fontFamily: "roboto-regular",
    fontSize: 18
  }
});

export default AddTestCaseScreen;
