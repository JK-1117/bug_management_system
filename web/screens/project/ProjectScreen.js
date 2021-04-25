import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
  useLocation,
  useHistory,
} from "react-router-dom";

import Project from "../../../common/models/Project";

import ProjectHomeScreen from "./ProjectHomeScreen";
import AddProjectScreen from "../forms/AddProjectScreen";

const ProjectScreen = (props) => {
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    props.setIsLoading(true);
    props.loadFeeds().then(() => {
      props.setIsLoading(false);
    });
  }, [props.loadFeeds]);

  const navigate = (path, params) => {
    props.setParams(params);
    history.push(path);
  };

  const commonProps = {
    setIsLoading: props.setIsLoading,
    alert: props.alert,
    loadFeeds: props.loadFeeds,
    setParams: props.setParams,
    params: props.params,
    query: props.query,
    navigate: navigate,
  };

  const routes = [
    {
      path: `${location.pathname}/`,
      exact: true,
      displayName: "Project",
      component: <ProjectHomeScreen {...commonProps} />,
    },
    {
      path: `${location.pathname}/AddProject`,
      exact: true,
      displayName: "Add Project",
      component: <AddProjectScreen {...commonProps} />,
    },
  ];

  return (
    <Router>
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
    </Router>
  );
};

const styles = StyleSheet.create({});

export default ProjectScreen;
