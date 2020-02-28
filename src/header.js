import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export default class Header extends React.Component {
  render() {
    return (
      <View style={styles.header}>
        <Text style={styles.text}>ToDo Mou</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    height: '10%',
    borderBottomWidth: 3,
    borderBottomColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#262526',
  },
  text: {
    fontSize: 18,
    letterSpacing: 1.4,
    fontWeight: 'bold',
    color: '#eee',
  },
});
