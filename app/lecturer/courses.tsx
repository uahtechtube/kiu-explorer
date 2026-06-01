import React from 'react';
import { Redirect } from 'expo-router';

export default function LecturerCoursesRedirect() {
    return <Redirect href="/lecturer/dashboard" />;
}
