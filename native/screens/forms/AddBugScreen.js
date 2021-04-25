import React, { useState, useEffect, useCallback, useReducer } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Picker,
  Alert,
  FlatList,
  KeyboardAvoidingView,
} from "react-native";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import { useSelector, useDispatch } from "react-redux";
import * as firebase from "firebase";

import Colors from "../../../common/constants/Colors";
import { SEVERITY } from "../../../common/constants/Severity";
import { PRIORITY } from "../../../common/constants/Priority";
import { STATUS, APPROVE_RESOLVE } from "../../../common/constants/Status";
import * as Util from "../../../common/utils/Util";

import DateInput from "../../components/UI/DateInput";
import HeaderButton from "../../components/UI/HeaderButton";
import AttachmentModal from "../../components/modals/AttachmentModal";
import GalleryBrowser from "../../components/modals/GalleryBrowser";
import LoadingModal from "../../components/modals/LoadingModal";
import AttachmentItem from "../../components/items/AttachmentItem";
import FormInput from "../../components/UI/FormInput";

import Attachment from "../../../common/models/Attachment";
import * as BugsActions from "../../../common/store/actions/bugsActions";

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
  const PROJECTS = useSelector((state) => state.projectsReducer.projects);
  const TESTCASES = useSelector(
    (state) => state.testCasesReducer.projectTestcases
  );
  const TEAM = useSelector((state) => state.teamReducer.teamUser);
  const USER = useSelector((state) => state.authReducer.userList);
  const userRole = useSelector((state) => state.teamReducer.role);
  const [testcaseList, setTestcaseList] = useState([]);
  const [teamUser, setTeamUser] = useState([]);
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const [openImageBrowser, setOpenImageBrowser] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);

  const projectKey = props.navigation.getParam("projectKey");
  const project = projectKey
    ? PROJECTS.filter((project) => project.id === projectKey)[0]
    : PROJECTS[0];
  const selectedTestcase = props.navigation.getParam("testcaseKey")
    ? props.navigation.getParam("testcaseKey")
    : "";
  const editedBug = props.navigation.getParam("bug");

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

  const addAttachment = (newAttachment) => {
    let oldAttachments = [...formState.inputValues.attachments];
    oldAttachments.push(...newAttachment);
    inputChangeHandler("attachments", oldAttachments, true);
  };

  const deleteAttachment = (selectedAttachmentURI) => {
    let oldAttachments = [...formState.inputValues.attachments];
    oldAttachments = oldAttachments.filter(
      (attc) => attc.uri != selectedAttachmentURI
    );
    inputChangeHandler("attachments", oldAttachments, true);
  };

  const renderAttachment = (itemData) => {
    return (
      <AttachmentItem
        item={itemData.item}
        editable
        deleteHandler={deleteAttachment}
      />
    );
  };

  const imageBrowserCallback = (callback) => {
    let photoAttachment = [];
    callback
      .then((photos) => {
        photos.forEach((item, index, array) => {
          photoAttachment.push(
            new Attachment(item.filename, "image", item.uri)
          );
        });
        addAttachment(photoAttachment);
        setOpenImageBrowser(false);
      })
      .catch((e) => setError(e));
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
      } else if (
        userRole !== "admin" &&
        formState.inputValues.status === APPROVE_RESOLVE
      ) {
        Alert.alert(
          "Input not valid",
          "Only admin can approve the bug for resolve",
          [{ text: "Okay" }]
        );
      } else if (editedBug) {
        setIsLoading(true);
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
            formState.inputValues.dueDate,
            formState.inputValues.priority,
            formState.inputValues.assignedTo,
            formState.inputValues.tester,
            formState.inputValues.stepToReproduce,
            formState.inputValues.attemptToRepeat,
            uploadedImages
          )
        );
        props.navigation.popToTop();
        props.navigation.navigate("Bug", { bugKey: editedBug.key });
      } else {
        setIsLoading(true);
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
        setIsLoading(false);
        props.navigation.popToTop();
        props.navigation.navigate("Bug", { bugKey: bugKey });
      }
      props.navigation.navigate("Feed");
    } catch (err) {
      setError(err.message);
    }
  }, [
    dispatch,
    editedBug,
    formState,
    inputChangeHandler,
    setIsLoading,
    setError,
  ]);

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
    props.navigation.setParams({
      setShowAttachmentModal: setShowAttachmentModal,
      submitFN: submitHandler,
    });
  }, [submitHandler, setShowAttachmentModal]);

  useEffect(() => {
    if (error) {
      Alert.alert("An error occured", error, [{ text: "Okay" }]);
    }
  }, [error]);

  return (
    <KeyboardAvoidingView behavior="height" keyboardVerticalOffset={30}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <FlatList
          ListHeaderComponent={
            <ScrollView style={styles.scrollArea}>
              {isLoading && <LoadingModal />}
              <View style={styles.screen}>
                {openImageBrowser ? (
                  <GalleryBrowser imageBrowserCallback={imageBrowserCallback} />
                ) : null}

                <AttachmentModal
                  visible={showAttachmentModal}
                  toggle={setShowAttachmentModal}
                  picturesHandler={setOpenImageBrowser}
                  addAttachment={addAttachment}
                />

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

                <View style={styles.formGroup}>
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
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>
                    Project<Text style={styles.required}>*</Text>
                  </Text>
                  <Picker
                    mode="dropdown"
                    enabled={!editedBug}
                    selectedValue={formState.inputValues.selectedProject}
                    style={styles.formControl}
                    onValueChange={(itemValue, itemIndex) => {
                      inputChangeHandler("selectedProject", itemValue, true);
                      inputChangeHandler("testcaseKey", "", true);
                    }}
                  >
                    {PROJECTS.map((item) => {
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

                <View style={styles.dateContainer}>
                  <Text style={styles.formLabel}>Due Date</Text>
                  <DateInput
                    value={formState.inputValues.dueDate}
                    minimumDate={new Date()}
                    onDateChange={(date) => {
                      inputChangeHandler("dueDate", date, true);
                    }}
                  />
                </View>

                <View style={styles.formGroup}>
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
                </View>

                <View style={styles.formGroup}>
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

                <View style={styles.formGroup}>
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
                          label={
                            item.displayName ? item.displayName : item.email
                          }
                          value={item.userId}
                        />
                      );
                    })}
                  </Picker>
                </View>

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
                    {teamUser.map((item) => {
                      return (
                        <Picker.Item
                          key={item.userId + new Date().getTime()}
                          label={
                            item.displayName ? item.displayName : item.email
                          }
                          value={item.userId}
                        />
                      );
                    })}
                  </Picker>
                </View>

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

                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={styles.title}>Attachments</Text>
                </View>
              </View>
            </ScrollView>
          }
          style={styles.list}
          data={formState.inputValues.attachments}
          keyExtractor={(item, index) => {
            return item.name + index;
          }}
          renderItem={renderAttachment}
        />
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

