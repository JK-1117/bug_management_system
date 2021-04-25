import React, { useState, useEffect, useCallback } from "react";
import { Text, View, StyleSheet, FlatList, Alert } from "react-native";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import DropdownMenu from "react-native-dropdown-menu";
import { useSelector, useDispatch } from "react-redux";

import Colors from "../../../common/constants/Colors";
import { STATUS } from "../../../common/constants/Status";
import { SEVERITY } from "../../../common/constants/Severity";
import { PRIORITY } from "../../../common/constants/Priority";

import * as BugsActions from "../../../common/store/actions/bugsActions";
import LoadingModal from "../../components/modals/LoadingModal";
import BugItem from "../../components/items/BugItem";
import HeaderButton from "../../components/UI/HeaderButton";

const ProjectBugsScreen = (props) => {
  const currUserRole = useSelector((state) => state.teamReducer.role);
  const projectKey = props.navigation.getParam("projectKey");
  const BUGS = useSelector((state) => state.bugsReducer.projectBugs);
  const filters = [
    ["Status", ...STATUS],
    ["Severity", ...SEVERITY],
    ["Priority", ...PRIORITY],
  ];
  const [status, setStatus] = useState("Status");
  const [severity, setSeverity] = useState("Severity");
  const [priority, setPriority] = useState("Priority");
  const [projectBugs, setProjectBugs] = useState(
    BUGS[projectKey] ? BUGS[projectKey] : []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState();
  const dispatch = useDispatch();

  const loadBugs = useCallback(async () => {
    setError(null);
    setIsRefreshing(true);
    try {
      dispatch(BugsActions.fetchBugs());
    } catch (err) {
      setError(err.message);
    }
    setIsRefreshing(false);
  }, [dispatch, setIsRefreshing, setError]);

  useEffect(() => {
    const willFocusSub = props.navigation.addListener("willFocus", loadBugs);

    return () => {
      willFocusSub.remove();
    };
  }, [loadBugs, props.navigation]);

  useEffect(() => {
    setIsLoading(true);
    loadBugs().then(() => {
      filterBugList();
      setIsLoading(false);
    });
  }, [dispatch, loadBugs]);

  useEffect(() => {
    if (error) {
      Alert.alert("An error occured", error, [{ text: "Okay" }]);
    }
  }, [error]);

  const onSelectBugHandler = (key) => {
    props.navigation.navigate("Bug", {
      bugKey: key,
    });
  };

  useEffect(() => {
    props.navigation.setParams({
      currUserRole: currUserRole,
    });
  }, [currUserRole]);

  const filterBugList = useCallback(() => {
    const tempBugList = BUGS[projectKey] ? BUGS[projectKey] : [];
    setProjectBugs(
      tempBugList.filter((item) => {
        let compareStatus = status === "Status" ? true : item.status === status;
        let compareSeverity =
          severity === "Severity" ? true : item.severity === severity;
        let comparePriority =
          priority === "Priority" ? true : item.priority === priority;

        return compareStatus && compareSeverity && comparePriority;
      })
    );
  }, [status, severity, priority, BUGS]);

  useEffect(() => {
    filterBugList();
  }, [filterBugList, status, severity, priority, BUGS]);

  const renderBugItem = (itemData) => {
    return <BugItem bug={itemData.item} onSelectBug={onSelectBugHandler} />;
  };

  return (
    <View style={styles.screen}>
      {isLoading && <LoadingModal />}
      <Text style={styles.title}>BUGS</Text>
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
          } else if (selection === 1) {
            setSeverity(filters[selection][row]);
          } else if (selection === 2) {
            setPriority(filters[selection][row]);
          }
        }}
      >
        <FlatList
          refreshing={isRefreshing}
          onRefresh={loadBugs}
          style={styles.list}
          data={projectBugs}
          keyExtractor={(item) => item.bugId}
          renderItem={renderBugItem}
          ListHeaderComponent={<View></View>}
          ListHeaderComponentStyle={styles.dropdownShadow}
          stickyHeaderIndices={[0]}
          ListEmptyComponent={
            <Text style={styles.emptyComponent}>No Bugs found...</Text>
          }
        />
      </DropdownMenu>
    </View>
  );
};

ProjectBugsScreen.navigationOptions = (navData) => {
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
              navData.navigation.navigate("AddBug", {
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

export default ProjectBugsScreen;
