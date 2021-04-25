import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Avatar } from "react-native-elements";

import Colors from "../../../common/constants/Colors";
import * as Util from "../../../common/utils/Util";

const UserAvatar = props => {
  
  return (
    <Avatar
      size="medium"
      title={Util.getInitials(props.name)}
      rounded
      activeOpacity={0.7}
      overlayContainerStyle={{
        backgroundColor: Colors.primaryColorDark
      }}
      containerStyle={styles.avatar}
      onPress={() => {}}
    />
  );
};

const styles = StyleSheet.create({
  avatar: {
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.26,
    elevation: 5,
    backgroundColor: "white",
    margin: 2
  }
});

export default UserAvatar;
