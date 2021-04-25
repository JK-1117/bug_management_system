import React, { useState, useEffect, useCallback, useReducer } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Picker,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Divider } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { DatePicker } from "antd";
import * as ImagePicker from "expo-image-picker";
import * as firebase from "firebase";
import "antd/dist/antd.css"; // or 'antd/dist/antd.less'
import moment from "moment";

import Colors from "../../../common/constants/Colors";
import * as Util from "../../../common/utils/Util";
import Bug from "../../../common/models/Bug";
import Attachment from "../../../common/models/Attachment";
import { SEVERITY } from "../../../common/constants/Severity";
import { PRIORITY } from "../../../common/constants/Priority";
import { STATUS, APPROVE_RESOLVE } from "../../../common/constants/Status";
import * as BugsActions from "../../../common/store/actions/bugsActions";

import FormInput from "../../components/UI/FormInput";
import Card from "../../components/UI/Card";
import AttachmentItem from "../../components/items/AttachmentItem";

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

const AddBugScreen = (props) => {
  const projectKey = props.params.projectKey;
  const selectedTestcase = props.params.testcaseKey
    ? props.params.testcaseKey
    : "";
  const bugKey = props.params.bugKey;
  const PROJECTS = useSelector((state) => state.projectsReducer.projects);
  const TESTCASES = useSelector(
    (state) => state.testCasesReducer.projectTestcases
  );
  const BUGS = useSelector((state) => state.bugsReducer.bugs);
  const TEAM = useSelector((state) => state.teamReducer.teamUser);
  const USER = useSelector((state) => state.authReducer.userList);
  const userRole = useSelector((state) => state.teamReducer.role);
  const [testcaseList, setTestcaseList] = useState([]);
  const [teamUser, setTeamUser] = useState([]);
  const dispatch = useDispatch();
  const history = useHistory();

  const [error, setError] = useState();
  const [openImageBrowser, setOpenImageBrowser] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);

  const project = projectKey
    ? PROJECTS.find((project) => project.id === projectKey)
    : PROJECTS[0];
  const editedBug = BUGS.find((item) => item.key === bugKey);

  const [formState, dispatchFormState] = useReducer(formReducer, {
    inputValues: {
      bugTitle: editedBug ? editedBug.bugTitle : "",
      selectedProject: editedBug
        ? PROJECTS.filter((project) => project.id === editedBug.projectKey)[0]
        : project,
      testcaseKey: editedBug ? editedBug.testcaseKey : selectedTestcase,
      status: editedBug ? editedBug.status : STATUS[0],
      bugDescription: editedBug ? editedBug.bugDescription : "",
      buildInfo: editedBug ? editedBug.buildInfo : "",
      environment: editedBug ? editedBug.environment : "",
      severity: editedBug ? editedBug.severity : SEVERITY[0],
      dueDate: editedBug ? new Date(editedBug.dueDate) : new Date(),
      priority: editedBug ? editedBug.priority : PRIORITY[0],
      assignedTo: editedBug ? editedBug.assignedTo : "",
      tester: editedBug ? editedBug.tester : "",
      stepToReproduce: editedBug ? editedBug.stepToReproduce : "",
      attemptToRepeat: editedBug ? editedBug.attemptToRepeat : "",
      attachments: editedBug ? editedBug.attachments : [],
    },
    inputValidities: {
      bugTitle: editedBug ? true : false,
      selectedProject: true,
      testcaseKey: true,
      status: true,
      bugDescription: true,
      buildInfo: true,
      environment: true,
      severity: true,
      dueDate: true,
      priority: true,
      assignedTo: true,
      tester: true,
      stepToReproduce: true,
      attemptToRepeat: true,
      attachments: true,
    },
    formIsValid: editedBug ? true : false,
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

  const chooseImageHandler = async () => {
    const image = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 1,
    });
    const response = await fetch(image.uri);
    const blob = await response.blob();
    const ext = "." + blob.type.split("/").pop();
    const timestamp = new Date().getTime();
    addAttachment(new Attachment(timestamp + ext, "image", image.uri));
  };

  const addAttachment = (newAttachment) => {
    let oldAttachments = [...formState.inputValues.attachments];
    oldAttachments.push(newAttachment);
    inputChangeHandler("attachments", oldAttachments, true);
  };

  const deleteAttachment = (selectedAttachmentURI) => {
    let oldAttachments = [...formState.inputValues.attachments];
    oldAttachments = oldAttachments.filter(
      (attc) => attc.uri != selectedAttachmentURI
    );
    inputChangeHandler("attachments", oldAttachments, true);
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
      } else if (
        userRole !== "admin" &&
        formState.inputValues.status === APPROVE_RESOLVE
      ) {
        props.alert(
          "Input not valid",
          "Only admin can approve the bug for resolve",
          [{ text: "Okay" }]
        );
      } else if (editedBug) {
        props.setIsLoading(true);
        const uploadedImages = await Promise.all(
          formState.inputValues.attachments.map(async (att) => {
            if (att.uri.indexOf("dragonfly-bms.appspot.com") < 0) {
              const response = await fetch(att.uri);
              const blob = await response.blob();

              var storageRef = firebase
                .storage()
                .ref()
                .child("attachments/" + att.name);
              const uploadTask = storageRef.put(blob);
              const url = await new Promise((resolve, reject) => {
                uploadTask.on(
                  "state_changed",
                  (snapshot) => {},
                  (error) => reject(error),
                  async () => {
                    const downloadUrl = await uploadTask.snapshot.ref.getDownloadURL();
                    resolve(downloadUrl);
                  }
                );
              });
              return new Attachment(att.name, att.type, url);
            } else {
              return new Attachment(att.name, att.type, att.uri);
            }
          })
        );

        await dispatch(
          BugsActions.updateBug(
            editedBug.key,
            editedBug.bugId,
            formState.inputValues.bugTitle,
            formState.inputValues.selectedProject.id,
            formState.inputValues.selectedProject.projectId,
            formState.inputValues.selectedProject.projectName,
            formState.inputValues.testcaseKey,
            formState.inputValues.status,
            formState.inputValues.bugDescription,
            formState.inputValues.buildInfo,
            formState.inputValues.environment,
            formState.inputValues.severity,
            formState.inputValues.dueDate.getTime(),
            formState.inputValues.priority,
            formState.inputValues.assignedTo,
            formState.inputValues.tester,
            formState.inputValues.stepToReproduce,
            formState.inputValues.attemptToRepeat,
            uploadedImages
          )
        );
        props.loadFeeds();
        props.setIsLoading(false);
        props.setParams({ bugKey: editedBug.key });
        history.push("/Home/Bug");
      } else {
        props.setIsLoading(true);
        const uploadedImages = await Promise.all(
          formState.inputValues.attachments.map(async (att) => {
            if (att.uri.indexOf("dragonfly-bms.appspot.com") < 0) {
              const response = await fetch(att.uri);
              const blob = await response.blob();

              var storageRef = firebase
                .storage()
                .ref()
                .child("attachments/" + att.name);
              const uploadTask = storageRef.put(blob);
              const url = await new Promise((resolve, reject) => {
                uploadTask.on(
                  "state_changed",
                  (snapshot) => {},
                  (error) => reject(error),
                  async () => {
                    const downloadUrl = await uploadTask.snapshot.ref.getDownloadURL();
                    resolve(downloadUrl);
                  }
                );
              });
              return new Attachment(att.name, att.type, url);
            } else {
              return new Attachment(att.name, att.type, att.uri);
            }
          })
        );

        const bugKey = await dispatch(
          BugsActions.createBug(
            formState.inputValues.bugTitle,
            formState.inputValues.selectedProject.id,
            formState.inputValues.selectedProject.projectId,
            formState.inputValues.selectedProject.projectName,
            formState.inputValues.testcaseKey,
            new Date().getTime(),
            formState.inputValues.status,
            formState.inputValues.bugDescription,
            formState.inputValues.buildInfo,
            formState.inputValues.environment,
            formState.inputValues.severity,
            formState.inputValues.dueDate.getTime(),
            formState.inputValues.priority,
            formState.inputValues.assignedTo,
            formState.inputValues.tester,
            formState.inputValues.stepToReproduce,
            formState.inputValues.attemptToRepeat,
            uploadedImages
          )
        );
        props.loadFeeds();
        props.setIsLoading(false);
        props.setParams({
          projectId: formState.inputValues.selectedProject.id,
        });
        history.push("/Home/Project");
      }
      props.navigate("/Home");
    } catch (err) {
      setError(err.message);
    }
  }, [dispatch, editedBug, formState, inputChangeHandler, setError]);

  useEffect(() => {
    const tempTeam = USER.filter((item) => {
      const userIndex = TEAM.findIndex((user) => user.userId === item.userId);
      return userIndex >= 0;
    });

    if (tempTeam.length > 0) {
      setTeamUser(tempTeam);
    }
  }, [TEAM, USER]);

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
        <Text style={styles.title}>BUG INFORMATION</Text>
        <Divider />
        <View style={styles.formgroup}>
          <FormInput
            id="bugTitle"
            inputStyle={styles.formControl}
            label="Bug Title"
            errorText="Title cannot be empty!"
            placeholder="e.g. Button Missing"
            autoCapitalize="sentences"
            autoCorrect
            onInputChange={inputChangeHandler}
            initialValue={formState.inputValues.bugTitle}
            initiallyValid={formState.inputValidities.bugTitle}
            required
          />
        </View>

        <View style={[styles.formgroup, { paddingVertical: 15 }]}>
          <Text style={styles.formLabel}>
            Project<Text style={styles.required}>*</Text>
          </Text>
          <Picker
            mode="dropdown"
            enabled={!editedBug}
            selectedValue={formState.inputValues.selectedProject.id}
            style={styles.formControl}
            onValueChange={(itemValue, itemIndex) => {
              inputChangeHandler(
                "selectedProject",
                PROJECTS.find((item) => item.id === itemValue),
                true
              );
              inputChangeHandler("testcaseKey", "", true);
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

        <View style={[styles.formgroup, { paddingVertical: 15 }]}>
          <Text style={styles.formLabel}>Related Test Case</Text>
          <Picker
            mode="dropdown"
            selectedValue={formState.inputValues.testcaseKey}
            style={styles.formControl}
            onValueChange={(itemValue, itemIndex) => {
              inputChangeHandler("testcaseKey", itemValue, true);
            }}
          >
            <Picker.Item key="none" label="none" value="" />
            {TESTCASES[formState.inputValues.selectedProject.id] &&
              TESTCASES[formState.inputValues.selectedProject.id].map(
                (item) => {
                  return (
                    <Picker.Item
                      key={item.key + new Date().getTime()}
                      label={`${item.testcaseId} - ${item.objective}`}
                      value={item.key}
                    />
                  );
                }
              )}
          </Picker>
        </View>

        <View style={styles.formgroup}>
          <FormInput
            id="bugDescription"
            label="Bug Description"
            inputStyle={styles.textArea}
            autoCapitalize="sentences"
            autoCorrect
            multiline={true}
            numberOfLines={4}
            onInputChange={inputChangeHandler}
            initialValue={formState.inputValues.bugDescription}
            initiallyValid={formState.inputValidities.bugDescription}
          />
        </View>

        <View style={[styles.formgroup, { paddingVertical: 15 }]}>
          <Text style={styles.formLabel}>
            Status<Text style={styles.required}>*</Text>
          </Text>
          <Picker
            mode="dropdown"
            enabled={!!editedBug}
            selectedValue={formState.inputValues.status}
            style={styles.formControl}
            onValueChange={(itemValue, itemIndex) => {
              inputChangeHandler("status", itemValue, true);
            }}
          >
            {STATUS.map((item) => {
              return (
                <Picker.Item
                  key={item + new Date().getTime()}
                  label={item}
                  value={item}
                />
              );
            })}
          </Picker>

          <Text style={styles.formLabel}>Due Date:</Text>
          <View style={styles.formControl}>
            <DatePicker
              defaultValue={toMoment(formState.inputValues.dueDate)}
              onChange={(momentDate, dateString) => {
                if (momentDate) {
                  inputChangeHandler("dueDate", new Date(dateString), true);
                } else {
                  inputChangeHandler("dueDate", new Date(), true);
                }
              }}
            />
          </View>
        </View>

        <View style={[styles.formgroup, { paddingVertical: 15 }]}>
          <Text style={styles.formLabel}>Severity</Text>
          <Picker
            mode="dropdown"
            selectedValue={formState.inputValues.severity}
            style={styles.formControl}
            onValueChange={(itemValue, itemIndex) => {
              inputChangeHandler("severity", itemValue, true);
            }}
          >
            {SEVERITY.map((item) => {
              return (
                <Picker.Item
                  key={item + new Date().getTime()}
                  label={item}
                  value={item}
                />
              );
            })}
          </Picker>

          <Text style={styles.formLabel}>Priority</Text>
          <Picker
            mode="dropdown"
            selectedValue={formState.inputValues.priority}
            style={styles.formControl}
            onValueChange={(itemValue, itemIndex) => {
              inputChangeHandler("priority", itemValue, true);
            }}
          >
            {PRIORITY.map((item) => {
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

        <View style={styles.formgroup}>
          <FormInput
            id="buildInfo"
            label="Build Information"
            placeholder="e.g. Release version"
            inputStyle={styles.formControl}
            autoCapitalize="sentences"
            autoCorrect
            onInputChange={inputChangeHandler}
            initialValue={formState.inputValues.buildInfo}
            initiallyValid={formState.inputValidities.buildInfo}
          />
        </View>

        <View style={styles.formgroup}>
          <FormInput
            id="environment"
            label="Environment"
            placeholder="e.g. Platform"
            inputStyle={styles.formControl}
            autoCapitalize="sentences"
            autoCorrect
            onInputChange={inputChangeHandler}
            initialValue={formState.inputValues.environment}
            initiallyValid={formState.inputValidities.environment}
          />
        </View>

        <View style={[styles.formgroup, { paddingVertical: 15 }]}>
          <Text style={styles.formLabel}>Assign to</Text>
          <Picker
            mode="dropdown"
            selectedValue={formState.inputValues.assignedTo}
            style={styles.formControl}
            onValueChange={(itemValue, itemIndex) => {
              inputChangeHandler("assignedTo", itemValue, true);
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
            id="stepToReproduce"
            label="Step to Reproduce"
            inputStyle={styles.textArea}
            autoCapitalize="sentences"
            autoCorrect
            multiline={true}
            numberOfLines={4}
            onInputChange={inputChangeHandler}
            initialValue={formState.inputValues.stepToReproduce}
            initiallyValid={formState.inputValidities.stepToReproduce}
          />
        </View>

        <View style={styles.formgroup}>
          <FormInput
            id="attemptToRepeat"
            label="Attempt to Repeat"
            inputStyle={styles.textArea}
            autoCapitalize="sentences"
            autoCorrect
            multiline={true}
            numberOfLines={4}
            onInputChange={inputChangeHandler}
            initialValue={formState.inputValues.attemptToRepeat}
            initiallyValid={formState.inputValidities.attemptToRepeat}
          />
        </View>

        <TouchableWithoutFeedback onPress={chooseImageHandler}>
          <View style={[styles.formgroup, { paddingVertical: 15 }]}>
            <Text style={styles.formLabel}>Attach images (multiple)</Text>
            <View style={styles.icon}>
              <MaterialCommunityIcons name="paperclip" size={25} />
            </View>
          </View>
        </TouchableWithoutFeedback>
        {formState.inputValues.attachments.map((item, index) => (
          <View style={styles.formgroup} key={item.uri}>
            <AttachmentItem
              item={item}
              editable
              deleteHandler={deleteAttachment}
            />
          </View>
        ))}

        <View style={styles.formgroup}>
          <View style={styles.btn}>
            <Button
              title="cancel"
              color={Colors.criticalDark}
              onPress={() => {
                // inputChangeHandler("projectName", "", false);
                // inputChangeHandler("startDate", "", true);
                // inputChangeHandler("dueDate", "", true);
                // inputChangeHandler("projectDescription", "", true);
                props.setParams({});
                history.push("/Home/Project");
              }}
            />
          </View>
          <View style={styles.btn}>
            <Button
              title={editedBug ? "save" : "add"}
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
    paddingVertical: 10,
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

export default AddBugScreen;
