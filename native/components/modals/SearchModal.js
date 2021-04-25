import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  FlatList
} from "react-native";
import { Searchbar } from "react-native-paper";
import { useSelector, useDispatch } from "react-redux";

import Colors from "../../../common/constants/Colors";
import * as ProjectsActions from "../../../common/store/actions/projectsActions";

const SearchModal = props => {
  const PROJECTS = useSelector(state => state.projectsReducer.projects);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(ProjectsActions.fetchProjects());
  }, [dispatch]);
  const renderProjectOption = itemData => {
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          props.onSearch(itemData.item.projectName);
          props.toggle(false);
        }}
      >
        <View style={styles.projectContainer}>
          <Text style={styles.projectName}>{itemData.item.projectName}</Text>
        </View>
      </TouchableWithoutFeedback>
    );
  };
  return (
    <Modal transparent={true} visible={props.visible} animationType="fade">
      <TouchableWithoutFeedback
        onPress={() => {
          props.toggle(false);
        }}
      >
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            {/* <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                value={props.query}
                onChangeText={props.onSearch}
                onSubmitEditing={event => {
                  props.onSearch(event.nativeEvent.text);
                  props.toggle(false);
                }}
              />
              <MaterialCommunityIcons name="magnify" color="gray" size={20} />
            </View> */}
            <Searchbar
              placeholder="Search"
              value={props.query}
              onChangeText={props.onSearch}
              onSubmitEditing={event => {
                props.onSearch(event.nativeEvent.text);
                props.toggle(false);
              }}
            />
            {/* <TouchableWithoutFeedback
              onPress={() => {
                props.onSearch("");
              }}
            >
              <Text style={styles.clearText}>Clear</Text>
            </TouchableWithoutFeedback> */}

            <Text style={styles.title}>Projects</Text>
            <FlatList
              data={PROJECTS}
              keyExtractor={item => item.id}
              renderItem={renderProjectOption}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 50,
    backgroundColor: "rgba(0,0,0,0.3)"
  },
  modalContent: {
    width: "100%",
    maxHeight: "70%",
    backgroundColor: Colors.bgColor,
    paddingVertical: 15
  },
  searchContainer: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: "#fff",
    padding: 10
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    fontFamily: "roboto-regular",
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    marginRight: 5
  },
  clearText: {
    color: "blue",
    fontSize: 16,
    fontFamily: "roboto-regular",
    textAlign: "right",
    paddingHorizontal: 10,
    paddingBottom: 10,
    backgroundColor: "#fff"
  },
  title: {
    fontFamily: "roboto-regular",
    fontSize: 20,
    width: "100%",
    textAlignVertical: "bottom",
    padding: 10
  },
  projectContainer: {
    justifyContent: "center",
    padding: 10,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    backgroundColor: "#fff"
  },
  projectName: {
    fontSize: 16,
    fontFamily: "roboto-regular",
    textAlignVertical: "center"
  }
});

export default SearchModal;
