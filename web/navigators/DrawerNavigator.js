import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
  useLocation,
  useHistory,
} from "react-router-dom";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Searchbar } from "react-native-paper";
import { Avatar } from "react-native-elements";
import { useSelector, useDispatch } from "react-redux";

import Colors from "../../common/constants/Colors";
import * as Util from "../../common/utils/Util";
import * as AuthActions from "../../common/store/actions/authActions";
import * as FeedsActions from "../../common/store/actions/feedsActions";
import * as TeamActions from "../../common/store/actions/teamActions";
import * as ProjectsActions from "../../common/store/actions/projectsActions";
import * as BugsActions from "../../common/store/actions/bugsActions";
import * as RequirementsActions from "../../common/store/actions/requirementsActions";
import * as TestCasesActions from "../../common/store/actions/testCasesActions";

import DashboardScreen from "../screens/dashboard/DashboardScreen";
import TeamScreen from "../screens/team/TeamScreen";
import ProfileScreen from "../screens/user/ProfileScreen";
import HomeScreen from "../screens/detail/HomeScreen";
import RequirementScreen from "../screens/detail/RequirementScreen";
import TestCaseScreen from "../screens/detail/TestCaseScreen";
import BugScreen from "../screens/detail/BugScreen";
import ProjectScreen from "../screens/project/ProjectScreen";
import AddRequirementScreen from "../screens/forms/AddRequirementScreen";
import AddTestCaseScreen from "../screens/forms/AddTestCaseScreen";
import AddBugScreen from "../screens/forms/AddBugScreen";

import WidthModal from "../components/modals/WidthModal";
import LoadingModal from "../components/modals/LoadingModal";
import Alert from "../components/UI/Alert";

