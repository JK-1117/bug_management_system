import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Platform,
  TouchableWithoutFeedback
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import * as Util from "../../../common/utils/Util";

const DateInput = props => {
  const [show, setShow] = useState(false);
  const [date, setDate] = useState(props.value);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;

    setShow(false);
    setDate(currentDate);
    props.onDateChange(currentDate);
  };


  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback
        onPress={() => {
          setShow(true);
        }}
      >
        <View style={styles.field}>
          <View style={styles.icon}>
            <MaterialCommunityIcons name="calendar" size={20} />
          </View>
          <Text style={styles.text}>{Util.formatDate(date)}</Text>
        </View>
      </TouchableWithoutFeedback>
      {show && (
        <DateTimePicker
          value={props.value}
          mode="date"
          is24Hour={props.is24Hour}
          display={props.display}
          minimumDate={props.minimumDate}
          onChange={onChange}
        />
      )}
    </View>
  );
};

DateInput.defaultProps = {
  value: new Date(),
  is24Hour: true,
  display: "default",
  minimumDate: new Date(1950, 0, 1),
  onDateChange: null
};

const styles = StyleSheet.create({
  container: {
    borderColor: "grey",
    borderWidth: 1
  },
  field: {
    flexDirection: "row",
    padding: 5
  },
  icon: {
    marginRight: 5
  },
  text: {
    fontFamily: "roboto-regular"
  }
});

export default DateInput;
