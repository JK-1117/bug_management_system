import React from "react";
import { createAppContainer, createSwitchNavigator } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import { createDrawerNavigator } from "react-navigation-drawer";
import { createBottomTabNavigator } from "react-navigation-tabs";
import { createMaterialBottomTabNavigator } from "react-navigation-material-bottom-tabs";
import { createBrowserApp } from "@react-navigation/web";
import { Text, Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import StartupScreen from "../../native/screens/StartupScreen";
import AuthScreen from "../../native/screens/user/AuthScreen";
import ProfileScreen from "../../native/screens/user/ProfileScreen";
import ProjectScreen from "../../native/screens/project/ProjectScreen";
import DashboardScreen from "../../native/screens/dashboard/DashboardScreen";
import FeedsScreen from "../../native/screens/detail/FeedsScreen";
import BugScreen from "../../native/screens/detail/BugScreen";
import TestCaseScreen from "../../native/screens/detail/TestCaseScreen";
import RequirementScreen from "../../native/screens/detail/RequirementScreen";
import ProjectBugsScreen from "../../native/screens/project/ProjectBugsScreen";
import DrawerContentComponent from "../../native/components/UI/DrawerContentComponent";
import Colors from "../../common/constants/Colors";
import AddRequirementScreen from "../../native/screens/forms/AddRequirementScreen";
import AddTestCaseScreen from "../../native/screens/forms/AddTestCaseScreen";
import AddBugScreen from "../../native/screens/forms/AddBugScreen";
import AddProjectScreen from "../../native/screens/forms/AddProjectScreen";
import ProjectHomeScreen from "../../native/screens/project/ProjectHomeScreen";
import ProjectRequirementsScreen from "../../native/screens/project/ProjectRequirementsScreen";
import ProjectTestCasesScreen from "../../native/screens/project/ProjectTestCasesScreen";
import TeamScreen from "../../native/screens/team/TeamScreen";

const defaultStackNavOptions = {
  headerStyle: {
    backgroundColor: Platform.OS === "android" ? Colors.primaryColorDark : "",
  },
  headerTitleStyle: {
    fontFamily: "roboto-black",
  },
  headerBackTitleStyle: {
    fontFamily: "roboto-black",
  },
  headerTintColor:
    Platform.OS === "android" ? "white" : Colors.primaryColorDark,
  //   headerTintColor: Colors.primaryColorDark
};

// const accentStackNavOptions = {
//   headerStyle: {
//     backgroundColor: Platform.OS === "android" ? Colors.accentColor : ""
//   },
//   headerTitleStyle: {
//     fontFamily: "roboto-black"
//   },
//   headerBackTitleStyle: {
//     fontFamily: "roboto-black"
//   },
//   headerTintColor: Platform.OS === "android" ? "white" : Colors.accentColor
// };

const ProfileNavigator = createStackNavigator(
  {
    Profile: ProfileScreen,
  },
  { defaultNavigationOptions: defaultStackNavOptions }
);

const DashboardNavigator = createStackNavigator(
  {
    Dashboard: DashboardScreen,
  },
  { defaultNavigationOptions: defaultStackNavOptions }
);

const TeamNavigation = createStackNavigator(
  {
    TeamHome: TeamScreen,
  },
  { defaultNavigationOptions: defaultStackNavOptions }
);

const FeedsNavigator = createStackNavigator(
  {
    Feeds: FeedsScreen,
    AddRequirement: AddRequirementScreen,
    AddTestCase: AddTestCaseScreen,
    AddBug: AddBugScreen,
    AddProject: AddProjectScreen,
    ProjectHome: ProjectHomeScreen,
    ProjectRequirements: ProjectRequirementsScreen,
    ProjectTestCases: ProjectTestCasesScreen,
    ProjectBugs: ProjectBugsScreen,
    Bug: BugScreen,
    Requirement: RequirementScreen,
    TestCase: TestCaseScreen,
  },
  { defaultNavigationOptions: defaultStackNavOptions, cardStyle: { flex: 1 } }
);

const ProjectNavigator = createStackNavigator(
  {
    Project: ProjectScreen,
    AddRequirement: AddRequirementScreen,
    AddTestCase: AddTestCaseScreen,
    AddBug: AddBugScreen,
    AddProject: AddProjectScreen,
    ProjectHome: ProjectHomeScreen,
    ProjectRequirements: ProjectRequirementsScreen,
    ProjectTestCases: ProjectTestCasesScreen,
    ProjectBugs: ProjectBugsScreen,
    Bug: BugScreen,
    Requirement: RequirementScreen,
    TestCase: TestCaseScreen,
  },
  { defaultNavigationOptions: defaultStackNavOptions, cardStyle: { flex: 1 } }
  // { defaultNavigationOptions: accentStackNavOptions }
);

const tabScreenConfig = {
  Feeds: {
    screen: FeedsNavigator,
    navigationOptions: {
      tabBarIcon: (tabInfo) => {
        return (
          <MaterialIcons
            name="notifications-active"
            size={25}
            color={tabInfo.tintColor}
          />
        );
      },
      tabBarColor: Colors.primaryColorDark,
      tabBarLabel:
        Platform.OS === "android" ? (
          <Text style={{ fontFamily: "roboto-black" }}>Feeds</Text>
        ) : (
          "Feeds"
        ),
    },
  },
  Project: {
    screen: ProjectNavigator,
    navigationOptions: {
      tabBarIcon: (tabInfo) => {
        return (
          <MaterialIcons name="folder" size={25} color={tabInfo.tintColor} />
        );
      },
      // tabBarColor: Colors.accentColor,
      tabBarColor: Colors.primaryColorDark,
      tabBarLabel:
        Platform.OS === "android" ? (
          <Text style={{ fontFamily: "roboto-black" }}>Projects</Text>
        ) : (
          "Projects"
        ),
    },
  },
};

const FeedsProjectsNavigator =
  Platform.OS === "android"
    ? createMaterialBottomTabNavigator(tabScreenConfig, {
        activeTintColor: "white",
        shifting: true,
        barStyle: {
          backgroundColor: Colors.primaryColorDark,
        },
      })
    : createBottomTabNavigator(tabScreenConfig, {
        tabBarOptions: {
          labelStyle: {
            fontFamily: "roboto-black",
          },
          // activeTintColor: Colors.accentColor
          activeTintColor: Colors.primaryColorDark,
        },
      });

const MainDrawerNavigator = createDrawerNavigator(
  {
    Home: {
      screen: FeedsProjectsNavigator,
      navigationOptions: {
        drawerIcon: ({ tintColor }) => (
          <MaterialIcons name="home" size={25} color={tintColor} />
        ),
      },
    },
    Dashboard: {
      screen: DashboardNavigator,
      navigationOptions: {
        drawerIcon: ({ tintColor }) => (
          <MaterialIcons name="dashboard" size={25} color={tintColor} />
        ),
      },
    },
    Team: {
      screen: TeamNavigation,
      navigationOptions: {
        drawerIcon: ({ tintColor }) => (
          <MaterialIcons name="people" size={25} color={tintColor} />
        ),
      },
    },
    Profile: ProfileNavigator,
  },
  {
    contentComponent: DrawerContentComponent,
    contentOptions: {
      activeTintColor: Colors.primaryColor,
      // activeTintColor: Colors.accentColorLight,
      labelStyle: {
        fontFamily: "roboto-black",
      },
    },
  }
);

const LoginNavigator = createSwitchNavigator(
  {
    StartupScreen: StartupScreen,
    Auth: AuthScreen,
    Main: MainDrawerNavigator,
  },
  {
    initialRouteName: "StartupScreen",
    cardStyle: { flex: 1 },
  }
);

export default createAppContainer(LoginNavigator);