const DrawerNavigator = (props) => {
  const user = useSelector((state) => state.authReducer.user);
  const role = useSelector((state) => state.teamReducer.role);
  const [params, setParams] = useState({});
  const [query, setQuery] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [AlertTitle, setAlertTitle] = useState("");
  const [AlertContent, setAlertContent] = useState("");
  const [AlertButtons, setAlertButtons] = useState([]);
  const [error, setError] = useState(null);
  const [width, setWidth] = useState(Dimensions.get("window").width);
  const [contentWidth, setContentWidth] = useState(
    width < 1500 ? "100%" : "90%"
  );
  const invitation = useSelector((state) => state.teamReducer.teamInvitation);
  const teamReducer = useSelector((state) => state.teamReducer);
  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();
  const loadFeeds = useCallback(async () => {
    console.log("loading data...");
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
  let customAlert = null;

  useEffect(() => {
    loadFeeds();
  }, [loadFeeds]);

  const onChange = ({ window, screen }) => {
    setWidth(window.width);
    if (window.width > 1600) {
      setContentWidth("80%");
    }
    if (window.width < 1600) {
      setContentWidth("90%");
    }
    if (window.width < 1500) {
      setContentWidth("100%");
    }
  };

  useEffect(() => {
    Dimensions.addEventListener("change", onChange);
    return () => {
      Dimensions.removeEventListener("change", onChange);
    };
  });

  const alert = (title, content, buttons) => {
    setAlertTitle(title);
    setAlertContent(content);
    setAlertButtons(buttons);
    setShowAlert(true);
  };

  const commonProps = {
    setIsLoading: setIsLoading,
    alert: alert,
    loadFeeds: loadFeeds,
    setParams: setParams,
    params: params,
    query: query,
  };

  const routes = [
    {
      path: "/Home",
      exact: true,
      show: true,
      displayName: "Home",
      component: <HomeScreen {...commonProps} />,
      icon: () => <MaterialIcons name="home" size={25} color="#fff" />,
    },
    {
      path: "/Home/Project",
      exact: false,
      show: true,
      displayName: "Project",
      component: <ProjectScreen {...commonProps} />,
      icon: () => (
        <MaterialCommunityIcons name="folder-open" size={25} color="#fff" />
      ),
    },
    {
      path: "/Home/Team",
      exact: true,
      show: true,
      displayName: "Team",
      component: <TeamScreen {...commonProps} />,
      icon: () => <MaterialIcons name="people" size={25} color="#fff" />,
    },
    {
      path: "/Home/Dashboard",
      exact: true,
      show: true,
      displayName: "Dashboard",
      component: <DashboardScreen {...commonProps} />,
      icon: () => <MaterialIcons name="dashboard" size={25} color="#fff" />,
    },
    {
      path: "/Home/Profile",
      exact: true,
      show: false,
      displayName: "Profile",
      component: <ProfileScreen {...commonProps} />,
      icon: () => (
        <MaterialIcons name="account-circle" size={25} color="#fff" />
      ),
    },
    {
      path: "/Home/Requirement",
      exact: true,
      show: false,
      displayName: "Requirement",
      component: <RequirementScreen {...commonProps} />,
      icon: () => <MaterialIcons name="bulleye-arrow" size={25} color="#fff" />,
    },
    {
      path: "/Home/TestCase",
      exact: true,
      show: false,
      displayName: "Test Case",
      component: <TestCaseScreen {...commonProps} />,
      icon: () => <MaterialIcons name="bulleye-arrow" size={25} color="#fff" />,
    },
    {
      path: "/Home/Bug",
      exact: true,
      show: false,
      displayName: "Bug",
      component: <BugScreen {...commonProps} />,
      icon: () => <MaterialIcons name="bug" size={25} color="#fff" />,
    },
    {
      path: "/Home/AddRequirement",
      exact: true,
      show: false,
      displayName: "Requirement",
      component: <AddRequirementScreen {...commonProps} />,
      icon: () => <MaterialIcons name="bulleye-arrow" size={25} color="#fff" />,
    },
    {
      path: "/Home/AddTestCase",
      exact: true,
      show: false,
      displayName: "Test Case",
      component: <AddTestCaseScreen {...commonProps} />,
      icon: () => <MaterialIcons name="bulleye-arrow" size={25} color="#fff" />,
    },
    {
      path: "/Home/AddBug",
      exact: true,
      show: false,
      displayName: "Bug",
      component: <AddBugScreen {...commonProps} />,
      icon: () => <MaterialIcons name="bug" size={25} color="#fff" />,
    },
  ];

  const confirmInvitation = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await dispatch(TeamActions.addTeam(invitation.teamId, invitation.role));
    } catch (err) {
      setError(err);
    }
    loadFeeds();
    setIsLoading(false);
  };

  const deleteInvitation = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await dispatch(TeamActions.deleteInvitation());
    } catch (err) {
      setError(err);
    }
    loadFeeds();
    setIsLoading(false);
  };

  useEffect(() => {
    const showInvite = () => {
      if (invitation) {
        setError(null);
        alert(
          "You got an invitation",
          `You got invited by ${invitation.username} as ${invitation.role}. You will be remove from the current team, are you sure you want to take the invitation`,
          [
            { text: "Confirm", onPress: confirmInvitation },
            {
              text: "Cancel",
              onPress: deleteInvitation,
              color: Colors.criticalDark,
            },
          ]
        );
      }
    };
    setTimeout(showInvite, 3000);
  }, [invitation]);

  useEffect(() => {
    if (error) {
      props.alert("An error occured", error, [{ text: "Ok" }]);
    }
  }, [error]);

  return (
    <Router>
      {isLoading && <LoadingModal />}
      <View style={styles.screen}>
        {showAlert && (
          <Alert
            show={setShowAlert}
            title={AlertTitle}
            content={AlertContent}
            buttonArray={AlertButtons}
          />
        )}
        {width < 1300 && <WidthModal />}
        <View style={styles.sidebar}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../common/assets/icon.png")}
              style={styles.logo}
            />
            <Text style={styles.logoTitle}>DRAGONFLY</Text>
          </View>
          <View style={{ flex: 1 }}>
            {routes.map((route, index) => {
              if (route.show) {
                return (
                  <NavLink
                    key={index}
                    to={route.path}
                    exact={route.exact}
                    style={{
                      textDecoration: "none",
                    }}
                    activeStyle={{
                      backgroundColor: Colors.accentColor,
                    }}
                  >
                    <View style={styles.navItem}>
                      <route.icon />
                      <Text style={styles.navTitle}>{route.displayName}</Text>
                    </View>
                  </NavLink>
                );
              }
            })}
          </View>

          <TouchableWithoutFeedback
            onPress={() => {
              dispatch(AuthActions.logout());
              history.push("/");
            }}
          >
            <View
              style={[
                styles.navItem,
                { backgroundColor: Colors.criticalLight },
              ]}
            >
              <MaterialIcons name="power-settings-new" size={25} color="#fff" />
              <Text style={styles.navTitle}>LOGOUT</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>

        <View style={styles.mainContainer}>
          <View style={styles.navbar}>
            <View
              style={{
                flexDirection: "row",
                width: contentWidth,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  flex: 1,
                  alignItems: "center",
                }}
              >
                <Switch>
                  {routes.map((route, index) => (
                    <Route
                      key={index}
                      path={route.path}
                      exact={route.exact}
                      children={() => (
                        <Text style={styles.pageTitle}>
                          {route.displayName.toUpperCase()}
                        </Text>
                      )}
                    />
                  ))}
                </Switch>
              </View>
              <View style={styles.userContainer}>
                <Searchbar
                  style={{ marginHorizontal: 20 }}
                  placeholder="Search"
                  value={query}
                  onChangeText={(text) => {
                    setQuery(text);
                  }}
                />
                <Avatar
                  size="medium"
                  title={Util.getInitials(user.displayName)}
                  key={user.displayName}
                  source={
                    user.photoUrl
                      ? {
                          uri: user.photoUrl,
                        }
                      : null
                  }
                  rounded
                  showEditButton={true}
                  activeOpacity={0.7}
                  containerStyle={styles.avatar}
                  onEditPress={() => {
                    history.push("/Home/Profile");
                    history.go();
                  }}
                />
                <View style={styles.user}>
                  <Text style={styles.username}>{user.displayName}</Text>
                  <Text style={styles.role}>{role}</Text>
                </View>
              </View>
            </View>
          </View>
          <View
            style={[
              styles.content,
              {
                width: contentWidth,
              },
            ]}
          >
            <Switch>
              {routes.map((route, index) => (
                <Route
                  key={index}
                  path={route.path}
                  exact={route.exact}
                  children={route.component}
                />
              ))}
            </Switch>
          </View>
        </View>
      </View>
    </Router>
  );
};

