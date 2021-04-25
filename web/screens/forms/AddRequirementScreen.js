import React, { useState, useEffect, useCallback, useReducer } from "react";
import { View, Text, StyleSheet, Button, Picker } from "react-native";
import { Divider } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import { PRIORITY } from "../../../common/constants/Priority";
import Colors from "../../../common/constants/Colors";
import * as RequirementsActions from "../../../common/store/actions/requirementsActions";

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

const AddRequirementScreen = (props) => {
  const requirementKey = props.params.requirementKey;
  const projectKey = props.params.projectKey;
  const PROJECTS = useSelector((state) => state.projectsReducer.projects);
  const REQUIREMENT = useSelector(
    (state) => state.requirementsReducer.requirements
  );
  const project = projectKey
    ? PROJECTS.find((proj) => proj.id === projectKey)
    : PROJECTS[0];
  const editedRequirement = REQUIREMENT.find(
    (item) => item.key === requirementKey
  );

  const [error, setError] = useState();
  const dispatch = useDispatch();
  const history = useHistory();

  const [formState, dispatchFormState] = useReducer(formReducer, {
    inputValues: {
      requirementTitle: editedRequirement
        ? editedRequirement.requirementTitle
        : "",
      requirementDescription: editedRequirement
        ? editedRequirement.requirementDescription
        : "",
      requirementPriority: editedRequirement
        ? editedRequirement.requirementPriority
        : PRIORITY[0],
      selectedProject: editedRequirement
        ? PROJECTS.find((proj) => proj.id === editedRequirement.projectKey)
        : project,
    },
    inputValidities: {
      requirementTitle: editedRequirement ? true : false,
      requirementDescription: editedRequirement ? true : true,
      requirementPriority: editedRequirement ? true : true,
      selectedProject: editedRequirement ? true : true,
    },
    formIsValid: editedRequirement ? true : false,
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

  const submitHandler = useCallback(async () => {
    setError(null);
    try {
      if (!formState.formIsValid) {
        props.alert(
          "Input not valid",
          "Please ensure all * fields are filled and check the error in the form.",
          [{ text: "Okay" }]
        );
      } else if (editedRequirement) {
        props.setIsLoading(true);
        await dispatch(
          RequirementsActions.updateRequirement(
            editedRequirement.key,
            editedRequirement.requirementId,
            formState.inputValues.requirementTitle,
            formState.inputValues.requirementPriority,
            formState.inputValues.requirementDescription,
            formState.inputValues.selectedProject.id,
            formState.inputValues.selectedProject.projectId,
            formState.inputValues.selectedProject.projectName
          )
        );
        props.loadFeeds();
        props.setParams({ requirementKey: editedRequirement.key });
        history.push("/Home/Requirement");
      } else {
        props.setIsLoading(true);
        await dispatch(
          RequirementsActions.createRequirement(
            formState.inputValues.requirementTitle,
            formState.inputValues.requirementPriority,
            formState.inputValues.requirementDescription,
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
        <Text style={styles.title}>REQUIREMENT INFORMATION</Text>
        <Divider />
        <View style={styles.formgroup}>
          <FormInput
            id="requirementTitle"
            label="Requirement Title"
            errorText="* Please enter a valid title!"
            autoCapitalize="sentences"
            autoCorrect
            returnKeyType="next"
            onInputChange={inputChangeHandler}
            initialValue={formState.inputValues.requirementTitle}
            initiallyValid={!!editedRequirement}
            required
          />
        </View>

        <View style={styles.formgroup}>
          <Text style={styles.formLabel}>
            Project<Text style={styles.required}>*</Text>
          </Text>
          <Picker
            mode="dropdown"
            enabled={!editedRequirement}
            selectedValue={formState.inputValues.selectedProject.id}
            style={styles.formControl}
            onValueChange={(itemValue, itemIndex) => {
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
                  key={item.id}
                  label={item.projectName}
                  value={item.id}
                />
              );
            })}
          </Picker>

          <Text style={styles.formLabel}>
            Priority<Text style={styles.required}>*</Text>
          </Text>
          <Picker
            mode="dropdown"
            selectedValue={formState.inputValues.requirementPriority}
            style={styles.formControl}
            onValueChange={(itemValue, itemIndex) => {
              inputChangeHandler("requirementPriority", itemValue, true);
            }}
          >
            {PRIORITY.map((item) => {
              return <Picker.Item key={item} label={item} value={item} />;
            })}
          </Picker>
        </View>

        <View style={styles.formgroup}>
          <FormInput
            id="requirementDescription"
            inputStyle={styles.textArea}
            label="Requirement Description"
            multiline={true}
            numberOfLines={4}
            autoCapitalize="sentences"
            autoCorrect
            returnKeyType="next"
            onInputChange={inputChangeHandler}
            initialValue={formState.inputValues.requirementDescription}
            initiallyValid={true}
          />
        </View>

        <View style={styles.formgroup}>
          <View style={styles.btn}>
            <Button
              title="cancel"
              color={Colors.criticalDark}
              onPress={() => {
                inputChangeHandler("requirementTitle", "", false);
                inputChangeHandler("requirementDescription", "", true);
                inputChangeHandler("selectedProject", PROJECTS[0], true);
                inputChangeHandler("requirementPriority", PRIORITY[0], true);
                props.setParams({
                  projectId: formState.inputValues.selectedProject.id,
                });
                history.push("/Home/Project");
              }}
            />
          </View>
          <View style={styles.btn}>
            <Button
              title={editedRequirement ? "save" : "add"}
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
    flex: 1,
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
});

export default AddRequirementScreen;
