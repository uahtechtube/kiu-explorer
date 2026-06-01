import { Stack } from 'expo-router';

export default function AssociationExecLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="dashboard" options={{ headerShown: false }} />
            <Stack.Screen name="finances" options={{ headerShown: false }} />
        </Stack>
    );
}
