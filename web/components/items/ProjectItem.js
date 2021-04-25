import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
  ProgressBarAndroid,
  ProgressViewIOS,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";

import Colors from "../../../common/constants/Colors";
import * as Util from "../../../common/utils/Util";
import { TO_BE_TESTED } from "../../../common/constants/TestStatus";
import { OPEN } from "../../../common/constants/Status";

import ProgressBar from "../UI/ProgressBar";

const ProjectItem = (props) => {
  const TESTCASES = useSelector(
    (state) => state.testCasesReducer.projectTestcases
  );
  const BUGS = useSelector((state) => state.bugsReducer.projectBugs);
  const projectTestCases = TESTCASES[props.project.id]
    ? TESTCASES[props.project.id]
    : [];
  const projectBugs = BUGS[props.project.id] ? BUGS[props.project.id] : [];

  const [openTest, setOpenTest] = useState(
    projectTestCases.filter((item) => item.status === TO_BE_TESTED).length
  );
  const [openBug, setOpenBug] = useState(
    projectBugs.filter((item) => item.status === OPEN).length
  );
  const [progress, setProgress] = useState(
    1 - (openTest + openBug) / (projectTestCases.length + projectBugs.length)
  );

  useEffect(() => {
    setOpenTest(
      projectTestCases.filter((item) => item.status === TO_BE_TESTED).length
    );
    setOpenBug(projectBugs.filter((item) => item.status === OPEN).length);
    setProgress(
      1 - (openTest + openBug) / (projectTestCases.length + projectBugs.length)
    );
  }, [projectTestCases, projectBugs]);

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        props.onSelectProject(props.project.id);
      }}
    >
      <View style={styles.projectContainer}>
        <View style={styles.rowSection}>
          <Text style={styles.projectId}>{props.project.projectId}</Text>
          <Text style={styles.titleText}>{props.project.projectName}</Text>
        </View>
        <View style={styles.projectContent}>
          <Text style={styles.contentText}>Opened Test Case: {openTest}</Text>
          <Text style={styles.contentText}>Opened Bug: {openBug}</Text>
        </View>
        <View style={styles.rowSection}>
          <Text style={styles.contentText}>Progress: </Text>
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
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  projectContainer: {
    width: "100%",
    backgroundColor: Colors.trivial,
    marginVertical: 2,
  },
  rowSection: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
  },
  projectId: {
    fontSize: 20,
    color: "gray",
    paddingHorizontal: 5,
  },
  titleText: {
    fontSize: 20,
  },
  projectContent: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  contentText: {
    fontSize: 18,
    textAlignVertical: "center",
  },
  progressContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 21,
  },
});

export default ProjectItem;
