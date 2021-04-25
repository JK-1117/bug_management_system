import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Button } from "react-native";
import SafeAreaView from "react-native-safe-area-view";
import { LinearGradient } from "expo-linear-gradient";
import { DrawerNavigatorItems } from "react-navigation-drawer";
import { Avatar } from "react-native-elements";
import { useSelector, useDispatch } from "react-redux";

import Colors from "../../../common/constants/Colors";
import * as Util from "../../../common/utils/Util";
import * as authActions from "../../../common/store/actions/authActions";

const DrawerContentComponent = props => {
  const user = useSelector(state => state.authReducer.user);
  const idToken = useSelector(state => state.authReducer.token);
  const dispatch = useDispatch();
  const { items, ...rest } = props;
  const filteredItems = items.filter(item => item.key !== "Profile");
  
  return (
    <View style={styles.container}>
      <ScrollView>
        <SafeAreaView
          forceInset={{ top: "always", horizontal: "never", bottom: "never" }}
        >
          <LinearGradient
            colors={[Colors.primaryColorLight, Colors.primaryColorDark]}
            style={styles.profileContainer}
          >
            <Avatar
              size="large"
              title={Util.getInitials(
                user.displayName ? user.displayName : user.email
              )}
              key={new Date().getTime()}
              source={
                user.photoUrl
                  ? {
                      uri: user.photoUrl
                    }
                  : null
              }
              rounded
              showEditButton={true}
              activeOpacity={0.7}
              containerStyle={styles.avatar}
              onEditPress={() => {
                props.navigation.navigate("Profile");
              }}
            />
            <Text style={styles.profile}>
              {user.displayName ? user.displayName : user.email}
            </Text>
          </LinearGradient>
          <DrawerNavigatorItems items={filteredItems} {...rest} />
        </SafeAreaView>
      </ScrollView>
      <View style={styles.footerContainer}>
        <Button
          title="Logout"
          color={Colors.primaryColor}
          onPress={() => {
            dispatch(authActions.logout());
            props.navigation.navigate("Auth");
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  profileContainer: {
    height: 150,
    // backgroundColor: Colors.primaryColor,
    // backgroundColor: Colors.accentColorLight,
    justifyContent: "flex-end",
    padding: 15
  },
  profile: {
    fontFamily: "roboto-black",
    color: "white",
    fontSize: 18,
    marginVertical: 10
  },
  avatar: {
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.26,
    elevation: 5,
    backgroundColor: "white"
  },
  footerContainer: {
    padding: 20
  }
});

export default DrawerContentComponent;
