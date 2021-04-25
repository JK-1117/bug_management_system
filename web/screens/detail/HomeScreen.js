import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";

import Colors from "../../../common/constants/Colors";
import * as Util from "../../../common/utils/Util";
import { TO_BE_TESTED } from "../../../common/constants/TestStatus";
import { APPROVE_RESOLVE } from "../../../common/constants/Status";

import Card from "../../components/UI/Card";
import FeedItem from "../../components/items/FeedItem";
import ProjectItem from "../../components/items/ProjectItem";
import LoadingModal from "../../components/modals/LoadingModal";

import * as authActions from "../../../common/store/actions/authActions";
import * as FeedsActions from "../../../common/store/actions/feedsActions";
import * as TeamActions from "../../../common/store/actions/teamActions";
import * as ProjectsActions from "../../../common/store/actions/projectsActions";
import * as BugsActions from "../../../common/store/actions/bugsActions";
import * as RequirementsActions from "../../../common/store/actions/requirementsActions";
import * as TestCasesActions from "../../../common/store/actions/testCasesActions";
import { useHistory } from "react-router-dom";

const HomeScreen = (props) => {
  const PROJECTS = useSelector((state) => state.projectsReducer.projects);
  const TESTCASES = useSelector((state) => state.testCasesReducer.testcases);
  const BUGS = useSelector((state) => state.bugsReducer.bugs);
  const projectTestCases = TESTCASES.filter(
    (item) =>
      PROJECTS.filter((project) => item.projectKey === project.id).length > 0
  );
  const projectBugs = BUGS.filter(
    (item) =>
      PROJECTS.filter((project) => item.projectKey === project.id).length > 0
  );
  const [openTest, setOpenTest] = useState(
    projectTestCases.filter((item) => item.status === TO_BE_TESTED).length
  );
  const [openBug, setOpenBug] = useState(
    projectBugs.filter((item) => item.status !== APPROVE_RESOLVE).length
  );
  const [dueBug, setDueBug] = useState(
    projectBugs.filter(
      (item) =>
        Util.formatDate(new Date(item.dueDate)) === Util.formatDate(new Date())
    ).length
  );
  const userId = useSelector((state) => state.authReducer.user.userId);
  const invitation = useSelector((state) => state.teamReducer.teamInvitation);
  const FEEDS = useSelector((state) => state.feedsReducer.feeds);
  const [feedList, setFeedList] = useState(FEEDS);
  const [projectList, setProjectList] = useState(PROJECTS);

  const [error, setError] = useState();
  const history = useHistory();
  const dispatch = useDispatch();
  const loadFeeds = useCallback(async () => {
    setError(null);
    try {
      dispatch(FeedsActions.fetchFeeds());
      dispatch(ProjectsActions.fetchProjects());
      dispatch(BugsActions.fetchBugs());
      dispatch(RequirementsActions.fetchRequirements());
      dispatch(TestCasesActions.fetchTestcase());
      dispatch(TeamActions.fetchTeam());
      dispatch(TeamActions.fetchInvitation());
    } catch (err) {
      setError(err.message);
    }
  }, [dispatch, setError]);

  useEffect(() => {
    loadFeeds();
  }, [loadFeeds]);

  useEffect(() => {
    setOpenTest(
      projectTestCases.filter((item) => item.status === TO_BE_TESTED).length
    );
    setOpenBug(
      projectBugs.filter((item) => item.status !== APPROVE_RESOLVE).length
    );
    setDueBug(
      projectBugs.filter(
        (item) =>
          Util.formatDate(new Date(item.dueDate)) ===
          Util.formatDate(new Date())
      ).length
    );
  }, [projectTestCases, projectBugs]);

  useEffect(() => {
    const { query } = props;
    if (query) {
      setFeedList(
        FEEDS.filter(
          (item) =>
            item.objectiveTitle.toUpperCase().indexOf(query.toUpperCase()) >= 0
        )
      );
      setProjectList(
        PROJECTS.filter(
          (item) =>
            item.projectName.toUpperCase().indexOf(query.toUpperCase()) >= 0
        )
      );
    } else {
      setFeedList(FEEDS);
      setProjectList(PROJECTS);
    }
  }, [props.query, FEEDS, PROJECTS]);

  useEffect(() => {
    if (error) {
      props.alert("An error occured", error, [{ text: "Ok" }]);
    }
  }, [error]);

  const onSelectProject = (id) => {
    props.setParams({ projectId: id });
    history.push("/Home/Project");
  };

  const navigation = (path, params) => {
    props.setParams(params);
    history.push(path);
  };

  const renderFeedItem = (itemData) => {
    return (
      <TouchableWithoutFeedback style={styles.cardContainer}>
        <FeedItem feed={itemData.item} navigate={navigation} />
      </TouchableWithoutFeedback>
    );
  };

  const renderProject = (itemData) => {
    return (
      <ProjectItem project={itemData.item} onSelectProject={onSelectProject} />
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.statusContainer}>
        <Card style={styles.card}>
          <View style={[styles.status, { backgroundColor: Colors.danger }]}>
            <View style={styles.col}>
              <Text style={styles.statusNumber}>{dueBug}</Text>
              <Text style={styles.statusDescription}>
                Bugs <br />
                overdue today
              </Text>
            </View>
            <View style={styles.icon}>
              <MaterialCommunityIcons
                name="calendar-today"
                size={100}
                color="#fff"
              />
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={[styles.status, { backgroundColor: Colors.major }]}>
            <View style={styles.col}>
              <Text style={styles.statusNumber}>{openTest}</Text>
              <Text style={styles.statusDescription}>
                Test Cases <br />
                not executed
              </Text>
            </View>
            <View style={styles.icon}>
              <MaterialCommunityIcons
                name="format-list-checks"
                size={100}
                color="#fff"
              />
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={[styles.status, { backgroundColor: Colors.major }]}>
            <View style={styles.col}>
              <Text style={styles.statusNumber}>{openBug}</Text>
              <Text style={styles.statusDescription}>
                Bugs <br />
                have not resolved
              </Text>
            </View>
            <View style={styles.icon}>
              <MaterialCommunityIcons name="bug" size={100} color="#fff" />
            </View>
          </View>
        </Card>
      </View>

      <View style={styles.listContainer}>
        <Card style={styles.card}>
          <View style={styles.listWrapper}>
            <View style={styles.listHeader}>
              <View style={styles.listTitle}>
                <MaterialCommunityIcons
                  name="bell-ring"
                  size={30}
                  color={Colors.primaryColor}
                />
                <Text style={styles.listTitleText}>FEEDS</Text>
              </View>
            </View>
            <FlatList
              style={styles.list}
              data={feedList}
              keyExtractor={(item, index) => item.id}
              renderItem={renderFeedItem}
            />
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.listWrapper}>
            <View style={styles.listHeader}>
              <View style={styles.listTitle}>
                <MaterialCommunityIcons
                  name="folder"
                  size={30}
                  color={Colors.primaryColor}
                />
                <Text style={styles.listTitleText}>
                  PROJECTS ({projectList.length})
                </Text>
              </View>
            </View>
            <FlatList
              style={styles.list}
              data={projectList}
              keyExtractor={(item, index) => item.id}
              renderItem={renderProject}
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
  col: {
    flexDirection: "column",
  },
  card: {
    flex: 1,
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
    color: "#fff",
    fontWeight: "bold",
    fontSize: 50,
    textAlign: "center",
  },
  statusDescription: {
    color: "#fff",
    fontSize: 20,
    flexWrap: "wrap",
  },
  listContainer: {
    flexDirection: "row",
    flex: 1,
  },
  listWrapper: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 10,
    height: 546,
    backgroundColor: "#fff",
  },
  list: {
    width: "100%",
    padding: 5,
  },
  cardContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 18,
    marginHorizontal: 10,
  },
  icon: {
    marginHorizontal: 10,
  },
});

export default HomeScreen;
