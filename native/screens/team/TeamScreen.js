import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ScrollView,
  SectionList
} from "react-native";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import { useDispatch, useSelector } from "react-redux";

import Colors from "../../../common/constants/Colors";
import HeaderButton from "../../components/UI/HeaderButton";
import TeamItem from "../../components/items/TeamItem";
import * as TeamActions from "../../../common/store/actions/teamActions";
import * as AuthActions from "../../../common/store/actions/authActions";
import LoadingModal from "../../components/modals/LoadingModal";
import TeamEditModal from "../../components/modals/TeamEditModal";
import AddUserModal from "../../components/modals/AddUserModal";
import EditRoleModal from "../../components/modals/EditRoleModal";
import RemoveUserModal from "../../components/modals/RemoveUserModal";

const TeamScreen = props => {
  const currUserRole = useSelector(state => state.teamReducer.role);
  const TEAMUSER = useSelector(state => state.teamReducer.teamUser);

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState();
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [addUser, setAddUser] = useState(false);
  const [editRole, setEditRole] = useState(false);
  const [removeUser, setRemoveUser] = useState(false);
  const [ADMIN, setAdmin] = useState([]);
  const [DEVELOPER, setDeveloper] = useState([]);
  const [SPECTATOR, setSpector] = useState([]);

  const dispatch = useDispatch();

  const fetchTeam = useCallback(async () => {
    setError(null);
    setIsRefreshing(true);
    try {
      await dispatch(TeamActions.fetchTeam());
    } catch (err) {
      setError(err.message);
    }
    setIsRefreshing(false);
  }, [dispatch, setError, setIsRefreshing]);

  useEffect(() => {
    const willFocusSub = props.navigation.addListener("willFocus", fetchTeam);

    return () => {
      willFocusSub.remove();
    };
  }, [fetchTeam]);

  useEffect(() => {
    setIsLoading(true);
    fetchTeam().then(async () => {
      await dispatch(AuthActions.fetchUserList());
      setIsLoading(false);
    });
  }, [fetchTeam, dispatch, setIsLoading]);

  useEffect(() => {
    props.navigation.setParams({
      setShowTeamModal: setShowTeamModal
    });
  }, [setShowTeamModal]);

  useEffect(() => {
    setAdmin(TEAMUSER.filter(item => item.role.toLowerCase() === "admin"));
    setDeveloper(
      TEAMUSER.filter(item => item.role.toLowerCase() === "developer")
    );
    setSpector(
      TEAMUSER.filter(item => item.role.toLowerCase() === "spectator")
    );
  }, [TEAMUSER]);

  useEffect(() => {
    if (error) {
      Alert.alert("An error occured", error, [{ text: "Okay" }]);
    }
  }, [error]);

  const renderTeamItem = itemData => {
    return <TeamItem userId={itemData.item.userId} />;
  };

  const renderSectionHeader = sectionData => {
    return (
      <View
        style={styles.sectionHeader}
        key={sectionData.section.title + new Date().getTime()}
      >
        <Text style={styles.title}>{sectionData.section.title}</Text>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      {isLoading && <LoadingModal />}
      <TeamEditModal
        currRole={currUserRole}
        visible={showTeamModal}
        toggle={setShowTeamModal}
        addUser={setAddUser}
        editRole={setEditRole}
        removeUser={setRemoveUser}
      />
      <AddUserModal visible={addUser} toggle={setAddUser} />
      <EditRoleModal visible={editRole} toggle={setEditRole} />
      <RemoveUserModal visible={removeUser} toggle={setRemoveUser} />
      <SectionList
        refreshing={isRefreshing}
        onRefresh={fetchTeam}
        style={styles.list}
        keyExtractor={(item, index) => item.userId}
        sections={[
          { title: "Admin", data: ADMIN },
          { title: "Developer", data: DEVELOPER },
          { title: "Spectator", data: SPECTATOR }
        ]}
        renderItem={renderTeamItem}
        renderSectionHeader={renderSectionHeader}
      />
    </View>
  );
};

TeamScreen.navigationOptions = navData => {
  return {
    headerTitle: "Team",
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
          title="Options"
          iconName="dots-vertical"
          onPress={() => {
            navData.navigation.getParam("setShowTeamModal")(true);
          }}
        />
      </HeaderButtons>
    )
  };
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bgColor
  },
  title: {
    width: "100%",
    padding: 10,
    fontFamily: "roboto-regular",
    fontSize: 18
  },
  sectionHeader: {
    borderTopColor: "#fff",
    borderTopWidth: 2,
    borderBottomColor: "#fff",
    borderBottomWidth: 2
  }
});

export default TeamScreen;
