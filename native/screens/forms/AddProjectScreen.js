import React, { useState, useEffect, useCallback, useReducer } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert
} from "react-native";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import { useSelector, useDispatch } from "react-redux";

import HeaderButton from "../../components/UI/HeaderButton";
import DateInput from "../../components/UI/DateInput";
import FormInput from "../../components/UI/FormInput";
import LoadingModal from "../../components/modals/LoadingModal"
import * as ProjectsActions from "../../../common/store/actions/projectsActions";
import * as FeedsActions from "../../../common/store/actions/feedsActions";
import Colors from "../../../common/constants/Colors";

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

const AddProjectScreen = props => {
  const id = props.navigation.getParam("id");
  const editedProject = useSelector(state =>
    state.projectsReducer.projects.find(
      project => project.id === id
    )
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const dispatch = useDispatch();

  const [formState, dispatchFormState] = useReducer(formReducer, {
    inputValues: {
      projectName: editedProject ? editedProject.projectName : "",
      startDate: editedProject ? new Date(editedProject.startDate) : new Date(),
      dueDate: editedProject ? new Date(editedProject.dueDate) : new Date(),
      projectDescription: editedProject ? editedProject.projectDescription : ""
    },
    inputValidities: {
      projectName: editedProject ? true : false,
      startDate: editedProject ? true : true,
      dueDate: editedProject ? true : true,
      projectDescription: editedProject ? true : true
    },
    formIsValid: editedProject ? true : false
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
        Alert.alert("Input not valid", "Please ensure all * fields are filled and check the error in the form.", [
          { text: "Okay" }
        ]);
      } else if (editedProject) {
        setIsLoading(true);
        await dispatch(
          ProjectsActions.updateProject(
            editedProject.id,
            formState.inputValues.projectName,
            formState.inputValues.startDate.getTime(),
            formState.inputValues.dueDate.getTime(),
            formState.inputValues.projectDescription
          )
        );
        props.navigation.popToTop();
        props.navigation.navigate("ProjectHome", { id: editedProject.id });
      } else {
        setIsLoading(true);
        await dispatch(
          ProjectsActions.createProject(
            formState.inputValues.projectName,
            formState.inputValues.startDate.getTime(),
            formState.inputValues.dueDate.getTime(),
            formState.inputValues.projectDescription
          )
        );
        props.navigation.popToTop();
      }
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
  }, [dispatch, id, formState]);

  useEffect(() => {
    if (error) {
      Alert.alert("An error occured", error, [{ text: "Okay" }]);
    }
  }, [error]);

  useEffect(() => {
    props.navigation.setParams({
      id: id,
      submit: submitHandler
    });
  }, [submitHandler, id]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={10}
    >
    {isLoading && <LoadingModal />}
      <ScrollView style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.screen}>
            <Text style={styles.title}>PROJECT INFORMATION</Text>
            <FormInput
              id="projectName"
              label="Project Title"
              errorText="Please enter a valid title!"
              placeholder="e.g. My Project"
              autoCapitalize="sentences"
              autoCorrect
              returnKeyType="next"
              onInputChange={inputChangeHandler}
              initialValue={editedProject ? editedProject.projectName : ""}
              initiallyValid={!!editedProject}
              required
            />

            <View style={styles.rowContainer}>
              <View style={styles.dateContainer}>
                <Text style={styles.formLabel}>Start Date</Text>
                <DateInput
                  value={formState.inputValues.startDate}
                  onDateChange={value =>
                    inputChangeHandler("startDate", value, true)
                  }
                />
              </View>

              <View style={styles.dateContainer}>
                <Text style={styles.formLabel}>Due Date</Text>
                <DateInput
                  value={formState.inputValues.dueDate}
                  minimumDate={formState.inputValues.startDate}
                  onDateChange={value =>
                    inputChangeHandler("dueDate", value, true)
                  }
                />
              </View>
            </View>

            <FormInput
              id="projectDescription"
              inputStyle={styles.textArea}
              label="Project Description"
              multiline={true}
              numberOfLines={4}
              autoCapitalize="sentences"
              autoCorrect
              returnKeyType="next"
              onInputChange={inputChangeHandler}
              initialValue={
                editedProject ? editedProject.projectDescription : ""
              }
              initiallyValid={true}
            />
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

AddProjectScreen.navigationOptions = navData => {
  const submitFn = navData.navigation.getParam("submit");
  const id = navData.navigation.getParam("id");
  return {
    headerTitle: id ? "Update Project" : "Add Project",
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
        <Item title="Save" iconName="check" onPress={submitFn} />
      </HeaderButtons>
    )
  };
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.bgColor
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.bgColor
  },
  title: {
    width: "100%",
    padding: 10,
    fontFamily: "roboto-regular",
    fontSize: 18
  },
  textArea: {
    width: "100%",
    fontSize: 18,
    textAlignVertical: "top",
    borderColor: "gray",
    borderWidth: 1
  },
  rowContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff"
  },
  formLabel: {
    fontFamily: "roboto-regular",
    fontSize: 14,
    textAlignVertical: "center",
    marginVertical: 3
  },
  dateContainer: {
    flex: 1,
    alignSelf: "stretch",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff"
  }
});

export default AddProjectScreen;
