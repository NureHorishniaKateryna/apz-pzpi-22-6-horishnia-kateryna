import { useEffect, useState } from 'react';
import {
    Container,
    Title,
    TextInput,
    Switch,
    Button,
    Group,
    Stack, LoadingOverlay,
} from '@mantine/core';
import {useNavigate, useParams} from 'react-router';
import type {User} from "../types.ts";
import {useDisclosure} from "@mantine/hooks";

const generateFakeUser = (id: number): User => ({
    id,
    email: `user${id}@example.com`,
    first_name: `First${id}`,
    last_name: `Last${id}`,
    is_admin: Math.random() < 0.1,
});

const AdminUserDetailPage = () => {
    const { userId } = useParams();
    const [user, setUser] = useState<User | null>(null);
    const [loading, { open: setLoading, close: setNotLoading }] = useDisclosure(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (userId) {
            setUser(generateFakeUser(Number(userId)));
        }
    }, [userId]);

    const handleSave = async () => {
        if (!user) return;
        console.log(user);

        setLoading();
        await new Promise(resolve => setTimeout(resolve, 1000));
        setNotLoading();

    };

    const handleDelete = async () => {
        if (!user) return;
        console.log(user.id);

        setLoading();
        await new Promise(resolve => setTimeout(resolve, 1000));
        setNotLoading();
        navigate("/admin/users");
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
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.currentTarget.value })}
                />
                <TextInput
                    label="First Name"
                    value={user.first_name}
                    onChange={(e) => setUser({ ...user, first_name: e.currentTarget.value })}
                />
                <TextInput
                    label="Last Name"
                    value={user.last_name}
                    onChange={(e) => setUser({ ...user, last_name: e.currentTarget.value })}
                />
                <Switch
                    label="Is Admin"
                    checked={user.is_admin}
                    onChange={(event) => setUser({ ...user, is_admin: event.currentTarget.checked })}
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
