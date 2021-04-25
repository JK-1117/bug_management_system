import React, { useState, useEffect, useCallback } from "react";
import { Text, View, StyleSheet, FlatList, Alert } from "react-native";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import DropdownMenu from "react-native-dropdown-menu";
import { useSelector, useDispatch } from "react-redux";

import Colors from "../../../common/constants/Colors";
import { PRIORITY } from "../../../common/constants/Priority";

import * as RequirementsActions from "../../../common/store/actions/requirementsActions";
import RequirementItem from "../../components/items/RequirementItem";
import LoadingModal from "../../components/modals/LoadingModal";
import HeaderButton from "../../components/UI/HeaderButton";

const ProjectRequirementsScreen = (props) => {
  const currUserRole = useSelector((state) => state.teamReducer.role);
  const projectKey = props.navigation.getParam("projectKey");
  const REQUIREMENTS = useSelector(
    (state) => state.requirementsReducer.projectRequirements
  );
  const filters = [["Priority", ...PRIORITY]];
  const [priority, setPriority] = useState("Priority");
  const [projectRequirements, setProjectRequirements] = useState(
    REQUIREMENTS[projectKey] ? REQUIREMENTS[projectKey] : []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState();
  const dispatch = useDispatch();

  const loadRequirements = useCallback(async () => {
    setError(null);
    setIsRefreshing(true);
    try {
      dispatch(RequirementsActions.fetchRequirements());
    } catch (err) {
      setError(err.message);
    }
    setIsRefreshing(false);
  }, [dispatch, setIsRefreshing, setError]);

  useEffect(() => {
    const willFocusSub = props.navigation.addListener(
      "willFocus",
      loadRequirements
    );

    return () => {
      willFocusSub.remove();
    };
  }, [loadRequirements, props.navigation]);

  useEffect(() => {
    setIsLoading(true);
    loadRequirements().then(() => {
      filterRequirementList();
      setIsLoading(false);
    });
  }, [dispatch, loadRequirements]);

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

  const onSelectRequirementHandler = (key) => {
    props.navigation.navigate("Requirement", {
      requirementKey: key,
    });
  };

  const filterRequirementList = useCallback(() => {
    if (REQUIREMENTS) {
      const tempList = REQUIREMENTS[projectKey] ? REQUIREMENTS[projectKey] : [];
      setProjectRequirements(
        tempList.filter((item) => {
          return priority === "Priority"
            ? true
            : item.requirementPriority === priority;
        })
      );
    }
  }, [priority, REQUIREMENTS, projectKey]);

  useEffect(() => {
    filterRequirementList();
  }, [filterRequirementList, priority, REQUIREMENTS, projectKey]);

  const renderRequirementItem = (itemData) => {
    return (
      <RequirementItem
        requirement={itemData.item}
        onSelect={onSelectRequirementHandler}
      />
    );
  };

  return (
    <View style={styles.screen}>
      {isLoading && <LoadingModal />}
      <Text style={styles.title}>REQUIREMENTS</Text>
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
            setPriority(filters[selection][row]);
          }
        }}
      >
        <FlatList
          refreshing={isRefreshing}
          onRefresh={loadRequirements}
          style={styles.list}
          data={projectRequirements}
          keyExtractor={(item) => item.key}
          renderItem={renderRequirementItem}
          ListHeaderComponent={<View></View>}
          ListHeaderComponentStyle={styles.dropdownShadow}
          stickyHeaderIndices={[0]}
          ListEmptyComponent={
            <Text style={styles.emptyComponent}>No Requirements found...</Text>
          }
        />
      </DropdownMenu>
    </View>
  );
};

ProjectRequirementsScreen.navigationOptions = (navData) => {
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
              navData.navigation.navigate("AddRequirement", {
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

export default ProjectRequirementsScreen;
