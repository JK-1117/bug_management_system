import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
  Picker,
} from "react-native";
import { Redirect, useHistory } from "react-router-dom";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";

import Colors from "../../../common/constants/Colors";
import * as Util from "../../../common/utils/Util";
import * as Status from "../../../common/constants/Status";
import * as TestStatus from "../../../common/constants/TestStatus";
import * as ProjectsActions from "../../../common/store/actions/projectsActions";

import Card from "../../components/UI/Card";
import LoadingModal from "../../components/modals/LoadingModal";
import ProgressBar from "../../components/UI/ProgressBar";
import RequirementItem from "../../components/items/RequirementItem";
import TestCaseItem from "../../components/items/TestCaseItem";
import BugItem from "../../components/items/BugItem";
import Project from "../../../common/models/Project";

const ProjectHomeScreen = (props) => {
  const currUserRole = useSelector((state) => state.teamReducer.role);
  const projectId = props.params.projectId;
  const PROJECTS = useSelector((state) => state.projectsReducer.projects);
  const TESTCASES = useSelector(
    (state) => state.testCasesReducer.projectTestcases
  );
  const BUGS = useSelector((state) => state.bugsReducer.projectBugs);
  const REQUIREMENT = useSelector(
    (state) => state.requirementsReducer.projectRequirements
  );
  const history = useHistory();
  const dispatch = useDispatch();

  if (PROJECTS.length === 0) {
    props.setParams({});
    history.push("/Home/Project/AddProject");
  }

  const [error, setError] = useState(null);
  const [project, setSelectedProject] = useState(() => {
    const project = PROJECTS[0] ? PROJECTS[0] : new Project();
    return projectId ? PROJECTS.find((item) => item.id === projectId) : project;
  });
  const [projectTestCases, setProjectTestCases] = useState(
    TESTCASES[project.id] ? TESTCASES[project.id] : []
  );
  const [projectBugs, setProjectBugs] = useState(
    BUGS[project.id] ? BUGS[project.id] : []
  );
  const [projectRequirements, setProjectRequirements] = useState(
    REQUIREMENT[project.id] ? REQUIREMENT[project.id] : []
  );
  const [testcaseList, setTestcaseList] = useState(
    TESTCASES[project.id] ? TESTCASES[project.id] : []
  );
  const [bugList, setBugList] = useState(
    BUGS[project.id] ? BUGS[project.id] : []
  );
  const [requirementList, setRequirementList] = useState(
    REQUIREMENT[project.id] ? REQUIREMENT[project.id] : []
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
    const tempTestcases = TESTCASES[project.id] ? TESTCASES[project.id] : [];
    const tempBugs = BUGS[project.id] ? BUGS[project.id] : [];
    const tempRequirements = REQUIREMENT[project.id]
      ? REQUIREMENT[project.id]
      : [];
    const { query } = props;
    if (query) {
      setTestcaseList(
        tempTestcases.filter(
          (item) =>
            item.objective.toUpperCase().indexOf(query.toUpperCase()) >= 0 ||
            item.testcaseId.toUpperCase().indexOf(query.toUpperCase()) >= 0
        )
      );
      setBugList(
        tempBugs.filter(
          (item) =>
            item.bugTitle.toUpperCase().indexOf(query.toUpperCase()) >= 0 ||
            item.bugId.toUpperCase().indexOf(query.toUpperCase()) >= 0
        )
      );
      setRequirementList(
        tempRequirements.filter(
          (item) =>
            item.requirementTitle.toUpperCase().indexOf(query.toUpperCase()) >=
              0 ||
            item.requirementId.toUpperCase().indexOf(query.toUpperCase()) >= 0
        )
      );
    } else {
      setTestcaseList(tempTestcases);
      setBugList(tempBugs);
      setRequirementList(tempRequirements);
    }
    setProjectTestCases(tempTestcases);
    setProjectBugs(tempBugs);
    setProjectRequirements(tempRequirements);
  }, [project, TESTCASES, BUGS, REQUIREMENT, props.query]);

  useEffect(() => {
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
  }, [
    projectRequirements,
    projectTestCases,
    projectBugs,
    setOpenTest,
    setPassTest,
    setFailTest,
    setOpenBug,
    setResolveBug,
  ]);

  useEffect(() => {
    setOtherBug(projectBugs.length - openBug - resolveBug);
    setProgress(
      1 - (openTest + openBug) / (projectTestCases.length + projectBugs.length)
    );
  }, [
    openTest,
    openBug,
    resolveBug,
    projectTestCases,
    projectBugs,
    setOtherBug,
    setProgress,
  ]);

  const deleteProject = useCallback(() => {
    props.alert(
      "Delete Confirmation",
      "Are you sure you want to DELETE this project?",
      [
        {
          text: "DELETE",
          onPress: async () => {
            props.setIsLoading(true);
            setError(null);
            try {
              await dispatch(ProjectsActions.deleteProject(project.id));
            } catch (err) {
              setError(err.message);
            }
            props.setIsLoading(false);
            props.setParams({});
            history.push("/Home");
            history.go();
          },
          color: Colors.criticalDark,
        },
        { text: "CANCEL", color: Colors.criticalDark },
      ]
    );
  }, [dispatch, project]);

  useEffect(() => {
    if (error) {
      props.alert("An error occured", error, [{ text: "Okay" }]);
    }
  }, [error]);

  const renderRequirementItem = (itemData) => {
    return (
      <RequirementItem
        requirement={itemData.item}
        onSelect={(requirementKey) => {
          props.navigate("/Home/Requirement", {
            requirementKey: requirementKey,
          });
        }}
      />
    );
  };

  const renderTestcaseItem = (itemData) => {
    return (
      <TestCaseItem
        testcase={itemData.item}
        onSelect={(testcaseKey) => {
          props.navigate("/Home/TestCase", {
            testcaseKey: testcaseKey,
          });
        }}
      />
    );
  };

  const renderBugItem = (itemData) => {
    return (
      <BugItem
        bug={itemData.item}
        onSelect={(bugKey) => {
          props.navigate("/Home/Bug", {
            bugKey: bugKey,
          });
        }}
      />
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Card style={styles.card}>
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Project:</Text>
          <Picker
            mode="dropdown"
            selectedValue={project.id}
            style={styles.formControl}
            onValueChange={(itemValue, itemIndex) => {
              setSelectedProject(
                PROJECTS.find((item) => item.id === itemValue)
              );
            }}
          >
            {PROJECTS.map((item) => {
              return (
                <Picker.Item
                  key={item.id}
                  label={item.projectId + " - " + item.projectName}
                  value={item.id}
                />
              );
            })}
          </Picker>
          <TouchableWithoutFeedback
            onPress={() => {
              if (currUserRole.toUpperCase() === "SPECTATOR") {
                props.alert(
                  "Not enough privilege",
                  "Spectators are not allow to perform this action",
                  [{ text: "Ok" }]
                );
              } else {
                deleteProject();
              }
            }}
          >
            <MaterialCommunityIcons
              title="Delete Project"
              name="delete-forever"
              size={35}
              color={Colors.criticalDark}
            />
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback
            onPress={() => {
              if (currUserRole.toUpperCase() === "SPECTATOR") {
                props.alert(
                  "Not enough privilege",
                  "Spectators are not allow to perform this action",
                  [{ text: "Ok" }]
                );
              } else {
                props.setParams({ projectId: project.id });
                history.push("/Home/Project/AddProject");
              }
            }}
          >
            <MaterialCommunityIcons
              title="Edit Project"
              name="pencil"
              size={35}
              color={Colors.primaryColor}
            />
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback
            onPress={() => {
              if (currUserRole.toUpperCase() === "SPECTATOR") {
                props.alert(
                  "Not enough privilege",
                  "Spectators are not allow to perform this action",
                  [{ text: "Ok" }]
                );
              } else {
                props.setParams({});
                history.push("/Home/Project/AddProject");
              }
            }}
          >
            <MaterialCommunityIcons
              title="Add New Project"
              name="plus-circle"
              size={35}
              color={Colors.primaryColor}
            />
          </TouchableWithoutFeedback>
        </View>

        <View
          style={[
            styles.formGroup,
            { paddingVertical: 0, paddingBottom: 20, paddingHorizontal: 60 },
          ]}
        >
          <View
            style={{
              flexDirection: "column",
              justifyContent: "center",
              flex: 1,
            }}
          >
            <Text>Description:</Text>
            <Text style={styles.formLabel}>{project.projectDescription}</Text>
          </View>

          <View>
            <Text style={{ textAlignVertical: "center" }}>Start Date:</Text>
            <Text style={[styles.formLabel, { marginHorizontal: 10 }]}>
              {Util.formatDate(new Date(project.startDate))}
            </Text>
          </View>
          <View>
            <Text style={{ textAlignVertical: "center" }}>Due Date:</Text>
            <Text style={[styles.formLabel, { marginHorizontal: 10 }]}>
              {Util.formatDate(new Date(project.dueDate))}
            </Text>
          </View>
        </View>
      </Card>

      <View style={styles.statusContainer}>
        <Card style={[styles.card, { flex: 1 }]}>
          <View style={styles.status}>
            <View style={styles.col}>
              <Text style={styles.statusDescription}>Overall Progress</Text>
              <View style={[styles.col, { marginVertical: 10 }]}>
                <ProgressBar
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
              <View style={styles.progressIndicator}></View>
            </View>
            <View style={styles.icon}>
              <MaterialCommunityIcons
                name="progress-check"
                size={100}
                color={Colors.primaryColor}
              />
            </View>
          </View>
        </Card>

        <Card style={[styles.card, { flex: 1 }]}>
          <View style={styles.status}>
            <View style={styles.col}>
              <Text style={styles.statusDescription}>Test Progress</Text>
              <View style={[styles.col, { marginVertical: 10 }]}>
                <ProgressBar
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
                <Text style={[styles.legends, { color: Colors.trivialLight }]}>
                  OPEN
                </Text>
                <Text style={[styles.legends, { color: Colors.minorLight }]}>
                  PASSED
                </Text>
                <Text style={[styles.legends, { color: Colors.criticalLight }]}>
                  FAILED
                </Text>
              </View>
            </View>
            <View style={styles.icon}>
              <MaterialCommunityIcons
                name="format-list-checks"
                size={100}
                color={Colors.primaryColor}
              />
            </View>
          </View>
        </Card>

        <Card style={[styles.card, { flex: 1 }]}>
          <View style={styles.status}>
            <View style={styles.col}>
              <Text style={styles.statusDescription}>Bug Progress</Text>
              <View style={[styles.col, { marginVertical: 10 }]}>
                <ProgressBar
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
                <Text style={[styles.legends, { color: Colors.criticalLight }]}>
                  OPEN
                </Text>
                <Text style={[styles.legends, { color: Colors.minorLight }]}>
                  RESOLVED
                </Text>
                <Text style={[styles.legends, { color: Colors.dark }]}>
                  OTHERS
                </Text>
              </View>
            </View>
            <View style={styles.icon}>
              <MaterialCommunityIcons
                name="bug"
                size={100}
                color={Colors.primaryColor}
              />
            </View>
          </View>
        </Card>
      </View>

      <View style={styles.listContainer}>
        <Card style={styles.listCard}>
          <View style={styles.listWrapper}>
            <View style={styles.listHeader}>
              <View style={styles.listTitle}>
                <MaterialCommunityIcons
                  name="bullseye-arrow"
                  size={30}
                  color={Colors.primaryColor}
                />
                <Text style={styles.listTitleText}>
                  REQUIREMENT ({requirementList.length})
                </Text>
                <TouchableWithoutFeedback
                  onPress={() => {
                    if (currUserRole.toUpperCase() === "SPECTATOR") {
                      props.alert(
                        "Not enough privilege",
                        "Spectators are not allow to perform this action",
                        [{ text: "Ok" }]
                      );
                    } else {
                      props.navigate("/Home/AddRequirement", {
                        projectKey: project.id,
                      });
                    }
                  }}
                >
                  <MaterialCommunityIcons
                    title="Add Requirement"
                    name="plus-circle-outline"
                    size={35}
                    color={Colors.primaryColor}
                  />
                </TouchableWithoutFeedback>
              </View>
            </View>
            <FlatList
              style={styles.list}
              data={requirementList}
              keyExtractor={(item, index) => item.key}
              renderItem={renderRequirementItem}
            />
          </View>
        </Card>

        <Card style={styles.listCard}>
          <View style={styles.listWrapper}>
            <View style={styles.listHeader}>
              <View style={styles.listTitle}>
                <MaterialCommunityIcons
                  name="format-list-checks"
                  size={30}
                  color={Colors.primaryColor}
                />
                <Text style={styles.listTitleText}>
                  TEST CASES ({testcaseList.length})
                </Text>
                <TouchableWithoutFeedback
                  onPress={() => {
                    if (currUserRole.toUpperCase() === "SPECTATOR") {
                      props.alert(
                        "Not enough privilege",
                        "Spectators are not allow to perform this action",
                        [{ text: "Ok" }]
                      );
                    } else {
                      props.navigate("/Home/AddTestCase", {
                        projectKey: project.id,
                      });
                    }
                  }}
                >
                  <MaterialCommunityIcons
                    title="Add Test Case"
                    name="plus-circle-outline"
                    size={35}
                    color={Colors.primaryColor}
                  />
                </TouchableWithoutFeedback>
              </View>
            </View>
            <FlatList
              style={styles.list}
              data={testcaseList}
              keyExtractor={(item, index) => item.key}
              renderItem={renderTestcaseItem}
            />
          </View>
        </Card>

        <Card style={styles.listCard}>
          <View style={styles.listWrapper}>
            <View style={styles.listHeader}>
              <View style={styles.listTitle}>
                <MaterialCommunityIcons
                  name="bug"
                  size={30}
                  color={Colors.primaryColor}
                />
                <Text style={styles.listTitleText}>
                  BUGS ({bugList.length})
                </Text>
                <TouchableWithoutFeedback
                  onPress={() => {
                    if (currUserRole.toUpperCase() === "SPECTATOR") {
                      props.alert(
                        "Not enough privilege",
                        "Spectators are not allow to perform this action",
                        [{ text: "Ok" }]
                      );
                    } else {
                      props.navigate("/Home/AddBug", {
                        projectKey: project.id,
                      });
                    }
                  }}
                >
                  <MaterialCommunityIcons
                    title="Add Bug"
                    name="plus-circle-outline"
                    size={35}
                    color={Colors.primaryColor}
                  />
                </TouchableWithoutFeedback>
              </View>
            </View>
            <FlatList
              style={styles.list}
              data={bugList}
              keyExtractor={(item, index) => item.key}
              renderItem={renderBugItem}
            />
          </View>
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flex: 1,
  },
  col: {
    flex: 1,
    height: "100%",
  },
  card: {
    backgroundColor: "#fff",
  },
  legends: {
    fontWeight: "bold",
    marginHorizontal: 2,
  },
  listCard: {
    flex: 1,
    margin: 15,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  formGroup: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 40,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  formControl: {
    flex: 1,
    fontSize: 18,
    marginHorizontal: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  formLabel: {
    fontSize: 20,
    textAlignVertical: "center",
  },
  statusContainer: {
    flexDirection: "row",
  },
  status: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    padding: 30,
    borderRadius: 10,
  },
  statusNumber: {
    flexDirection: "row",
    fontWeight: "bold",
    fontSize: 50,
    textAlign: "center",
    color: Colors.primaryColorDark,
  },
  statusDescription: {
    fontSize: 24,
    flexWrap: "wrap",
    color: Colors.primaryColorDark,
  },
  progressIndicator: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  listContainer: {
    flexDirection: "row",
    flex: 1,
  },
  listWrapper: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    height: 400,
  },
  list: {
    width: "100%",
  },
  listHeader: {
    flexDirection: "row",
    padding: 5,
  },
  listTitle: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
  },
  listTitleText: {
    flex: 1,
    fontSize: 18,
    marginHorizontal: 10,
  },
  icon: {
    marginHorizontal: 10,
  },
});

export default ProjectHomeScreen;
