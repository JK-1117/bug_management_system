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
import { useSelector, useDispatch } from "react-redux";
import {
  PieChart,
  StackedBarChart,
  ContributionGraph,
} from "react-native-chart-kit";

import Card from "../../components/UI/Card";

import Colors from "../../../common/constants/Colors";
import * as Util from "../../../common/utils/Util";
import * as TestStatus from "../../../common/constants/TestStatus";
import * as Status from "../../../common/constants/Status";
import * as Severity from "../../../common/constants/Severity";
import * as ProjectsActions from "../../../common/store/actions/projectsActions";
import * as RequirementsActions from "../../../common/store/actions/requirementsActions";
import * as TestCasesActions from "../../../common/store/actions/testCasesActions";
import * as BugsActions from "../../../common/store/actions/bugsActions";

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
  const numOfDay =
    (endDate.getTime() -
      new Date(now.getFullYear(), now.getMonth(), 0).getTime()) /
    (1000 * 3600 * 24);

  const { setIsLoading } = props;
  const [error, setError] = useState();
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
  const [requirementList, setRequirementList] = useState([]);
  const [bugDensity, setBugDensity] = useState([]);
  const [bugDueDate, setBugDueDate] = useState([]);
  const chartConfig = {
    backgroundColor: "#1cc910",
    backgroundGradientFrom: "#eff3ff",
    backgroundGradientTo: "#efefef",
    decimalPlaces: 0,
    barPercentage: 0.5,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 10,
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
      const projectBugs = BUGS[selectedProject] ? BUGS[selectedProject] : [];
      const projectTestcases = TESTCASES[selectedProject]
        ? TESTCASES[selectedProject]
        : [];
      let tempRequirementList = [];
      let tempBugDensity = [];

      projectReq.forEach((item, index, array) => {
        let tempReqMinorBug = 0;
        let tempReqMajorBug = 0;
        let tempReqCriticalBug = 0;

        const testcaseList = projectTestcases.filter(
          (tc) => tc.requirementKey === item.key
        );

        testcaseList.forEach((tcItem, index, array) => {
          const bugList = projectBugs.filter(
            (bug) => bug.testcaseKey === tcItem.key
          );

          tempReqMinorBug += bugList.filter(
            (bug) => bug.severity === Severity.MINOR
          ).length;
          tempReqMajorBug += bugList.filter(
            (bug) => bug.severity === Severity.MAJOR
          ).length;
          tempReqCriticalBug += bugList.filter(
            (bug) => bug.severity === Severity.MISSION_CRITICAL
          ).length;
        });

        tempRequirementList.push(item.requirementId);
        tempBugDensity.push([
          tempReqMinorBug,
          tempReqMajorBug,
          tempReqCriticalBug,
        ]);
      });

      setRequirementList(tempRequirementList);
      setBugDensity(tempBugDensity);
    } else {
      setRequirementList([]);
      setBugDensity([]);
    }
  }, [REQUIREMENTS, TESTCASES, BUGS, selectedProject]);

  useEffect(() => {
    if (BUGS) {
      const projectBugs = BUGS[selectedProject] ? BUGS[selectedProject] : [];
      let tempBugDueDate = [];

      projectBugs.forEach((item, index, array) => {
        if (item.dueDate && new Date(item.dueDate).getTime()) {
          const tempDueDate = `${new Date(
            item.dueDate
          ).getFullYear()}-${Util.appendLeadingZeroes(
            new Date(item.dueDate).getMonth() + 1
          )}-${new Date(item.dueDate).getDate()}`;

          const numOfBug = array.filter((bug) => {
            const date = `${new Date(
              bug.dueDate
            ).getFullYear()}-${Util.appendLeadingZeroes(
              new Date(bug.dueDate).getMonth() + 1
            )}-${new Date(bug.dueDate).getDate()}`;

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
        )}-${endDate.getDate() + 1}`,
        count: 0.5,
      });
      setBugDueDate(tempBugDueDate);
    } else {
      setBugDueDate([]);
    }
  }, [BUGS, setBugDueDate, selectedProject]);

  const loadProjects = useCallback(async () => {
    setError(null);
    try {
      dispatch(ProjectsActions.fetchProjects());
      dispatch(RequirementsActions.fetchRequirements());
      dispatch(TestCasesActions.fetchTestcase());
      dispatch(BugsActions.fetchBugs());
    } catch (err) {
      setError(err.message);
    }
  }, [dispatch, setError]);

  useEffect(() => {
    setIsLoading(true);
    loadProjects().then(() => {
      setIsLoading(false);
    });
  }, [dispatch, loadProjects]);

  useEffect(() => {
    if (error) {
      props.alert("An error occured", error, [{ text: "Okay" }]);
    }
  }, [error]);

  return (
    <View style={styles.screen}>
      <Card style={[styles.card, { paddingBottom: 0, paddingHorizontal: 0 }]}>
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Project:</Text>
          <Picker
            mode="dropdown"
            selectedValue={selectedProject}
            style={styles.formControl}
            onValueChange={(itemValue, itemIndex) => {
              setSelectedProject(itemValue);
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
        </View>
      </Card>

      <View style={styles.row}>
        <Card style={[styles.card, { flex: 1 }]}>
          <Text style={styles.title}>Bug Density</Text>
          <StackedBarChart
            data={{
              labels: requirementList,
              legend: ["Minor", "Major", "Mission Critical"],
              data: bugDensity,
              barColors: [
                Colors.minorLight,
                Colors.majorLight,
                Colors.criticalLight,
              ],
            }}
            width={900}
            height={250}
            chartConfig={chartConfig}
            horizontalLabelRotation={60}
          />
        </Card>
      </View>

      <View style={styles.row}>
        <View style={{ flexDirection: "column", flex: 1 }}>
          <Card style={[styles.card, { flex: 1 }]}>
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
                  name: "Resolved",
                  num: resolveBug,
                  color: Colors.minorLight,
                  legendFontColor: "gray",
                  legendFontSize: 14,
                },
              ]}
              width={400}
              height={180}
              chartConfig={chartConfig}
              accessor="num"
              backgroundColor="transparent"
              paddingLeft="10"
              absolute
            />
          </Card>
          <Card style={[styles.card, { flex: 1 }]}>
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
              width={400}
              height={180}
              chartConfig={chartConfig}
              accessor="num"
              backgroundColor="transparent"
              paddingLeft="10"
              absolute
            />
          </Card>
        </View>

        <Card style={[styles.card, { flex: 1 }]}>
          <Text style={styles.title}>Bugs Due Date Heatmap</Text>
          <Text style={styles.subTitle}>(Next 3 months)</Text>
          <View style={{ flex: 1, justifyContent: "center" }}>
            <ContributionGraph
              values={bugDueDate}
              endDate={endDate}
              numDays={numOfDay}
              width={440}
              height={300}
              squareSize={27}
              // horizontal={false}
              chartConfig={{
                backgroundColor: "#fff",
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(177, 58, 59, ${opacity})`,
                style: {
                  borderRadius: 10,
                },
              }}
            />
          </View>
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  row: {
    // flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingBottom: 10,
    alignItems: "center",
  },
  title: {
    width: "100%",
    paddingVertical: 10,
    fontSize: 25,
    color: Colors.primaryColorDark,
  },
  formGroup: {
    width: "100%",
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
});

export default DashboardScreen;
