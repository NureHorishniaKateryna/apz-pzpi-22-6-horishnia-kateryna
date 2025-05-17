import {useEffect, useState} from 'react';
import {Button, Container, Group, LoadingOverlay, Stack, Switch, TextInput, Title,} from '@mantine/core';
import {useNavigate, useParams} from 'react-router';
import {useDisclosure} from "@mantine/hooks";
import {useDispatch, useSelector} from "react-redux";
import type {AppDispatch, RootState} from "../store.ts";
import {unwrapResult} from "@reduxjs/toolkit";
import {deleteUser, editUser, fetchUser} from '../reducers/admin_users_reducer.ts';
import type {User} from "../types.ts";

const AdminUserDetailPage = () => {
    const { userId } = useParams();
    const dispatch: AppDispatch = useDispatch();
    const user = useSelector((state: RootState) => state.admin_users.current);

    const [userFirst, setUserFirst] = useState("");
    const [userLast, setUserLast] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [userIsAdmin, setUserIsAdmin] = useState(false);

    const [loading, { open: setLoading, close: setNotLoading }] = useDisclosure(false);
    const navigate = useNavigate();

    const setUserMaybe = (user: User | null) => {
        setNotLoading();
        if(user === null) return;

        setUserFirst(user.first_name);
        setUserLast(user.last_name);
        setUserEmail(user.email);
        setUserIsAdmin(user.is_admin);
    }

    useEffect(() => {
        if (userId) {
            setLoading();
            dispatch(fetchUser(Number(userId)))
                .then(unwrapResult)
                .then(({result}) => setUserMaybe(result));
        }
    }, [userId]);

    const handleSave = () => {
        if (!user) return;

        setLoading();
        dispatch(editUser({
            userId: Number(userId),
            firstName: userFirst,
            lastName: userLast,
            email: userEmail,
            isAdmin: userIsAdmin,
        }))
            .then(unwrapResult)
            .then(({result}) => setUserMaybe(result));
    };

    const handleDelete = () => {
        if (!user) return;

        setLoading();
        dispatch(deleteUser(Number(userId)))
            .then(unwrapResult)
            .then(({result}) => result && navigate("/admin/users"));
    };

    if (!user) return null;

    return (
        <Container size="sm" py="md">
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

            <Title order={2} mb="md">Manage User</Title>
            <Stack>
                <TextInput label="User ID" value={user.id} disabled />
                <TextInput
                    label="Email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.currentTarget.value)}
                />
                <TextInput
                    label="First Name"
                    value={userFirst}
                    onChange={(e) => setUserFirst(e.currentTarget.value)}
                />
                <TextInput
                    label="Last Name"
                    value={userLast}
                    onChange={(e) => setUserLast(e.currentTarget.value)}
                />
                <Switch
                    label="Is Admin"
                    checked={userIsAdmin}
                    onChange={(event) => setUserIsAdmin(event.currentTarget.checked)}
                />
                <Group mt="md">
                    <Button onClick={handleSave}>Save</Button>
                    <Button color="red" variant="outline" onClick={handleDelete}>Delete</Button>
                </Group>
            </Stack>
        </Container>
    );
};

export default AdminUserDetailPage;
