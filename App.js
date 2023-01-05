import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    Alert,
    ScrollView,
    Platform,
} from "react-native";
import { Fontisto } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "./colors";

const STORAGE_KEY = "@toDos";

export default function App() {
    const [working, setWorking] = useState(true);
    const [text, setText] = useState("");
    const [toDos, setToDos] = useState({});
    const loadWork = async () => {
        const work = await AsyncStorage.getItem("@work");
        if (work == "work") {
            setWorking(true);
        } else {
            setWorking(false);
        }
    };
    useEffect(() => {
        loadToDos();
        loadWork();
    }, []);
    const travel = () => setWorking(false);
    const work = () => setWorking(true);
    const onChangeWork = async (type) => {
        if (type == "work") {
            setWorking(true);
            await AsyncStorage.setItem("@work", "work");
        } else {
            setWorking(false);
            await AsyncStorage.setItem("@work", "travel");
        }
    };
    const onChangeText = (payload) => setText(payload);
    const onTodoChange = (payload, key) => {
        const newToDos = { ...toDos };
        newToDos[key].text = payload;
        setToDos(newToDos);
        saveToDos(newToDos);
    };
    const saveToDos = async (toSave) => {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    };
    const loadToDos = async () => {
        const s = await AsyncStorage.getItem(STORAGE_KEY);
        if (s) {
            setToDos(JSON.parse(s));
        }
    };
    const addToDo = async () => {
        if (text === "") {
            return;
        }
        const newToDos = {
            ...toDos,
            [Date.now()]: { text, working, complete: false },
        };
        setToDos(newToDos);
        await saveToDos(newToDos);
        setText("");
    };
    const completeToDo = (key) => {
        if (toDos[key].complete == false) {
            const newToDos = { ...toDos };
            newToDos[key].complete = true;
            setToDos(newToDos);
            saveToDos(newToDos);
        } else {
            const newToDos = { ...toDos };
            newToDos[key].complete = false;
            setToDos(newToDos);
            saveToDos(newToDos);
        }
    };
    const deleteToDo = (key) => {
        if (Platform.OS === "web") {
            const ok = confirm("Do you want to delete this To Do?");
            if (ok) {
                const newToDos = { ...toDos };
                delete newToDos[key];
                setToDos(newToDos);
                saveToDos(newToDos);
            }
        } else {
            Alert.alert("Delete To Do", "Are you sure?", [
                { text: "Cancel" },
                {
                    text: "I'm Sure",
                    style: "destructive",
                    onPress: () => {
                        const newToDos = { ...toDos };
                        delete newToDos[key];
                        setToDos(newToDos);
                        saveToDos(newToDos);
                    },
                },
            ]);
        }
    };
    return (
        <View style={styles.container}>
            <StatusBar style="auto" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => onChangeWork("work")}>
                    <Text
                        style={{
                            fontSize: 38,
                            fontWeight: "600",
                            color: working ? "white" : theme.grey,
                        }}
                    >
                        Work
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onChangeWork("travel")}>
                    <Text
                        style={{
                            fontSize: 38,
                            fontWeight: "600",
                            color: !working ? "white" : theme.grey,
                        }}
                    >
                        Travel
                    </Text>
                </TouchableOpacity>
            </View>
            <TextInput
                onSubmitEditing={addToDo}
                onChangeText={onChangeText}
                returnKeyType="done"
                value={text}
                placeholder={
                    working
                        ? "What do you have to do?"
                        : "Where do you want to go?"
                }
                style={styles.input}
            />
            <ScrollView>
                {Object.keys(toDos).map((key) =>
                    toDos[key].working == working ? (
                        <View style={styles.toDo} key={key}>
                            {toDos[key].complete == false ? (
                                <TextInput
                                    style={styles.toDoText}
                                    value={toDos[key].text}
                                    onChangeText={(event) =>
                                        onTodoChange(event, key)
                                    }
                                />
                            ) : (
                                <Text style={styles.toDoTextComplete}>
                                    {toDos[key].text}
                                </Text>
                            )}

                            <View style={styles.control}>
                                <TouchableOpacity
                                    onPress={() => completeToDo(key)}
                                >
                                    <Fontisto
                                        style={styles.check}
                                        name="check"
                                        size={16}
                                        color={theme.grey}
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => deleteToDo(key)}
                                >
                                    <Fontisto
                                        name="trash"
                                        size={18}
                                        color={theme.grey}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : null
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.bg,
        paddingHorizontal: 20,
    },
    header: {
        justifyContent: "space-between",
        flexDirection: "row",
        marginTop: 100,
    },
    input: {
        backgroundColor: "white",
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 30,
        marginVertical: 20,
        fontSize: 18,
    },
    toDo: {
        backgroundColor: theme.toDoBg,
        marginBottom: 10,
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderRadius: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    toDoText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    toDoTextComplete: {
        color: theme.grey,
        fontSize: 16,
        fontWeight: "500",
        textDecorationLine: "line-through",
    },
    control: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    check: {
        paddingHorizontal: 10,
    },
});