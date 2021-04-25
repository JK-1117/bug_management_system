import React, { useState, useEffect, useCallback, useReducer } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Picker,
  FlatList,
  Dimensions,
} from "react-native";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import { useSelector, useDispatch } from "react-redux";
import { PieChart, ContributionGraph } from "react-native-chart-kit";
import {
  VictoryStack,
  VictoryBar,
  VictoryChart,
  VictoryGroup,
  VictoryTheme,
  VictoryLegend,
  VictoryPie,
} from "victory-native";

import Colors from "../../../common/constants/Colors";
import * as Util from "../../../common/utils/Util";
import * as TestStatus from "../../../common/constants/TestStatus";
import * as Status from "../../../common/constants/Status";
import * as Severity from "../../../common/constants/Severity";
import * as ProjectsActions from "../../../common/store/actions/projectsActions";
import * as RequirementsActions from "../../../common/store/actions/requirementsActions";
import * as TestCasesActions from "../../../common/store/actions/testCasesActions";
import * as BugsActions from "../../../common/store/actions/bugsActions";

import HeaderButton from "../../components/UI/HeaderButton";
import LoadingModal from "../../components/modals/LoadingModal";
import Project from "../../../common/models/Project";

const DashboardScreen = (props) => {
  const PROJECTS = useSelector((state) => state.projectsReducer.projects);
  const REQUIREMENTS = useSelector(
    (state) => state.requirementsReducer.projectRequirements
  );
  const TESTCASES = useSelector(
    (state) => state.testCasesReducer.projectTestcases
  );
  const BUGS = useSelector((state) => state.bugsReducer.projectBugs);
  const now = new Date();
  const endDate =
    now.getMonth() == 9
      ? new Date(now.getFullYear() + 1, 0, 1)
      : new Date(now.getFullYear(), now.getMonth() + 3, 1);

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState();
  const [densityChartHeight, setDensityChartHeight] = useState(300);
  const [selectedProject, setSelectedProject] = useState(
    PROJECTS.length > 0 ? PROJECTS[0].id : ""
  );
  const projectTestCases = TESTCASES[selectedProject]
    ? TESTCASES[selectedProject]
    : [];
  const projectBugs = BUGS[selectedProject] ? BUGS[selectedProject] : [];

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
  const [assignedBug, setAssignedBug] = useState(
    projectBugs.filter((item) => item.status === Status.ASSIGNED).length
  );
  const [retestedBug, setRetestedBug] = useState(
    projectBugs.filter((item) => item.status === Status.RETESTED).length
  );
  const [fixedBug, setFixedBug] = useState(
    projectBugs.filter((item) => item.status === Status.FIXED).length
  );
  const [resolveBug, setResolveBug] = useState(
    projectBugs.filter((item) => item.status === Status.APPROVE_RESOLVE).length
  );
  const [requirementMinorBug, setRequirementMinorBug] = useState(null);
  const [requirementMajorBug, setRequirementMajorBug] = useState(null);
  const [requirementCriticalBug, setRequirementCriticalBug] = useState(null);
  const [bugDueDate, setBugDueDate] = useState([]);
  const chartConfig = {
    backgroundColor: "#1cc910",
    backgroundGradientFrom: "#eff3ff",
    backgroundGradientTo: "#efefef",
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };
  const screenWidth = Dimensions.get("window").width;
  const dispatch = useDispatch();

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
    setAssignedBug(
      projectBugs.filter((item) => item.status === Status.ASSIGNED).length
    );
    setRetestedBug(
      projectBugs.filter((item) => item.status === Status.RETESTED).length
    );
    setFixedBug(
      projectBugs.filter((item) => item.status === Status.FIXED).length
    );
    setResolveBug(
      projectBugs.filter((item) => item.status === Status.APPROVE_RESOLVE)
        .length
    );
  }, [
    projectTestCases,
    projectBugs,
    setOpenTest,
    setPassTest,
    setFailTest,
    setOpenBug,
    setAssignedBug,
    setRetestedBug,
    setFixedBug,
    setResolveBug,
  ]);

  useEffect(() => {
    if (REQUIREMENTS) {
      const projectReq = REQUIREMENTS[selectedProject]
        ? REQUIREMENTS[selectedProject]
        : [];
      const requirementLength = projectReq.length;
      if (requirementLength > 6) {
        setDensityChartHeight(requirementLength * 50);
      }
      const projectBugs = BUGS[selectedProject] ? BUGS[selectedProject] : [];
      const projectTestcases = TESTCASES[selectedProject]
        ? TESTCASES[selectedProject]
        : [];
      let tempMinor = [];
      let tempMajor = [];
      let tempCritical = [];

      projectReq.forEach((item, index, array) => {
        let tempReqMinor = 0;
        let tempReqMajor = 0;
        let tempReqCritical = 0;

        const testcaseList = projectTestcases.filter(
          (tc) => tc.requirementKey === item.key
        );

        testcaseList.forEach((tcItem, index, array) => {
          const bugList = projectBugs.filter(
            (bug) => bug.testcaseKey === tcItem.key
          );

          tempReqMinor += bugList.filter(
            (bug) => bug.severity === Severity.MINOR
          ).length;
          tempReqMajor += bugList.filter(
            (bug) => bug.severity === Severity.MAJOR
          ).length;
          tempReqCritical += bugList.filter(
            (bug) => bug.severity === Severity.MISSION_CRITICAL
          ).length;
        });

        tempMinor.push({ x: item.requirementId, y: tempReqMinor });
        tempMajor.push({ x: item.requirementId, y: tempReqMajor });
        tempCritical.push({ x: item.requirementId, y: tempReqCritical });
      });

      setRequirementMinorBug(tempMinor);
      setRequirementMajorBug(tempMajor);
      setRequirementCriticalBug(tempCritical);
    } else {
      setRequirementMinorBug(null);
      setRequirementMajorBug(null);
      setRequirementCriticalBug(null);
    }
  }, [REQUIREMENTS, TESTCASES, BUGS, selectedProject]);

  // console.log("setRequirementOpenBug: ", requirementOpenBug);
  // console.log("setRequirementResolveBug: ", requirementResolveBug);
  // console.log("setRequirementOthersBug: ", requirementOthersBug);

  useEffect(() => {
    if (BUGS) {
      const projectBugs = BUGS[selectedProject] ? BUGS[selectedProject] : [];
      let tempBugDueDate = [];

      projectBugs.forEach((item, index, array) => {
        if (item.dueDate) {
          const tempDueDate = `${item.dueDate.getFullYear()}-${Util.appendLeadingZeroes(
            item.dueDate.getMonth() + 1
          )}-${item.dueDate.getDate()}`;

          const numOfBug = array.filter((bug) => {
            const date = `${bug.dueDate.getFullYear()}-${Util.appendLeadingZeroes(
              bug.dueDate.getMonth() + 1
            )}-${bug.dueDate.getDate()}`;

            return date === tempDueDate;
          }).length;

          const tempData = {
            date: tempDueDate,
            count: numOfBug,
          };

          if (
            tempBugDueDate.filter((item) => item.date === tempDueDate)
              .length === 0
          ) {
            tempBugDueDate.push(tempData);
          }
        }
      });
      tempBugDueDate.push({
        date: `${endDate.getFullYear()}-${Util.appendLeadingZeroes(
          endDate.getMonth() + 1
        )}-${endDate.getDate()}`,
        count: 0.5,
      });
      setBugDueDate(tempBugDueDate);
      // console.log(bugDueDate);
    } else {
      setBugDueDate([]);
    }
  }, [BUGS, setBugDueDate, selectedProject]);

  const loadProjects = useCallback(async () => {
    setError(null);
    setIsRefreshing(true);
    try {
      dispatch(ProjectsActions.fetchProjects());
      dispatch(RequirementsActions.fetchRequirements());
      dispatch(TestCasesActions.fetchTestcase());
      dispatch(BugsActions.fetchBugs());
    } catch (err) {
      setError(err.message);
    }
    setIsRefreshing(false);
  }, [dispatch, setIsRefreshing, setError]);

  useEffect(() => {
    const willFocusSub = props.navigation.addListener(
      "willFocus",
      loadProjects
    );

    return () => {
      willFocusSub.remove();
    };
  }, [loadProjects]);

  useEffect(() => {
    setIsLoading(true);
    loadProjects().then(() => {
      setIsLoading(false);
    });
  }, [dispatch, loadProjects]);

  useEffect(() => {
    if (error) {
      Alert.alert("An error occured", error, [{ text: "Okay" }]);
    }
  }, [error]);

  return (
    <View style={styles.screen}>
      {isLoading && <LoadingModal />}

      <FlatList
        refreshing={isRefreshing}
        onRefresh={loadProjects}
        style={styles.list}
        data={[]}
        keyExtractor={(item, index) => item.id}
        renderItem={(item) => <View></View>}
        ListHeaderComponent={
          <ScrollView style={styles.scrollArea}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Project</Text>
              <Picker
                mode="dropdown"
                selectedValue={selectedProject}
                style={styles.formControl}
                onValueChange={(itemValue, itemIndex) => {
                  setSelectedProject(itemValue);
                  // console.log(selectedProject);
                }}
              >
                {/* {PROJECTS.length === 0 && (
                  <Picker.Item key="none" label="No Project yet..." value="" />
                )} */}
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

            <View style={styles.chartContainer}>
              <Text style={styles.title}>Test Case Status</Text>
              <PieChart
                data={[
                  {
                    name: "To Be Tested",
                    num: openTest,
                    color: Colors.trivialLight,
                    legendFontColor: "gray",
                    legendFontSize: 14,
                  },
                  {
                    name: "Passed",
                    num: passTest,
                    color: Colors.minorLight,
                    legendFontColor: "gray",
                    legendFontSize: 14,
                  },
                  {
                    name: "Failed",
                    num: failTest,
                    color: Colors.criticalLight,
                    legendFontColor: "gray",
                    legendFontSize: 14,
                  },
                ]}
                width={screenWidth - 30}
                height={220}
                chartConfig={chartConfig}
                accessor="num"
                backgroundColor="transparent"
                paddingLeft="10"
                absolute
              />
            </View>

            <View style={styles.chartContainer}>
              <Text style={styles.title}>Bug Status</Text>
              <PieChart
                data={[
                  {
                    name: "Open",
                    num: openBug,
                    color: Colors.criticalLight,
                    legendFontColor: "gray",
                    legendFontSize: 14,
                  },
                  {
                    name: "Assigned",
                    num: assignedBug,
                    color: Colors.majorDark,
                    legendFontColor: "gray",
                    legendFontSize: 14,
                  },
                  {
                    name: "Retested",
                    num: retestedBug,
                    color: Colors.warning,
                    legendFontColor: "gray",
                    legendFontSize: 14,
                  },
                  {
                    name: "Fixed",
                    num: fixedBug,
                    color: Colors.trivialLight,
                    legendFontColor: "gray",
                    legendFontSize: 14,
                  },
                  {
                    name: "Approved Resolve",
                    num: resolveBug,
                    color: Colors.minorLight,
                    legendFontColor: "gray",
                    legendFontSize: 14,
                  },
                ]}
                width={screenWidth - 30}
                height={220}
                chartConfig={chartConfig}
                accessor="num"
                backgroundColor="transparent"
                paddingLeft="10"
                absolute
              />
            </View>

            <View style={{ ...styles.chartContainer }}>
              <Text style={styles.title}>Bug Density</Text>
              <VictoryChart
                theme={VictoryTheme.material}
                domainPadding={{ x: [30, 30], y: [10, 10] }}
                padding={{ left: 70, right: 50, top: 30, bottom: 30 }}
                height={densityChartHeight}
              >
                <VictoryLegend
                  y={0}
                  style={{ labels: { fontSize: 14 } }}
                  orientation="horizontal"
                  gutter={10}
                  data={[
                    {
                      name: "Minor",
                      symbol: { fill: Colors.minorLight },
                    },
                    {
                      name: "Major",
                      symbol: { fill: Colors.majorDark },
                    },
                    {
                      name: "Mission Critical",
                      symbol: {
                        fill: Colors.criticalLight,
                      },
                    },
                  ]}
                />
                {requirementMinorBug &&
                  requirementMajorBug &&
                  requirementCriticalBug && (
                    <VictoryStack
                      horizontal
                      offset={10}
                      style={{ data: { width: 6 } }}
                      colorScale={[
                        Colors.minorLight,
                        Colors.majorDark,
                        Colors.criticalLight,
                      ]}
                      animate={{
                        duration: 500,
                        onLoad: { duration: 500 },
                      }}
                    >
                      <VictoryBar data={requirementMinorBug} />
                      <VictoryBar data={requirementMajorBug} />
                      <VictoryBar data={requirementCriticalBug} />
                    </VictoryStack>
                  )}
              </VictoryChart>
            </View>

            <View style={styles.chartContainer}>
              <Text style={styles.title}>Bugs Due Date Heat Map</Text>
              <Text style={styles.subTitle}>(Next 3 months)</Text>
              <ContributionGraph
                values={bugDueDate}
                endDate={endDate}
                numDays={105}
                width={screenWidth - 30}
                height={220}
                chartConfig={{
                  backgroundColor: "#fff",
                  backgroundGradientFrom: "#fff",
                  backgroundGradientTo: "#fff",
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(177, 58, 59, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                }}
              />
            </View>
          </ScrollView>
        }
      />
    </View>
  );
};

DashboardScreen.navigationOptions = (navData) => {
  return {
    headerTitle: "Dashboard",
    headerLeft: (
      <HeaderButtons HeaderButtonComponent={HeaderButton}>
        <Item
          title="Menu"
          iconName="menu"
          onPress={() => {
            navData.navigation.toggleDrawer();
          }}
        />
      </HeaderButtons>
    ),
  };
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
  },
  scrollArea: {
    width: "100%",
    backgroundColor: Colors.bgColor,
  },
  title: {
    width: "100%",
    padding: 10,
    fontFamily: "roboto-regular",
    fontSize: 20,
  },
  subTitle: {
    width: "100%",
    paddingHorizontal: 15,
    fontFamily: "roboto-regular",
    fontSize: 12,
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
  chartContainer: {
    width: "100%",
    padding: 15,
    backgroundColor: "#ffffff",
  },
});

export default DashboardScreen;
