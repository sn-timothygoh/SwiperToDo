import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  View,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';
import Header from './src/header';
// import Config from './src/config';
import {SwipeListView} from 'react-native-swipe-list-view';
import Icon from 'react-native-vector-icons/FontAwesome';
import {SearchBar} from 'react-native-elements';

const useDebounce = (value, delay) => {
  const [debounceValue, setDebounceValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounceValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debounceValue;
};

const ToDoApp = () => {
  const [taskList, setTaskList] = React.useState('');
  const [data, setData] = React.useState([]);
  const [itemId, setItemId] = useState(null);
  const [toggle, setToggle] = useState(true);
  const [query, setQuery] = useState('');
  const debounceQuery = useDebounce(query, 0);
  const [calcUndone, setUndone] = useState(0);
  const [retrievePermit, setRetrievePermit] = useState(true);
  const [typeCheck, setTypeCheck] = useState('');
  const [check, setCheck] = useState('');

  useEffect(() => {
    if (retrievePermit) {
      setRetrievePermit(false);
      retrieveData();
    }
    taskCounter();
  }, [data]);

  useEffect(() => {
    const searchItem = data
      .filter(item => item.taskList.includes(debounceQuery.toLowerCase()))
      .map(item => ({
        ...item,
        rank: item.taskList.indexOf(debounceQuery.toLowerCase()),
      }))
      .sort((a, b) => a.rank - b.rank);

    // retrieveData().then(() => setData(searchItem));
    setData(searchItem);
    if (!debounceQuery) {
      setRetrievePermit(true);
    }
  }, [debounceQuery]);

  const saveData = async () => {
    if (taskList !== null && taskList !== '') {
      let task = {
        taskList,
        isComplete: false,
        isImportant: false,
        key: Math.random(),
      };

      const arrTask = [task];
      const storedData = await AsyncStorage.getItem('task');
      const parseData = JSON.parse(storedData);
      setData(parseData);

      let newData = [];

      if (storedData === null) {
        // save
        await AsyncStorage.setItem('task', JSON.stringify(arrTask));
      } else {
        newData = [...parseData, task];
        await AsyncStorage.setItem('task', JSON.stringify(newData));
      }
      setTaskList('');
    }
    retrieveData();
  };

  const retrieveData = async () => {
    try {
      const valueString = await AsyncStorage.getItem('task');
      const value = JSON.parse(valueString);
      setData(value);
    } catch (error) {
      console.log('That did not go well.');
      throw error;
    }
  };

  const taskCounter = async () => {
    let count = 202;
    let size = data.filter(item => !item.isComplete).length;
    setUndone(size);
  };

  // delete data
  const clearData = async id => {
    if (data !== null) {
      const newData = data.filter((_, index) => index !== id);
      setData(newData);
      await AsyncStorage.setItem('task', JSON.stringify(newData));
    }
    retrieveData();
  };

  // mark priority
  // const highlightData = async id => {
  //   if (data !== null) {
  //     const highlightedData = data.map((item, index) => {
  //       if (index === id) {
  //         item.show = !item.show;
  //       }
  //       return item;
  //     });
  //     setData(highlightedData);
  //     await AsyncStorage.setItem('task', JSON.stringify(highlightedData));
  //   }
  // };

  const changeData = async (id, rowMap, rowKey) => {
    setToggle(false);
    closeRow(rowMap, rowKey);
    const changedData = data.map((item, index) => {
      if (index === id) {
        setTaskList(item.taskList);
      }
      return item;
    });

    setData(changedData);
    setItemId(id);
    await AsyncStorage.setItem('task', JSON.stringify(changedData));
    retrieveData();
  };

  // mark task as done
  const markTaskDone = async (id, rowMap, rowKey) => {
    closeRow(rowMap, rowKey);
    if (data[id].isComplete == false) {
      data[id].isComplete = true;
    } else {
      data[id].isComplete = false;
    }
    await AsyncStorage.setItem('task', JSON.stringify(data));
    retrieveData();
  };

  const markImportant = async (id, rowMap, rowKey) => {
    closeRow(rowMap, rowKey);
    if (data[id].isImportant == false) {
      data[id].isImportant = true;
    } else {
      data[id].isImportant = false;
    }
    await AsyncStorage.setItem('task', JSON.stringify(data));
    retrieveData();
  };

  // modify data
  const updateData = async () => {
    setToggle(true);
    data[itemId].taskList = taskList;
    await AsyncStorage.setItem('task', JSON.stringify(data));
    setTaskList('');
    Keyboard.dismiss();
    retrieveData();
  };

  const closeRow = (rowMap, rowKey) => {
    if (rowMap[rowKey]) {
      rowMap[rowKey].closeRow();
    }
  };

  const renderItem = data => (
    <TouchableHighlight
      style={[
        data.item.isImportant && !data.item.isComplete
          ? styles.impRowFront
          : [data.item.isComplete ? styles.comRowFront : styles.defRowFront],
      ]}
      underlayColor={'#FFF'}>
      <View>
        <Text
          style={{
            textDecorationLine: data.item.isComplete ? 'line-through' : 'none',
            padding: 30,
            fontSize: 18,
          }}>
          {data.item.taskList}
        </Text>
      </View>
    </TouchableHighlight>
  );

  const renderHiddenItem = (data, rowMap) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={[styles.backLeftBtn, styles.backLeftBtnLeft]}
        onPress={() => {
          markTaskDone(data.index, rowMap, data.item.key);
        }}>
        <Icon name="check" size={20} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.backLeftBtn, styles.backLeftBtnRight]}
        onPress={() => {
          markImportant(data.index, rowMap, data.item.key);
        }}>
        <Icon name="star" size={20} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnLeft]}
        onPress={() => changeData(data.index, rowMap, data.item.key)}>
        <Icon name="edit" size={20} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnRight]}
        onPress={() => {
          clearData(data.index);
        }}>
        <Icon name="remove" size={20} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header />
      <SearchBar
        placeholder="Search..."
        onChangeText={setQuery}
        value={query}
      />
      <TouchableOpacity>
        <Text
          style={{
            fontSize: 20,
            right: 0,
            paddingLeft: 20,
            marginTop: 10,
            marginBottom: 10,
          }}>
          {' '}
          {calcUndone} 个未完成事件
        </Text>
      </TouchableOpacity>

      <SwipeListView
        data={data}
        renderItem={renderItem}
        renderHiddenItem={renderHiddenItem}
        leftOpenValue={120}
        rightOpenValue={-120}
        style={{
          backgroundColor: '#FFF',
          marginBottom: 60,
        }}
      />

      <KeyboardAvoidingView
        style={styles.footer}
        behavior="margin"
        enabled={true}>
        <View style={styles.footerInner}>
          <TouchableOpacity
            style={styles.btn}
            onPress={toggle ? saveData : updateData}>
            <Text style={styles.btnText}>+</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            placeholder={'Create new task...'}
            placeholderTextColor={'rgba(255, 255, 255, .7)'}
            value={taskList}
            onChangeText={text => setTaskList(text)}
            onSubmitEditing={toggle ? saveData : updateData}
            returnKeyLabel="done"
            returnKeyType="done"
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  defRowFront: {
    alignItems: 'center',
    backgroundColor: '#EEE',
    borderBottomColor: '#777',
    borderBottomWidth: 1,
    justifyContent: 'center',
  },
  comRowFront: {
    alignItems: 'center',
    backgroundColor: '#AAA',
    borderBottomColor: '#777',
    borderBottomWidth: 1,
    justifyContent: 'center',
  },

  impRowFront: {
    alignItems: 'center',
    backgroundColor: '#FCA',
    borderBottomColor: '#777',
    borderBottomWidth: 1,
    justifyContent: 'center',
  },

  rowBack: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
  },

  row: {
    padding: 10,
    flexDirection: 'row',
  },

  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    top: 0,
    width: 60,
    justifyContent: 'center',
    position: 'absolute',
  },
  backRightBtnLeft: {
    backgroundColor: 'yellow',
    right: 60,
  },

  backRightBtnRight: {
    backgroundColor: 'red',
    right: 0,
  },

  backLeftBtn: {
    alignItems: 'center',
    bottom: 0,
    top: 0,
    width: 60,
    left: 0,
    justifyContent: 'center',
    position: 'absolute',
  },

  backLeftBtnLeft: {
    backgroundColor: 'green',
    left: 0,
  },

  backLeftBtnRight: {
    backgroundColor: 'teal',
    left: 60,
  },

  trash: {
    height: 25,
    width: 25,
  },
  footer: {
    position: 'absolute',
    width: '100%',
    height: 60,
    bottom: 0,
    flex: 1,
  },
  footerInner: {
    position: 'relative',
    width: '100%',
    height: '100%',
    bottom: 0,
  },
  btn: {
    zIndex: 1,
    position: 'absolute',
    right: 20,
    top: 15,
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#262526',
  },
  btnText: {
    color: '#fff',
    fontSize: 20,
  },
  textInput: {
    zIndex: 0,
    flex: 1,
    padding: 20,
    fontSize: 16,
    color: '#fff',
    backgroundColor: '#262526',
  },
  end: {
    backgroundColor: '#123456',
  },
});

export default ToDoApp;
console.disableYellowBox = 'true';
