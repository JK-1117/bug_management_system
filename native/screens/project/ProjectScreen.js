import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  StyleSheet,
  FlatList
} from "react-native";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import { useSelector, useDispatch } from "react-redux";

import Colors from "../../../common/constants/Colors";
import * as ProjectsActions from "../../../common/store/actions/projectsActions";
import * as TestCasesActions from "../../../common/store/actions/testCasesActions";
import * as BugsActions from "../../../common/store/actions/bugsActions";

import HeaderButton from "../../components/UI/HeaderButton";
import ProjectItem from "../../components/items/ProjectItem";
import SearchModal from "../../components/modals/SearchModal";
import AddModal from "../../components/modals/AddModal";
import LoadingModal from "../../components/modals/LoadingModal";

const ProjectScreen = props => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState();

  const PROJECTS = useSelector(state => state.projectsReducer.projects);
  const TESTCASES = useSelector(
    state => state.testCasesReducer.projectTestcases
  );
  const BUGS = useSelector(state => state.bugsReducer.projectBugs);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [listData, setListData] = useState(PROJECTS);
  const [showAddModal, setShowAddModal] = useState(false);

  const dispatch = useDispatch();
  const loadProjects = useCallback(async () => {
    setError(null);
    setIsRefreshing(true);
    try {
      dispatch(ProjectsActions.fetchProjects());
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

    props.navigation.setParams({
      searchModal: setShowSearchModal,
      addModal: setShowAddModal
    });
  }, [dispatch, loadProjects]);

  const filterList = useCallback(
    query => {
      if (query) {
        setListData(
          PROJECTS.filter(
            item =>
              item.projectName.toUpperCase().indexOf(query.toUpperCase()) >= 0
          )
        );
      } else {
        setListData(PROJECTS);
      }
      setSearchQuery(query);
    },
    [PROJECTS, setListData, setSearchQuery]
  );

  const onSelectProject = (id, projectName) => {
    props.navigation.navigate("ProjectHome", {
      id: id,
      projectName: projectName
    });
  };

  useEffect(() => {
    if (error) {
      Alert.alert("An error occured", error, [{ text: "Okay" }]);
    }
  }, [error]);

  const renderProject = itemData => {
    return (
      <ProjectItem
        TESTCASES={TESTCASES}
        BUGS={BUGS}
        project={itemData.item}
        onSelectProject={onSelectProject}
      />
    );
  };

  if (error) {
    return (
      <View style={styles.screen}>
        <SearchModal
          visible={showSearchModal}
          toggle={setShowSearchModal}
          onSearch={filterList}
          query={searchQuery}
        />
        <AddModal
          visible={showAddModal}
          toggle={setShowAddModal}
          navigation={props.navigation}
        />
        <Text>Something went wrong...</Text>
        <Button
          title="Try Again"
          onPress={loadProjects}
          color={Colors.primaryColor}
        />
      </View>
    );
  }

  if (!isLoading && listData.length === 0) {
    return (
      <View style={styles.screen}>
      <SearchModal
        visible={showSearchModal}
        toggle={setShowSearchModal}
        onSearch={filterList}
        query={searchQuery}
      />
        <AddModal
          visible={showAddModal}
          toggle={setShowAddModal}
          navigation={props.navigation}
        />
        <Text>No projects found...</Text>
        <FlatList
          refreshing={isRefreshing}
          onRefresh={loadProjects}
          style={styles.list}
          data={listData}
          keyExtractor={(item, index) => item.id}
          renderItem={renderProject}
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {isLoading && <LoadingModal />}
      <SearchModal
        visible={showSearchModal}
        toggle={setShowSearchModal}
        onSearch={filterList}
        query={searchQuery}
      />
      <AddModal
        visible={showAddModal}
        toggle={setShowAddModal}
        navigation={props.navigation}
      />
      <FlatList
        refreshing={isRefreshing}
        onRefresh={loadProjects}
        style={styles.list}
        data={listData}
        keyExtractor={(item, index) => item.id}
        renderItem={renderProject}
      />
    </View>
  );
};

ProjectScreen.navigationOptions = navData => {
  return {
    headerTitle: "Projects",
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
    headerRight: (
      <HeaderButtons HeaderButtonComponent={HeaderButton}>
        <Item
          title="Add"
          iconName="plus-circle-outline"
          onPress={() => {
            navData.navigation.getParam("addModal")(true);
          }}
        />
        <Item
          title="Search"
          iconName="magnify"
          onPress={() => {
            navData.navigation.getParam("searchModal")(true);
          }}
        />
      </HeaderButtons>
    )
  };
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  list: {
    width: "100%",
    backgroundColor: Colors.bgColor,
    padding: 5
  }
});

export default ProjectScreen;
