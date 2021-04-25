import React, { useState, useEffect, useCallback, useReducer } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Alert,
  ScrollView,
  Picker,
  FlatList
} from "react-native";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import { useDispatch, useSelector } from "react-redux";

import { PRIORITY } from "../../../common/constants/Priority";
import HeaderButton from "../../components/UI/HeaderButton";
import Colors from "../../../common/constants/Colors";
import FormInput from "../../components/UI/FormInput";
import LoadingModal from "../../components/modals/LoadingModal";
import * as RequirementsActions from "../../../common/store/actions/requirementsActions";

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

const AddRequirementScreen = props => {
  const PROJECTS = useSelector(state => state.projectsReducer.projects);
  const userCrud = useSelector(state => state.authReducer.user);
  const projectKey = props.navigation.getParam("projectKey");
  const project = projectKey
    ? PROJECTS.filter(proj => proj.id === projectKey)[0]
    : PROJECTS[0];
  const requirementKey = props.navigation.getParam("requirementKey");
  const editedRequirement = props.navigation.getParam("requirement");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const dispatch = useDispatch();

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
        ? PROJECTS.filter(proj => proj.id === editedRequirement.projectKey)[0]
        : project
    },
    inputValidities: {
      requirementTitle: editedRequirement ? true : false,
      requirementDescription: editedRequirement ? true : true,
      requirementPriority: editedRequirement ? true : true,
      selectedProject: editedRequirement ? true : true
    },
    formIsValid: editedRequirement ? true : false
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

  const submitHandler = useCallback(async () => {
    setError(null);
    try {
      if (!formState.formIsValid) {
        Alert.alert(
          "Input not valid",
          "Please ensure all * fields are filled and check the error in the form.",
          [{ text: "Okay" }]
        );
      } else if (editedRequirement) {
        setIsLoading(true);
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
        props.navigation.popToTop();
        props.navigation.navigate("Requirement", {
          requirementKey: editedRequirement.key
        });
      } else {
        setIsLoading(true);
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
    <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={80}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={styles.scrollArea}>
          <View style={styles.screen}>
            {isLoading && <LoadingModal />}
            <Text style={styles.title}>REQUIREMENT INFORMATION</Text>
            <FormInput
              id="requirementTitle"
              label="Requirement Title"
              errorText="Please enter a valid title!"
              placeholder="e.g. Insert record"
              autoCapitalize="sentences"
              autoCorrect
              returnKeyType="next"
              onInputChange={inputChangeHandler}
              initialValue={formState.inputValues.requirementTitle}
              initiallyValid={formState.inputValidities.requirementTitle}
              required
            />

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Project<Text style={styles.required}>*</Text>
              </Text>
              <Picker
                mode="dropdown"
                enabled={!editedRequirement}
                selectedValue={formState.inputValues.selectedProject}
                style={styles.formControl}
                onValueChange={(itemValue, itemIndex) => {
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
              <Text style={styles.formLabel}>Priority</Text>
              <Picker
                mode="dropdown"
                selectedValue={formState.inputValues.requirementPriority}
                style={styles.formControl}
                onValueChange={(itemValue, itemIndex) => {
                  inputChangeHandler("requirementPriority", itemValue, true);
                }}
              >
                {PRIORITY.map(item => {
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

            <FormInput
              id="requirementDescription"
              label="Requirement Description"
              inputStyle={styles.textArea}
              autoCapitalize="sentences"
              autoCorrect
              multiline={true}
              numberOfLines={4}
              onInputChange={inputChangeHandler}
              initialValue={formState.inputValues.requirementDescription}
              initiallyValid={formState.inputValidities.requirementDescription}
            />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

AddRequirementScreen.navigationOptions = navData => {
  const submitFN = navData.navigation.getParam("submitFN");
  return {
    headerTitle: navData.navigation.getParam("requirement")
      ? "Update Requirement"
      : "Add Requirement",
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
    padding: 15,
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
  required: { color: "red" }
});

export default AddRequirementScreen;