AddBugScreen.navigationOptions = (navData) => {
  const submitFN = navData.navigation.getParam("submitFN");
  return {
    headerTitle: navData.navigation.getParam("bug")
      ? "Update Bug"
      : "Report Bug",
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
        <Item
          title="Attach Files"
          iconName="paperclip"
          onPress={() => {
            navData.navigation.getParam("setShowAttachmentModal")(true);
          }}
        />
        <Item title="Save" iconName="check" onPress={submitFN} />
      </HeaderButtons>
    ),
  };
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bgColor,
  },
  scrollArea: {
    width: "100%",
    backgroundColor: Colors.bgColor,
  },
  title: {
    width: "100%",
    padding: 10,
    fontFamily: "roboto-regular",
    fontSize: 18,
  },
  formGroup: {
    justifyContent: "center",
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
  },
  formLabel: {
    fontFamily: "roboto-regular",
    fontSize: 14,
    textAlignVertical: "center",
  },
  formControl: {
    width: "100%",
    fontSize: 18,
    borderBottomColor: "gray",
    borderBottomWidth: 1,
  },
  textArea: {
    width: "100%",
    fontFamily: "roboto-regular",
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
  dateContainer: {
    flex: 1,
    alignSelf: "stretch",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
  },
  required: {
    color: "red",
  },
  btnText: {
    width: "100%",
    fontFamily: "roboto-regular",
    fontSize: 18,
    textAlign: "center",
    color: Colors.trivialDark,
  },
  list: {
    width: "100%",
    padding: 5,
    backgroundColor: Colors.bgColor,
  },
});

export default AddBugScreen;
