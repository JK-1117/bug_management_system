import React, { useState, useEffect, useCallback } from "react";
import { Text, View, StyleSheet, FlatList, Alert } from "react-native";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import DropdownMenu from "react-native-dropdown-menu";
import { useSelector, useDispatch } from "react-redux";

import Colors from "../../../common/constants/Colors";
import { TEST_STATUS } from "../../../common/constants/TestStatus";

import * as TestCasesActions from "../../../common/store/actions/testCasesActions";
import TestCaseItem from "../../components/items/TestCaseItem";
import LoadingModal from "../../components/modals/LoadingModal";
import HeaderButton from "../../components/UI/HeaderButton";

const ProjectTestCasesScreen = (props) => {
  const currUserRole = useSelector((state) => state.teamReducer.role);
  const projectKey = props.navigation.getParam("projectKey");
  const TESTCASES = useSelector(
    (state) => state.testCasesReducer.projectTestcases
  );
  const TEAM = useSelector((state) => state.teamReducer.teamUser);
  const USERS = useSelector((state) => state.authReducer.userList);
  const [filters, setFilters] = useState([
    ["Status", ...TEST_STATUS],
    ["Tester"],
  ]);
  const [teamUser, setTeamUser] = useState([]);
  const [tester, setTester] = useState("Tester");
  const [testerId, setTesterId] = useState("");
  const [status, setStatus] = useState("Status");
  const [projectTestcases, setProjectTestcases] = useState(
    TESTCASES[projectKey] ? TESTCASES[projectKey] : []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState();
  const dispatch = useDispatch();

  const loadTestcases = useCallback(async () => {
    setError(null);
    setIsRefreshing(true);
    try {
      dispatch(TestCasesActions.fetchTestcase());
    } catch (err) {
      setError(err.message);
    }
    setIsRefreshing(false);
  }, [dispatch, setIsRefreshing, setError]);

  useEffect(() => {
    const willFocusSub = props.navigation.addListener(
      "willFocus",
      loadTestcases
    );

    return () => {
      willFocusSub.remove();
    };
  }, [loadTestcases, props.navigation]);

  useEffect(() => {
    const tempTeam = USERS.filter((item) => {
      const userIndex = TEAM.findIndex((user) => user.userId === item.userId);
      return userIndex >= 0;
    });

    if (tempTeam.length > 0) {
      setTeamUser(tempTeam);
      const nameList = tempTeam.map((item) => item.displayName);
      setFilters([
        ["Status", ...TEST_STATUS],
        ["Tester", ...nameList],
      ]);
    }
  }, [TEAM, USERS]);

  useEffect(() => {
    setIsLoading(true);
    loadTestcases().then(() => {
      filterTestcaseList();
      setIsLoading(false);
    });
  }, [dispatch, loadTestcases]);

  useEffect(() => {
    if (error) {
      Alert.alert("An error occured", error, [{ text: "Okay" }]);
    }
  }, [error]);

  useEffect(() => {
    props.navigation.setParams({
      currUserRole: currUserRole,
    });
  }, [currUserRole]);

  const onSelectTestcaseHandler = (key) => {
    props.navigation.navigate("TestCase", {
      testcaseKey: key,
    });
  };

  const filterTestcaseList = useCallback(() => {
    if (TESTCASES) {
      const tempList = TESTCASES[projectKey] ? TESTCASES[projectKey] : [];
      setProjectTestcases(
        tempList.filter((item) => {
          let compareStatus =
            status === "Status" ? true : item.status === status;
          let compareTester =
            tester === "Tester" ? true : item.tester === testerId;

          return compareStatus && compareTester;
        })
      );
    }
  }, [status, TESTCASES, projectKey, teamUser, tester]);

  useEffect(() => {
    filterTestcaseList();
  }, [filterTestcaseList, status, TESTCASES, projectKey]);

  const renderTestcaseItem = (itemData) => {
    return (
      <TestCaseItem
        testcase={itemData.item}
        onSelect={onSelectTestcaseHandler}
      />
    );
  };

  return (
    <View style={styles.screen}>
      {isLoading && <LoadingModal />}
      <Text style={styles.title}>TESTCASES</Text>
      <DropdownMenu
        style={styles.dropDown}
        bgColor={"white"}
        data={filters}
        activityTintColor={Colors.primaryColor}
        optionTextStyle={styles.text}
        titleStyle={styles.text}
        maxHeight={300}
        handler={(selection, row) => {
          if (selection === 0) {
            setStatus(filters[selection][row]);
          }
          if (selection === 1) {
            setTester(filters[selection][row]);
            setTesterId(row === 0 ? "" : teamUser[row - 1].userId);
          }
        }}
      >
        <FlatList
          refreshing={isRefreshing}
          onRefresh={loadTestcases}
          style={styles.list}
          data={projectTestcases}
          keyExtractor={(item) => item.key}
          renderItem={renderTestcaseItem}
          ListHeaderComponent={<View></View>}
          ListHeaderComponentStyle={styles.dropdownShadow}
          stickyHeaderIndices={[0]}
          ListEmptyComponent={
            <Text style={styles.emptyComponent}>No Test Case found...</Text>
          }
        />
      </DropdownMenu>
    </View>
  );
};

ProjectTestCasesScreen.navigationOptions = (navData) => {
  const currUserRole = navData.navigation.getParam("currUserRole");
  return {
    headerTitle: navData.navigation.getParam("projectName"),
    headerRight: (
      <HeaderButtons HeaderButtonComponent={HeaderButton}>
        <Item
          title="Add"
          iconName="plus-circle-outline"
          onPress={() => {
            if (currUserRole.toUpperCase() === "SPECTATOR") {
              Alert.alert(
                "Not enough privilege",
                "Spectators are not allow to perform this action",
                [{ text: "Ok" }]
              );
            } else {
              const projectKey = navData.navigation.getParam("projectKey");
              navData.navigation.navigate("AddTestCase", {
                projectKey: projectKey,
              });
            }
          }}
        />
      </HeaderButtons>
    ),
  };
};

const styles = StyleSheet.create({
  screen: {
    width: "100%",
    flex: 1,
    backgroundColor: Colors.bgColor,
  },
  dropDown: {
    width: "100%",
    flex: 1,
  },
  list: {
    width: "100%",
    flex: 1,
    backgroundColor: Colors.bgColor,
  },
  dropdownShadow: {
    width: "100%",
    height: 1,
    backgroundColor: "#fff",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.26,
    elevation: 5,
  },
  title: {
    width: "100%",
    padding: 10,
    fontFamily: "roboto-regular",
    fontSize: 18,
  },
  text: {
    fontFamily: "roboto-regular",
  },
  emptyComponent: {
    fontFamily: "roboto-regular",
    textAlign: "center",
    padding: 10,
  },
});

export default ProjectTestCasesScreen;
