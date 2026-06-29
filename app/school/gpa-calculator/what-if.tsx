import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Plus, Trash2, HelpCircle, BarChart2, Star, CheckCircle, Info } from 'lucide-react-native';
import api from '../../../lib/api';

interface SimulatedCourse {
    id: number;
    credits: number;
    grade: string;
}

interface SemesterSummary {
    semester: string;
    gpa: number;
    credit_units: number;
    quality_points: number;
    courses_count: number;
}

interface GpaSummary {
    cgpa: number;
    total_credits: number;
    total_quality_points: number;
    classification: string;
    semesters: SemesterSummary[];
}

const GRADES = ['A', 'B', 'C', 'D', 'E', 'F'];
const GRADE_POINTS: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };
const CREDIT_OPTIONS = [1, 2, 3, 4, 5, 6];

export default function GpaWhatIfScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [baseline, setBaseline] = useState<GpaSummary | null>(null);

    // Simulated items
    const [simulatedCourses, setSimulatedCourses] = useState<SimulatedCourse[]>([]);
    const [simCredit, setSimCredit] = useState(3);
    const [simGrade, setSimGrade] = useState('A');

    // Target Calculator states
    const [targetCgpa, setTargetCgpa] = useState('4.50');
    const [remainingCredits, setRemainingCredits] = useState('30');
    const [targetOutput, setTargetOutput] = useState<string | null>(null);
    const [targetPossible, setTargetPossible] = useState<boolean | null>(null);

    const fetchBaseline = async () => {
        try {
            setLoading(true);
            const response = await api.get('/student/gpa/summary');
            setBaseline(response.data);
        } catch (error) {
            console.error('Error fetching baseline GPA summary:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBaseline();
    }, []);

    const handleAddSimulatedCourse = () => {
        const newCourse: SimulatedCourse = {
            id: Date.now(),
            credits: simCredit,
            grade: simGrade,
        };
        setSimulatedCourses([newCourse, ...simulatedCourses]);
    };

    const handleDeleteSimulatedCourse = (id: number) => {
        setSimulatedCourses(simulatedCourses.filter(c => c.id !== id));
    };

    // Calculate projection
    const baselineCredits = baseline?.total_credits ?? 0;
    const baselinePoints = baseline?.total_quality_points ?? 0;

    let simTotalCredits = 0;
    let simTotalPoints = 0;

    simulatedCourses.forEach((c) => {
        simTotalCredits += c.credits;
        simTotalPoints += (GRADE_POINTS[c.grade] * c.credits);
    });

    const projectedCredits = baselineCredits + simTotalCredits;
    const projectedPoints = baselinePoints + simTotalPoints;
    const projectedCgpa = projectedCredits > 0 ? roundDecimal(projectedPoints / projectedCredits, 2) : 0.00;

    const currentCgpa = baseline?.cgpa ?? 0.00;
    const cgpaDiff = projectedCgpa - currentCgpa;

    function roundDecimal(num: number, scale: number) {
        if (!("" + num).includes("e")) {
            return +(Math.round(+(num + "e+" + scale)) + "e-" + scale);
        } else {
            var arr = ("" + num).split("e");
            var sig = ""
            if (+arr[1] + scale > 0) {
                sig = "+";
            }
            return +(Math.round(+(+arr[0] + "e" + sig + (+arr[1] + scale))) + "e-" + scale);
        }
    }

    const getClassification = (gpa: number) => {
        if (gpa >= 4.50) return 'First Class';
        if (gpa >= 3.50) return 'Second Class (Upper)';
        if (gpa >= 2.40) return 'Second Class (Lower)';
        if (gpa >= 1.50) return 'Third Class';
        if (gpa >= 1.00) return 'Pass';
        return 'Fail';
    };

    const calculateTargetTarget = () => {
        const target = parseFloat(targetCgpa);
        const remaining = parseInt(remainingCredits);

        if (isNaN(target) || target < 0 || target > 5.0) {
            Alert.alert('Invalid Input', 'Please enter a valid target CGPA between 0.0 and 5.0');
            return;
        }
        if (isNaN(remaining) || remaining <= 0) {
            Alert.alert('Invalid Input', 'Please enter remaining credit units greater than 0');
            return;
        }

        const currentCredits = baselineCredits;
        const currentPoints = baselinePoints;

        const totalPlannedCredits = currentCredits + remaining;
        const totalNeededPoints = target * totalPlannedCredits;
        const neededFromRemaining = totalNeededPoints - currentPoints;

        if (neededFromRemaining <= 0) {
            setTargetPossible(true);
            setTargetOutput(`You have already surpassed your target! You need an average GPA of 0.00 in your remaining credits to stay above ${target.toFixed(2)}.`);
            return;
        }

        const requiredGpa = neededFromRemaining / remaining;

        if (requiredGpa > 5.0) {
            setTargetPossible(false);
            setTargetOutput(`Mathematically impossible. To reach a CGPA of ${target.toFixed(2)}, you would need an average GPA of ${requiredGpa.toFixed(2)} (maximum possible is 5.00) in your remaining ${remaining} credits.`);
        } else {
            setTargetPossible(true);
            setTargetOutput(`To graduate with a ${target.toFixed(2)} CGPA, you must average at least a GPA of ${requiredGpa.toFixed(2)} (e.g. mostly ${requiredGpa >= 4.0 ? "A's and B's" : requiredGpa >= 3.0 ? "B's and C's" : "C's"}) in your remaining ${remaining} credit units.`);
        }
    };

    useEffect(() => {
        if (baseline) {
            calculateTargetTarget();
        }
    }, [targetCgpa, remainingCredits, baseline]);

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Immersive Header */}
            <View className="bg-primary px-6 pt-6 pb-8 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="text-white/60 text-xs font-bold uppercase tracking-widest">Simulator</Text>
                        <Text className="text-white text-xl font-bold">"What If" Simulator</Text>
                    </View>
                    <View className="w-12" />
                </View>

                {/* CGPA Side-by-Side Comparison */}
                {baseline && (
                    <View className="bg-white rounded-[28px] mt-6 p-5 shadow-xl border border-gray-100">
                        <View className="flex-row justify-around items-center py-2">
                            <View className="items-center flex-1">
                                <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Current CGPA</Text>
                                <Text className="text-primary text-2xl font-black">{currentCgpa.toFixed(2)}</Text>
                                <Text className="text-gray-400 text-[9px] font-bold mt-1 text-center">{getClassification(currentCgpa)}</Text>
                            </View>

                            <View className="w-px h-12 bg-gray-100" />

                            <View className="items-center flex-1">
                                <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Projected CGPA</Text>
                                <Text className="text-secondary text-2xl font-black">{projectedCgpa.toFixed(2)}</Text>
                                <Text className="text-gray-400 text-[9px] font-bold mt-1 text-center">{getClassification(projectedCgpa)}</Text>
                            </View>
                        </View>

                        {/* CGPA Difference Banner */}
                        <View className="border-t border-gray-50 pt-3.5 mt-3.5 items-center">
                            {cgpaDiff > 0 ? (
                                <View className="bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full flex-row items-center">
                                    <Text className="text-emerald-600 font-extrabold text-[10px] uppercase">
                                        Projected Increase: +{cgpaDiff.toFixed(2)} CGPA points 🚀
                                    </Text>
                                </View>
                            ) : cgpaDiff < 0 ? (
                                <View className="bg-red-50 border border-red-150 px-3 py-1.5 rounded-full flex-row items-center">
                                    <Text className="text-red-600 font-extrabold text-[10px] uppercase">
                                        Projected Drop: {cgpaDiff.toFixed(2)} CGPA points ⚠️
                                    </Text>
                                </View>
                            ) : (
                                <Text className="text-gray-400 text-[10px] font-bold uppercase">No hypothetical changes added yet</Text>
                            )}
                        </View>
                    </View>
                )}
            </View>

            <ScrollView className="flex-1 px-6 mt-6" contentContainerStyle={{ paddingBottom: 40 }}>
                {loading ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-10" />
                ) : (
                    <>
                        {/* Simulation Tool Box */}
                        <View className="bg-white rounded-[32px] p-5 border border-gray-100 shadow-sm mb-6">
                            <Text className="text-primary font-black text-xs uppercase tracking-wider mb-4">Add Hypothetical Courses</Text>
                            
                            {/* Credits Choice */}
                            <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mb-2">Credit Units</Text>
                            <View className="flex-row justify-between mb-4">
                                {CREDIT_OPTIONS.map((num) => {
                                    const selected = simCredit === num;
                                    return (
                                        <TouchableOpacity
                                            key={num}
                                            onPress={() => setSimCredit(num)}
                                            className={`w-[14%] aspect-square rounded-xl border items-center justify-center ${selected ? 'bg-primary border-primary' : 'bg-gray-50 border-gray-200'}`}
                                        >
                                            <Text className={`font-bold text-xs ${selected ? 'text-white' : 'text-primary'}`}>{num}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Grade Choice */}
                            <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mb-2">Speculative Grade</Text>
                            <View className="flex-row justify-between mb-5">
                                {GRADES.map((letter) => {
                                    const selected = simGrade === letter;
                                    return (
                                        <TouchableOpacity
                                            key={letter}
                                            onPress={() => setSimGrade(letter)}
                                            className={`w-[14%] aspect-square rounded-xl border items-center justify-center ${selected ? 'bg-primary border-primary' : 'bg-gray-50 border-gray-200'}`}
                                        >
                                            <Text className={`font-bold text-xs ${selected ? 'text-white' : 'text-primary'}`}>{letter}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Add Button */}
                            <TouchableOpacity
                                onPress={handleAddSimulatedCourse}
                                className="bg-primary rounded-2xl py-4 items-center justify-center flex-row shadow-sm"
                            >
                                <Plus size={16} color="white" className="mr-1.5" />
                                <Text className="text-white font-bold text-sm">Add to Simulation</Text>
                            </TouchableOpacity>
                        </View>

                        {/* List of Simulated Classes */}
                        {simulatedCourses.length > 0 && (
                            <View className="mb-6">
                                <Text className="text-primary text-base font-bold mb-3">Simulated List</Text>
                                {simulatedCourses.map((c) => (
                                    <View key={c.id} className="bg-white rounded-[24px] p-4 mb-2.5 border border-gray-100 shadow-sm flex-row items-center justify-between">
                                        <View className="flex-row items-center">
                                            <View className="w-10 h-10 bg-secondary/15 rounded-xl border border-secondary/10 items-center justify-center mr-3">
                                                <Text className="text-primary font-bold text-sm">{c.grade}</Text>
                                            </View>
                                            <View>
                                                <Text className="text-primary font-bold text-sm">Hypothetical Class</Text>
                                                <Text className="text-gray-400 text-[10px]">{c.credits} Credit Units • {GRADE_POINTS[c.grade]} Points</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => handleDeleteSimulatedCourse(c.id)}
                                            className="p-2 bg-red-50 rounded-xl"
                                        >
                                            <Trash2 size={12} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Goal & Target Calculator */}
                        <View className="bg-white rounded-[32px] p-5 border border-gray-100 shadow-sm">
                            <View className="flex-row items-center mb-4">
                                <Star size={16} color="#002147" />
                                <Text className="text-primary font-black text-xs uppercase tracking-wider ml-1.5">Target GPA Calculator</Text>
                            </View>

                            <View className="flex-row space-x-3 mb-4">
                                <View className="flex-1 mr-2">
                                    <Text className="text-gray-400 font-bold text-[9px] uppercase tracking-wider mb-2">Target CGPA</Text>
                                    <TextInput
                                        keyboardType="numeric"
                                        value={targetCgpa}
                                        onChangeText={setTargetCgpa}
                                        placeholder="e.g. 4.50"
                                        className="bg-gray-50 text-primary border border-gray-150 rounded-2xl px-4 h-12 text-sm font-semibold"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-400 font-bold text-[9px] uppercase tracking-wider mb-2">Remaining Credits</Text>
                                    <TextInput
                                        keyboardType="numeric"
                                        value={remainingCredits}
                                        onChangeText={setRemainingCredits}
                                        placeholder="e.g. 45"
                                        className="bg-gray-50 text-primary border border-gray-150 rounded-2xl px-4 h-12 text-sm font-semibold"
                                    />
                                </View>
                            </View>

                            {targetOutput && (
                                <View className={`p-4 rounded-2xl border flex-row items-start ${targetPossible === false ? 'bg-red-50/50 border-red-150' : 'bg-emerald-50/50 border-emerald-200'}`}>
                                    <Info size={16} color={targetPossible === false ? '#EF4444' : '#10B981'} className="mt-0.5 mr-2.5" />
                                    <Text className={`flex-1 font-semibold text-xs leading-5 ${targetPossible === false ? 'text-red-700' : 'text-emerald-800'}`}>
                                        {targetOutput}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