const styles = StyleSheet.create({
  screen: {
    flexDirection: "row",
    flex: 1,
    backgroundColor: Colors.bgColor,
  },
  sidebar: {
    width: 250,
    backgroundColor: Colors.primaryColorDark,
    shadowColor: "black",
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 70 },
    shadowOpacity: 0.5,
    elevation: 8,
    zIndex: 8,
  },
  mainContainer: {
    flex: 1,
    alignItems: "center",
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 70,
    backgroundColor: "#fff",
    shadowColor: "black",
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    elevation: 8,
    zIndex: 8,
  },
  content: {
    flex: 1,
    width: "80%",
    padding: 20,
    zIndex: -1,
    overflow: "scroll",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: Colors.bgColor,
    paddingBottom: 2,
  },
  logo: {
    width: 80,
    height: 70,
    marginRight: 20,
  },
  logoTitle: {
    color: Colors.primaryColor,
    fontSize: 20,
    fontWeight: "bold",
  },
  navItem: {
    flexDirection: "row",
    margin: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  navTitle: {
    color: "#fff",
    fontSize: 16,
    marginHorizontal: 10,
  },
  pageTitle: {
    fontSize: 30,
    textAlignVertical: "center",
    paddingHorizontal: 30,
  },
  userContainer: {
    flexDirection: "row",
    padding: 10,
    marginHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  user: {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: 10,
  },
  username: {
    fontSize: 18,
  },
  role: {
    fontSize: 14,
    textTransform: "capitalize",
  },
});

export default DrawerNavigator;
