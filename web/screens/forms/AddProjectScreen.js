import React, { useState, useEffect, useCallback, useReducer } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { Divider } from "react-native-paper";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { DatePicker } from "antd";
import "antd/dist/antd.css"; // or 'antd/dist/antd.less'
import moment from "moment";

import Colors from "../../../common/constants/Colors";
import * as Util from "../../../common/utils/Util";
import * as ProjectsActions from "../../../common/store/actions/projectsActions";
import * as FeedsActions from "../../../common/store/actions/feedsActions";

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

const AddProjectScreen = (props) => {
  const PROJECT = useSelector((state) => state.projectsReducer.projects);
  const id = props.params.projectId;
  const editedProject = PROJECT.find((project) => project.id === id);
  const [error, setError] = useState();
  const dispatch = useDispatch();
  const history = useHistory();

  const [formState, dispatchFormState] = useReducer(formReducer, {
    inputValues: {
      projectName: editedProject ? editedProject.projectName : "",
      startDate: editedProject ? new Date(editedProject.startDate) : null,
      dueDate: editedProject ? new Date(editedProject.dueDate) : null,
      projectDescription: editedProject ? editedProject.projectDescription : "",
    },
    inputValidities: {
      projectName: editedProject ? true : false,
      startDate: editedProject ? true : true,
      dueDate: editedProject ? true : true,
      projectDescription: editedProject ? true : true,
    },
    formIsValid: editedProject ? true : false,
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
      } else if (editedProject) {
        props.setIsLoading(true);
        await dispatch(
          ProjectsActions.updateProject(
            editedProject.id,
            formState.inputValues.projectName,
            formState.inputValues.startDate
              ? formState.inputValues.startDate.getTime()
              : "",
            formState.inputValues.dueDate
              ? formState.inputValues.dueDate.getTime()
              : "",
            formState.inputValues.projectDescription
          )
        );
        props.loadFeeds();
        props.setParams({ projectId: editedProject.id });
        history.push("/Home/Project");
      } else {
        props.setIsLoading(true);
        await dispatch(
          ProjectsActions.createProject(
            formState.inputValues.projectName,
            formState.inputValues.startDate
              ? formState.inputValues.startDate.getTime()
              : "",
            formState.inputValues.dueDate
              ? formState.inputValues.dueDate.getTime()
              : "",
            formState.inputValues.projectDescription
          )
        );
        props.loadFeeds();
        history.push("/Home/Project");
      }
    } catch (err) {
      setError(err.message);
    }
    props.setIsLoading(false);
  }, [dispatch, id, formState]);

  const toMoment = (date) => {
    if (date === "" || date === null || !date.getTime()) {
      return null;
    }
    return moment(Util.formatDate(date), "YYYY/MM/DD");
  };

  useEffect(() => {
    if (error) {
      props.alert("An error occured", error, [{ text: "Okay" }]);
    }
  }, [error]);

  return (
    <View style={styles.screen}>
      <Card style={styles.form}>
        <Text style={styles.title}>PROJECT INFORMATION</Text>
        <Divider />
        <View style={styles.formgroup}>
          <FormInput
            id="projectName"
            label="Project Title"
            errorText="* Please enter a valid title!"
            autoCapitalize="sentences"
            autoCorrect
            returnKeyType="next"
            onInputChange={inputChangeHandler}
            initialValue={formState.inputValues.projectName}
            initiallyValid={!!editedProject}
            required
          />
        </View>

        <View style={styles.formgroup}>
          <View style={styles.dateContainer}>
            <Text style={styles.formLabel}>Start Date:</Text>
            <DatePicker
              defaultValue={toMoment(formState.inputValues.startDate)}
              onChange={(momentDate, dateString) => {
                if (momentDate) {
                  inputChangeHandler("startDate", new Date(dateString), true);
                } else {
                  inputChangeHandler("startDate", null, true);
                }
              }}
            />
          </View>

          <View style={styles.dateContainer}>
            <Text style={styles.formLabel}>Due Date:</Text>
            <DatePicker
              defaultValue={toMoment(formState.inputValues.dueDate)}
              disabledDate={(value) => {
                return value.isBefore(
                  Util.formatDate(formState.inputValues.startDate)
                );
              }}
              onChange={(momentDate, dateString) => {
                if (momentDate) {
                  inputChangeHandler("dueDate", new Date(dateString), true);
                } else {
                  inputChangeHandler("dueDate", null, true);
                }
              }}
            />
          </View>
        </View>

        <View style={styles.formgroup}>
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
            initialValue={formState.inputValues.projectDescription}
            initiallyValid={true}
          />
        </View>

        <View style={styles.formgroup}>
          <View style={styles.btn}>
            <Button
              title="cancel"
              color={Colors.criticalDark}
              onPress={() => {
                inputChangeHandler("projectName", "", false);
                inputChangeHandler("startDate", "", true);
                inputChangeHandler("dueDate", "", true);
                inputChangeHandler("projectDescription", "", true);
                props.setParams({});
                history.push("/Home/Project");
              }}
            />
          </View>
          <View style={styles.btn}>
            <Button
              title={editedProject ? "save" : "add"}
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
});

export default AddProjectScreen;
