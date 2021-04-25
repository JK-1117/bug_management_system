import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
  ProgressBarAndroid,
  ProgressViewIOS,
  TouchableWithoutFeedback,
} from "react-native";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { ProgressBar } from "rn-multi-progress-bar";

import Colors from "../../../common/constants/Colors";
import * as Util from "../../../common/utils/Util";
import * as Status from "../../../common/constants/Status";
import * as TestStatus from "../../../common/constants/TestStatus";
import * as ProjectsActions from "../../../common/store/actions/projectsActions";

import HeaderButton from "../../components/UI/HeaderButton";
import AddModal from "../../components/modals/AddModal";
import LoadingModal from "../../components/modals/LoadingModal";
import UserAvatar from "../../components/items/UserAvatar";
import Project from "../../../common/models/Project";

const ProjectHomeScreen = (props) => {
  const currUserRole = useSelector((state) => state.teamReducer.role);
  const PROJECTS = useSelector((state) => state.projectsReducer.projects);
  const TESTCASES = useSelector(
    (state) => state.testCasesReducer.projectTestcases
  );
  const BUGS = useSelector((state) => state.bugsReducer.projectBugs);
  const id = props.navigation.getParam("id");
  const project = PROJECTS.find((item) => item.id === id)
    ? PROJECTS.find((item) => item.id === id)
    : new Project();

  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const [projectTestCases, setProjectTestCases] = useState(
    TESTCASES[project.id] ? TESTCASES[project.id] : []
  );
  const [projectBugs, setProjectBugs] = useState(
    BUGS[project.id] ? BUGS[project.id] : []
  );

  const [passTest, setPassTest] = useState(
    projectTestCases.filter((item) => item.status === TestStatus.PASSED).length
  );
  const [failTest, setFailTest] = useState(
    projectTestCases.filter((item) => item.status === TestStatus.FAILED).length
  );
  const [openTest, setOpenTest] = useState(
    projectTestCases.filter((item) => item.status === TestStatus.TO_BE_TESTED)
      .length
  );
  const [openBug, setOpenBug] = useState(
    projectBugs.filter((item) => item.status === Status.OPEN).length
  );
  const [resolveBug, setResolveBug] = useState(
    projectBugs.filter((item) => item.status === Status.APPROVE_RESOLVE).length
  );
  const [otherBug, setOtherBug] = useState(
    projectBugs.length - openBug - resolveBug
  );
  const [progress, setProgress] = useState(
    1 - (openTest + openBug) / (projectTestCases.length + projectBugs.length)
      ? 1 -
          (openTest + openBug) / (projectTestCases.length + projectBugs.length)
      : 0
  );

  useEffect(() => {
    setProjectTestCases(TESTCASES[project.id] ? TESTCASES[project.id] : []);
    setProjectBugs(BUGS[project.id] ? BUGS[project.id] : []);
    setPassTest(
      projectTestCases.filter((item) => item.status === TestStatus.PASSED)
        .length
    );
    setFailTest(
      projectTestCases.filter((item) => item.status === TestStatus.FAILED)
        .length
    );
    setOpenTest(
      projectTestCases.filter((item) => item.status === TestStatus.TO_BE_TESTED)
        .length
    );
    setOpenBug(
      projectBugs.filter((item) => item.status === Status.OPEN).length
    );
    setResolveBug(
      projectBugs.filter((item) => item.status === Status.APPROVE_RESOLVE)
        .length
    );
    setOtherBug(projectBugs.length - openBug - resolveBug);
    setProgress(
      1 - (openTest + openBug) / (projectTestCases.length + projectBugs.length)
    );
  }, [
    TESTCASES,
    BUGS,
    setOpenTest,
    setPassTest,
    setFailTest,
    setOpenBug,
    setResolveBug,
    setOtherBug,
    setProgress,
  ]);

  const dispatch = useDispatch();
  const deleteProject = useCallback(() => {
    if (currUserRole.toUpperCase() !== "ADMIN") {
      Alert.alert(
        "Not enough privilege",
        "Only Admin is allow to perform this action",
        [{ text: "Ok" }]
      );
    } else {
      Alert.alert(
        "Delete Confirmation",
        "Are you sure you want to DELETE this project?",
        [
          {
            text: "DELETE",
            onPress: async () => {
              setIsLoading(true);
              setError(null);
              try {
                await dispatch(ProjectsActions.deleteProject(id));
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
  }, [dispatch, id]);

  const editProjectHandler = useCallback(() => {
    if (currUserRole.toUpperCase() === "SPECTATOR") {
      Alert.alert(
        "Not enough privilege",
        "Spectators are not allow to perform this action",
        [{ text: "Ok" }]
      );
    } else {
      props.navigation.navigate("AddProject", {
        id: id,
      });
    }
  }, [id]);

  useEffect(() => {
    if (error) {
      Alert.alert("An error occured", error, [{ text: "Okay" }]);
    }
  });

  useEffect(() => {
    if (project) {
      props.navigation.setParams({
        projectName: project.projectName,
        addModal: setShowAddModal,
        editProject: editProjectHandler,
        deleteProject: deleteProject,
      });
    }
  }, [editProjectHandler, project, deleteProject, setShowAddModal]);

  if (!project) {
    return (
      <View style={{ ...styles.screen, justifyContent: "center" }}>
        <AddModal
          id={id}
          visible={showAddModal}
          toggle={setShowAddModal}
          navigation={props.navigation}
        />
        <Text>Something went wrong...</Text>
        <Button
          title="Try Again"
          onPress={() => {
            props.navigation.navigate("Project");
          }}
          color={Colors.primaryColor}
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {isLoading && <LoadingModal />}
      <AddModal
        id={id}
        visible={showAddModal}
        toggle={setShowAddModal}
        navigation={props.navigation}
        project={false}
      />

      <View style={styles.section}>
        <View style={{ ...styles.option, borderBottomWidth: 0 }}>
          <Text style={{ ...styles.optionText, flex: 1, marginHorizontal: 10 }}>
            Description:{" "}
            {project.projectDescription.trim().length > 0
              ? project.projectDescription
              : "No Description..."}
          </Text>
        </View>
        <View style={styles.option}>
          <Text style={{ ...styles.optionText, flex: 1, marginHorizontal: 10 }}>
            Start date:{" "}
            {new Date(project.startDate).getTime()
              ? Util.formatDate(new Date(project.startDate))
              : "none"}
          </Text>
          <Text style={{ ...styles.optionText, flex: 1, marginHorizontal: 10 }}>
            Due date:{" "}
            {new Date(project.dueDate).getTime()
              ? Util.formatDate(new Date(project.dueDate))
              : "none"}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableWithoutFeedback
          onPress={() => {
            props.navigation.navigate("ProjectRequirements", {
              projectKey: project.id,
              projectName: project.projectName,
            });
          }}
        >
          <View style={styles.option}>
            <View style={styles.icon}>
              <MaterialCommunityIcons name="bullseye-arrow" size={25} />
            </View>
            <Text style={styles.optionText}>Requirements</Text>
          </View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback
          onPress={() => {
            props.navigation.navigate("ProjectTestCases", {
              projectKey: project.id,
              projectName: project.projectName,
            });
          }}
        >
          <View style={styles.option}>
            <View style={styles.icon}>
              <MaterialCommunityIcons name="format-list-checks" size={25} />
            </View>
            <Text style={styles.optionText}>Test Cases</Text>
          </View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback
          onPress={() => {
            props.navigation.navigate("ProjectBugs", {
              projectKey: project.id,
              projectName: project.projectName,
            });
          }}
        >
          <View style={styles.option}>
            <View style={styles.icon}>
              <MaterialCommunityIcons name="bug" size={25} />
            </View>
            <Text style={styles.optionText}>Bugs</Text>
          </View>
        </TouchableWithoutFeedback>
      </View>

      <View style={styles.section}>
        <View style={styles.option}>
          <Text style={styles.optionText}>Test Progress: </Text>
          <View style={styles.progressContainer}>
            <View style={styles.progress}>
              <ProgressBar
                shouldAnimate={true} // to enable animation, default false
                animateDuration={500} // if animation enabled
                data={[
                  { progress: openTest, color: Colors.trivialLight },
                  { progress: passTest, color: Colors.minorLight },
                  { progress: failTest, color: Colors.criticalLight },
                  {
                    progress:
                      openTest === 0 && passTest === 0 && failTest === 0
                        ? 1
                        : 0,
                    color: Colors.bgColor,
                  },
                ]}
              />
            </View>
            <View style={styles.progressIndicator}>
              <Text style={{ color: Colors.trivialLight }}>OPEN</Text>
              <Text style={{ color: Colors.minorLight }}>PASSED</Text>
              <Text style={{ color: Colors.criticalLight }}>FAILED</Text>
            </View>
          </View>
        </View>

        <View style={styles.option}>
          <Text style={styles.optionText}>Bug Progress: </Text>
          <View style={styles.progressContainer}>
            <View style={styles.progress}>
              <ProgressBar
                shouldAnimate={true} // to enable animation, default false
                animateDuration={500} // if animation enabled
                data={[
                  { progress: openBug, color: Colors.criticalLight },
                  { progress: resolveBug, color: Colors.minorLight },
                  { progress: otherBug, color: Colors.dark },
                  {
                    progress:
                      openBug === 0 && resolveBug === 0 && otherBug === 0
                        ? 1
                        : 0,
                    color: Colors.bgColor,
                  },
                ]}
              />
            </View>
            <View style={styles.progressIndicator}>
              <Text style={{ color: Colors.criticalLight }}>OPEN</Text>
              <Text style={{ color: Colors.minorLight }}>RESOLVED</Text>
              <Text style={{ color: Colors.dark }}>OTHERS</Text>
            </View>
          </View>
        </View>

        <View style={styles.option}>
          <Text style={styles.optionText}>Overall Progress: </Text>
          <View style={styles.progressContainer}>
            <ProgressBar
              shouldAnimate={true} // to enable animation, default false
              animateDuration={500} // if animation enabled
              data={[
                {
                  progress: progress ? progress : 0,
                  color: Util.getProgressColor(progress),
                },
                {
                  progress: progress ? 1 - progress : 1,
                  color: Colors.bgColor,
                },
              ]}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

ProjectHomeScreen.navigationOptions = (navData) => {
  return {
    headerTitle: navData.navigation.getParam("projectName"),
    headerRight: (
      <HeaderButtons HeaderButtonComponent={HeaderButton}>
        <Item
          title="Delete"
          iconName="delete-forever"
          onPress={navData.navigation.getParam("deleteProject")}
        />
        <Item
          title="Edit"
          iconName="square-edit-outline"
          onPress={navData.navigation.getParam("editProject")}
        />
      </HeaderButtons>
    ),
  };
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.bgColor,
    padding: 5,
  },
  section: {
    width: "100%",
    alignItems: "center",
    marginVertical: 10,
  },
  option: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    padding: 10,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    backgroundColor: "#fff",
  },
  optionText: {
    width: 150,
    fontFamily: "roboto-regular",
    fontSize: 18,
    textAlignVertical: "center",
  },
  sectionTitle: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 10,
    paddingTop: 10,
    backgroundColor: "#fff",
  },
  sectionTitleText: {
    fontFamily: "roboto-regular",
    fontSize: 16,
    textAlignVertical: "center",
  },
  icon: {
    marginRight: 10,
  },
  progressContainer: {
    flexDirection: "column",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  progress: {
    width: "100%",
    justifyContent: "center",
  },
  progressIndicator: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
});

export default ProjectHomeScreen;
