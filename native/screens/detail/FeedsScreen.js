import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  Button,
  Alert,
  ActivityIndicator,
  FlatList,
  TouchableWithoutFeedback,
} from "react-native";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import { useSelector, useDispatch } from "react-redux";

import HeaderButton from "../../components/UI/HeaderButton";
import FeedItem from "../../components/items/FeedItem";
import SearchModal from "../../components/modals/SearchModal";
import AddModal from "../../components/modals/AddModal";
import LoadingModal from "../../components/modals/LoadingModal";

import Colors from "../../../common/constants/Colors";
import * as FeedsActions from "../../../common/store/actions/feedsActions";
import * as TeamActions from "../../../common/store/actions/teamActions";
import * as AuthActions from "../../../common/store/actions/authActions";
import * as ProjectsActions from "../../../common/store/actions/projectsActions";
import * as BugsActions from "../../../common/store/actions/bugsActions";
import * as RequirementsActions from "../../../common/store/actions/requirementsActions";
import * as TestCasesActions from "../../../common/store/actions/testCasesActions";

const FeedsScreen = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState();
  const userId = useSelector((state) => state.authReducer.user.userId);
  const invitation = useSelector((state) => state.teamReducer.teamInvitation);
  const FEEDS = useSelector((state) => state.feedsReducer.feeds);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [listData, setListData] = useState(FEEDS);

  const dispatch = useDispatch();
  const loadFeeds = useCallback(async () => {
    setError(null);
    setIsRefreshing(true);
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
    setIsRefreshing(false);
  }, [dispatch, setIsRefreshing, setError]);

  useEffect(() => {
    const willFocusSub = props.navigation.addListener("willFocus", loadFeeds);

    return () => {
      willFocusSub.remove();
    };
  }, [loadFeeds, props.navigation]);

  useEffect(() => {
    setIsLoading(true);
    loadFeeds().then(() => {
      setListData(FEEDS);
      setIsLoading(false);
    });

    props.navigation.setParams({
      searchModal: setShowSearchModal,
      addModal: setShowAddModal,
    });
  }, [dispatch, loadFeeds]);

  useEffect(() => {
    if (invitation) {
      setError(null);
      setIsLoading(true);
      try {
        const confirmInvitation = async () => {
          await dispatch(
            TeamActions.addTeam(invitation.teamId, invitation.role)
          );
        };
        const deleteInvitation = () => {
          dispatch(TeamActions.deleteInvitation());
        };
        const invitationContent = `You got invited by ${invitation.username} as ${invitation.role}. You will be remove from the current team, are you sure you want to take the invitation`;
        Alert.alert("You got an invitation", invitationContent, [
          { text: "Confirm", onPress: confirmInvitation },
          { text: "Reject", onPress: deleteInvitation },
        ]);
      } catch (err) {
        setError(err);
      }
      loadFeeds();
      setIsLoading(false);
    }
  }, [invitation]);

  useEffect(() => {
    setListData(FEEDS);
    filterList(searchQuery);
  }, [FEEDS]);

  useEffect(() => {
    if (error) {
      Alert.alert("An error occured", error, [{ text: "Okay" }]);
    }
  }, [error]);

  const filterList = useCallback(
    (query) => {
      if (query) {
        setListData(
          FEEDS.filter(
            (item) =>
              item.objectiveTitle.toUpperCase().indexOf(query.toUpperCase()) >= 0
          )
        );
      } else {
        setListData(FEEDS);
      }
      setSearchQuery(query);
    },
    [FEEDS, setListData, setSearchQuery]
  );

  const renderFeedItem = (itemData) => {
    return (
      <TouchableWithoutFeedback style={styles.cardContainer}>
        <FeedItem feed={itemData.item} navigation={props.navigation} />
      </TouchableWithoutFeedback>
    );
  };

  if (error) {
    return (
      <View style={styles.screen}>
        <AddModal
          visible={showAddModal}
          toggle={setShowAddModal}
          navigation={props.navigation}
        />
        <SearchModal
          visible={showSearchModal}
          toggle={setShowSearchModal}
          onSearch={filterList}
          query={searchQuery}
        />
        <Text>Something went wrong...</Text>
        <Button
          title="Try Again"
          onPress={loadFeeds}
          color={Colors.primaryColor}
        />
      </View>
    );
  }

  if (!isLoading && listData.length === 0) {
    return (
      <View style={styles.screen}>
        <AddModal
          visible={showAddModal}
          toggle={setShowAddModal}
          navigation={props.navigation}
        />
        <SearchModal
          visible={showSearchModal}
          toggle={setShowSearchModal}
          onSearch={filterList}
          query={searchQuery}
        />
        <Text>No feeds found...</Text>
        <FlatList
          refreshing={isRefreshing}
          onRefresh={loadFeeds}
          style={styles.list}
          data={listData}
          keyExtractor={(item, index) => item.id}
          renderItem={renderFeedItem}
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {isLoading && <LoadingModal />}
      <AddModal
        visible={showAddModal}
        toggle={setShowAddModal}
        navigation={props.navigation}
      />
      <SearchModal
        visible={showSearchModal}
        toggle={setShowSearchModal}
        onSearch={filterList}
        query={searchQuery}
      />
      <FlatList
        refreshing={isRefreshing}
        onRefresh={loadFeeds}
        style={styles.list}
        data={listData}
        keyExtractor={(item, index) => item.id}
        renderItem={renderFeedItem}
      />
    </View>
  );
};

FeedsScreen.navigationOptions = (navData) => {
  return {
    headerTitle: "Feeds",
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
    ),
  };
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    width: "100%",
    padding: 5,
    backgroundColor: Colors.bgColor,
  },
  cardContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default FeedsScreen;
